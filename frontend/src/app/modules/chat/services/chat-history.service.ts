import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { ChatSession, BaseAgentEvent, ChatMessage } from '../models/chat-model';
import { UserService } from '../../../shared/services/user.service';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatHistoryService {
  private readonly apiUrl = environment.agentsDirectUrl;
  private chatSessions$ = new BehaviorSubject<ChatSession[]>([]);
  private sessionsCache = new Map<string, ChatSession[]>();

  constructor(
    private userService: UserService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // Verificar si estamos en el navegador
  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /**
   * Obtiene las sesiones de chat para un usuario y agente específico
   */
  getChatSessions(agentId: string): Observable<ChatSession[]> {
    const userId = this.userService.getCurrentUserId();
    const cacheKey = `${userId}_${agentId}`;
    
    // Verificar cache primero
    if (this.sessionsCache.has(cacheKey)) {
      const cachedSessions = this.sessionsCache.get(cacheKey)!;
      this.chatSessions$.next(cachedSessions);
      return this.chatSessions$.asObservable();
    }

    // Si no hay cache, cargar desde localStorage como fallback
    this.loadSessionsFromLocalStorage(userId, agentId);
    return this.chatSessions$.asObservable();
  }

  /**
   * Carga las sesiones desde localStorage
   */
  private loadSessionsFromLocalStorage(userId: string, agentId: string): void {
    if (!this.isBrowser()) {
      this.chatSessions$.next([]);
      return;
    }

    const storageKey = `chat_sessions_${userId}_${agentId}`;
    const storedSessions = localStorage.getItem(storageKey);
    
    if (storedSessions) {
      try {
        const sessions: ChatSession[] = JSON.parse(storedSessions);
        const cacheKey = `${userId}_${agentId}`;
        this.sessionsCache.set(cacheKey, sessions);
        this.chatSessions$.next(sessions);
      } catch (error) {
        console.error('Error parsing stored sessions:', error);
        this.chatSessions$.next([]);
      }
    } else {
      this.chatSessions$.next([]);
    }
  }

  /**
   * Guarda o actualiza una sesión de chat
   */
  saveOrUpdateSession(sessionData: {
    session_id: string;
    agent_id: string;
    user_id: string;
    message?: string;
    messages?: ChatMessage[];
  }): void {
    if (!this.isBrowser()) {
      return;
    }

    const { session_id, agent_id, user_id, message, messages } = sessionData;
    const cacheKey = `${user_id}_${agent_id}`;
    const storageKey = `chat_sessions_${user_id}_${agent_id}`;
    
    // Obtener sesiones actuales
    let sessions = this.sessionsCache.get(cacheKey) || [];
    
    // Buscar si la sesión ya existe
    const existingSessionIndex = sessions.findIndex(s => s.session_id === session_id);
    
    if (existingSessionIndex >= 0) {
      // Actualizar sesión existente
      sessions[existingSessionIndex] = {
        ...sessions[existingSessionIndex],
        updated_at: Date.now(),
        message_count: messages ? messages.length : sessions[existingSessionIndex].message_count + 1,
        last_message: message || sessions[existingSessionIndex].last_message,
        messages: messages || sessions[existingSessionIndex].messages
      };
    } else {
      // Crear nueva sesión
      const newSession: ChatSession = {
        session_id,
        agent_id,
        user_id,
        title: this.generateSessionTitle(message),
        created_at: Date.now(),
        updated_at: Date.now(),
        message_count: messages ? messages.length : 1,
        last_message: message,
        messages: messages || []
      };
      sessions.unshift(newSession); // Añadir al principio para mostrar las más recientes primero
    }

    // Limitar a las últimas 50 sesiones para evitar problemas de rendimiento
    if (sessions.length > 50) {
      sessions = sessions.slice(0, 50);
    }

    // Actualizar cache y localStorage
    this.sessionsCache.set(cacheKey, sessions);
    localStorage.setItem(storageKey, JSON.stringify(sessions));
    this.chatSessions$.next(sessions);
  }

  /**
   * Genera un título para la sesión basado en el primer mensaje
   */
  private generateSessionTitle(message?: string): string {
    if (!message) {
      return `Chat ${new Date().toLocaleDateString()}`;
    }
    
    // Tomar las primeras palabras del mensaje para el título
    const words = message.trim().split(' ').slice(0, 6);
    let title = words.join(' ');
    
    if (words.length >= 6) {
      title += '...';
    }
    
    return title || `Chat ${new Date().toLocaleDateString()}`;
  }

  /**
   * Elimina una sesión específica
   */
  deleteSession(sessionId: string, agentId: string): void {
    if (!this.isBrowser()) {
      return;
    }

    const userId = this.userService.getCurrentUserId();
    const cacheKey = `${userId}_${agentId}`;
    const storageKey = `chat_sessions_${userId}_${agentId}`;
    
    let sessions = this.sessionsCache.get(cacheKey) || [];
    sessions = sessions.filter(s => s.session_id !== sessionId);
    
    this.sessionsCache.set(cacheKey, sessions);
    localStorage.setItem(storageKey, JSON.stringify(sessions));
    this.chatSessions$.next(sessions);
  }

  /**
   * Limpia todas las sesiones para un agente específico
   */
  clearSessions(agentId: string): void {
    if (!this.isBrowser()) {
      return;
    }

    const userId = this.userService.getCurrentUserId();
    const cacheKey = `${userId}_${agentId}`;
    const storageKey = `chat_sessions_${userId}_${agentId}`;
    
    this.sessionsCache.set(cacheKey, []);
    localStorage.removeItem(storageKey);
    this.chatSessions$.next([]);
  }

  /**
   * Obtiene la sesión actual observable
   */
  getCurrentSessions(): Observable<ChatSession[]> {
    return this.chatSessions$.asObservable();
  }

  /**
   * Obtiene los mensajes de una sesión específica
   */
  getSessionMessages(sessionId: string, agentId: string): ChatMessage[] {
    if (!this.isBrowser()) {
      return [];
    }

    const userId = this.userService.getCurrentUserId();
    const cacheKey = `${userId}_${agentId}`;
    const sessions = this.sessionsCache.get(cacheKey) || [];
    
    const session = sessions.find(s => s.session_id === sessionId);
    return session?.messages || [];
  }

  /**
   * Actualiza los mensajes de una sesión específica
   */
  updateSessionMessages(sessionId: string, agentId: string, messages: ChatMessage[]): void {
    if (!this.isBrowser()) {
      return;
    }

    const userId = this.userService.getCurrentUserId();
    this.saveOrUpdateSession({
      session_id: sessionId,
      agent_id: agentId,
      user_id: userId,
      messages: messages,
      message: messages.length > 0 ? messages[messages.length - 1].content : undefined
    });
  }

  /**
   * Registra un mensaje en la sesión actual
   */
  logMessageToSession(event: BaseAgentEvent, message?: string): void {
    // Solo registrar cuando se inicia una nueva conversación o se recibe el primer mensaje del usuario
    if (event.event === 'UserMessage' || event.event === 'RunStarted') {
      this.saveOrUpdateSession({
        session_id: event.session_id,
        agent_id: event.agent_id,
        user_id: this.userService.getCurrentUserId(),
        message: message || event.content
      });
    }
  }
}
