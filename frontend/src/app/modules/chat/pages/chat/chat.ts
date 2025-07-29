import {
  Component,
  inject,
  ChangeDetectorRef,
  type ElementRef,
  ViewChild,
  type AfterViewChecked,
  type OnDestroy,
  input,
  OnInit,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import type { Subscription } from 'rxjs';
import type { ChatMessage, EventType } from './../../models/chat-model';
import { SseService, type StreamResponse } from './../../services/sse-service';
import { MarkdownModule, MarkdownService } from 'ngx-markdown';

// Servicios de utilidades
import { ChatUtilsService } from './../../services/chat-utils.service';
import { ConnectionStatusService } from './../../services/connection-status.service';
import { TypewriterService } from './../../services/typewriter.service';
import { ScrollManagerService } from './../../services/scroll-manager.service';
import { MessageManagerService } from './../../services/message-manager.service';
import { ChatHistoryService } from './../../services/chat-history.service';
import { SidebarComponent } from '../../components/sidebar/sidebar';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MarkdownModule,
    SidebarComponent,
  ],
  providers: [MarkdownModule],
  templateUrl: './chat.html',
  styleUrls: ['./chat.css'],
})
export class Chat implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer', { static: false })
  private messagesContainer!: ElementRef;

  // Configuración
  readonly agentId = input<string>();
  private readonly typewriterSpeed = 25;

  // Estado reactivo
  messages: ChatMessage[] = [];
  currentMessage: ChatMessage | null = null;
  isSending = false;
  debugMode = false;

  // Servicios
  private sseService = inject(SseService);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);

  // Servicios de utilidades
  protected chatUtils = inject(ChatUtilsService);
  protected connectionStatus = inject(ConnectionStatusService);
  private typewriter = inject(TypewriterService);
  private scrollManager = inject(ScrollManagerService);
  private messageManager = inject(MessageManagerService);
  private chatHistoryService = inject(ChatHistoryService);

  // Subscripciones
  private subscription: Subscription | null = null;
  typewriterSubscription: Subscription | null = null;

  // Formulario
  msgForm = this.fb.group({
    message: [
      '',
      [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(1000),
      ],
    ],
  });

  ngOnInit(): void {
    // Verificar si hay un session_id en los query parameters
    this.route.queryParams.subscribe(params => {
      const sessionId = params['session_id'];
      if (sessionId) {
        console.log('🔄 Estableciendo sesión desde URL:', sessionId);
        this.sseService.setCurrentSession(sessionId);
        this.loadSessionMessages(sessionId);
      }
    });
  }

  /**
   * Carga los mensajes de una sesión específica
   */
  private loadSessionMessages(sessionId: string): void {
    const agentId = this.agentId();
    if (!agentId) {
      console.warn('⚠️ No se puede cargar mensajes sin agentId');
      return;
    }

    const sessionMessages = this.chatHistoryService.getSessionMessages(sessionId, agentId);
    if (sessionMessages.length > 0) {
      console.log('📜 Cargando mensajes de la sesión:', sessionMessages);
      
      // Limpiar mensajes actuales
      this.messageManager.clearMessages(this.messages);
      
      // Cargar mensajes de la sesión
      sessionMessages.forEach(message => {
        this.messages.push({ ...message });
      });
      
      // Programar scroll después de que se rendericen los mensajes
      setTimeout(() => {
        this.scrollManager.scheduleScrollToBottom();
        this.cdr.detectChanges();
      }, 100);
      
      console.log('✅ Mensajes de sesión cargados:', this.messages.length);
    } else {
      console.log('ℹ️ No se encontraron mensajes para la sesión:', sessionId);
    }
  }

  ngAfterViewChecked() {
    this.scrollManager.executeScheduledScroll(this.messagesContainer);
  }

  sendMessage() {
    const messageContent = this.msgForm.get('message')?.value?.trim();
    if (!messageContent || this.isSending || !this.agentId()) return;

    this.startNewConversation(messageContent);
    this.msgForm.reset();
  }

  private startNewConversation(content: string) {
    console.log('🚀 Iniciando nueva conversación:', content);

    // Limpiar estado anterior
    this.cleanup();
    
    // Solo limpiar mensajes si no estamos cargando una sesión existente
    if (!this.route.snapshot.queryParams['session_id']) {
      this.messageManager.clearMessages(this.messages);
    }
    
    this.currentMessage = null;
    this.isSending = true;
    this.connectionStatus.setStatus('connecting');

    // Solo iniciar nueva sesión si no hay una sesión activa
    const currentSessionId = this.sseService.getCurrentSessionId();
    if (!currentSessionId || this.route.snapshot.queryParams['session_id']) {
      // Si no hay sesión o si se está restaurando una sesión específica, no crear nueva
      if (!this.route.snapshot.queryParams['session_id']) {
        this.sseService.startNewChatSession();
      }
    }

    // Agregar mensaje del usuario
    this.messageManager.addUserMessage(this.messages, content);
    this.scrollManager.scheduleScrollToBottom();
    this.cdr.detectChanges();

    // Registrar el mensaje del usuario en el historial
    const agentId = this.agentId();
    if (agentId) {
      this.chatHistoryService.saveOrUpdateSession({
        session_id: this.sseService.getCurrentSessionId(),
        agent_id: agentId,
        user_id: this.chatHistoryService['userService'].getCurrentUserId(),
        message: content,
        messages: [...this.messages] // Guardar todos los mensajes actuales
      });
    }

    // Iniciar stream
    this.subscription = this.sseService
      .streamFromAgent(this.agentId() as string, content)
      .subscribe({
        next: (data: StreamResponse) => this.handleStreamData(data),
        error: (error) => this.handleError(error),
        complete: () => this.handleComplete(),
      });
  }

  private handleStreamData(data: StreamResponse) {
    console.log('📨 Procesando datos del stream:', data);
    this.connectionStatus.setStatus('streaming');

    switch (data.event) {
      case 'RunResponse':
        this.handleRunResponse(data);
        break;
      case 'RunStarted':
        this.messageManager.addSystemMessage(
          this.messages,
          '🤖 El agente está procesando tu solicitud...',
          'RunStarted'
        );
        break;
      case 'RunCompleted':
        this.handleRunCompleted(data);
        break;
      case 'UpdatingMemory':
        this.messageManager.addSystemMessage(
          this.messages,
          '🧠 Actualizando memoria del agente...',
          data.event as EventType
        );
        break;
      case 'ToolCallStarted':
        this.messageManager.addSystemMessage(
          this.messages,
          '🔧 Ejecutando herramientas...',
          data.event as EventType
        );
        break;
      default:
        console.log('ℹ️ Evento no manejado:', data.event, data);
        if (data.currentChunk) {
          this.handleRunResponse(data);
        }
    }

    this.scrollManager.scheduleScrollToBottom();
    this.cdr.detectChanges();
  }

  private handleRunResponse(data: StreamResponse) {
    console.log('🤖 Respuesta del run:', data);

    // Crear nuevo mensaje si no existe o el actual está completo
    if (!this.currentMessage || this.currentMessage.isComplete) {
      this.currentMessage = this.messageManager.createBotMessage(
        this.messages,
        data.rawMessage.run_id || this.chatUtils.generateId(),
        data.rawMessage.created_at
      );
    }

    // Acumular contenido
    if (data.currentChunk) {
      this.currentMessage.content = data.fullContent;
      console.log('📝 Contenido acumulado:', this.currentMessage.content);

      // Iniciar efecto typewriter si no está activo
      if (!this.typewriter.isActive()) {
        this.typewriter.startTypewriter(
          this.currentMessage,
          () => {
            this.scrollManager.scheduleScrollToBottom();
            this.cdr.detectChanges();
          },
          this.typewriterSpeed
        );
      }
    }
  }

  private handleRunCompleted(data: StreamResponse) {
    console.log('✅ Ejecución completada:', data);

    if (this.currentMessage) {
      this.typewriter.completeMessage(this.currentMessage);
    }

    this.scrollManager.scheduleScrollToBottom();
    this.cdr.detectChanges();
  }

  private handleError(error: any) {
    console.error('❌ Error en el stream:', error);
    this.connectionStatus.setStatus('error');
    this.typewriter.stopTypewriter();
    this.isSending = false;

    // Finalizar mensaje actual si existe
    if (this.currentMessage) {
      this.messageManager.completeMessage(this.currentMessage);
    }

    // Mostrar mensaje de error
    const errorMessage = error.message || 'Error desconocido en la conexión';
    this.messageManager.addErrorMessage(
      this.messages,
      `❌ Error: ${errorMessage}`
    );

    this.scrollManager.scheduleScrollToBottom();
    this.cdr.detectChanges();
  }

  private handleComplete() {
    console.log('✅ Stream completado');
    this.connectionStatus.setStatus('idle');
    this.typewriter.stopTypewriter();
    this.isSending = false;

    // Asegurar que el último mensaje se muestre completamente
    if (this.currentMessage) {
      this.messageManager.completeMessage(this.currentMessage);
    }

    // Actualizar el historial con todos los mensajes de la conversación
    const agentId = this.agentId();
    if (agentId && this.messages.length > 0) {
      this.chatHistoryService.updateSessionMessages(
        this.sseService.getCurrentSessionId(),
        agentId,
        [...this.messages]
      );
    }

    this.cdr.detectChanges();
  }

  private cleanup() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
    this.typewriter.stopTypewriter();
  }

  // Métodos para el template (delegados a servicios)
  trackByMessageId = this.chatUtils.trackByMessageId.bind(this.chatUtils);
  getEventLabel = this.chatUtils.getEventLabel.bind(this.chatUtils);
  formatTimestamp = this.chatUtils.formatTimestamp.bind(this.chatUtils);
  isUserMessage = this.chatUtils.isUserMessage.bind(this.chatUtils);
  isSystemMessage = this.chatUtils.isSystemMessage.bind(this.chatUtils);
  isBotMessage = this.chatUtils.isBotMessage.bind(this.chatUtils);
  isErrorMessage = this.chatUtils.isErrorMessage.bind(this.chatUtils);

  getConnectionStatusText = this.connectionStatus.getStatusText.bind(
    this.connectionStatus
  );
  getConnectionStatusClass = this.connectionStatus.getStatusClass.bind(
    this.connectionStatus
  );

  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  cancelSending() {
    this.cleanup();
    this.isSending = false;
    this.connectionStatus.setStatus('idle');
    this.messageManager.addSystemMessage(
      this.messages,
      '🚫 Envío cancelado por el usuario',
      'Cancelled' as EventType
    );
  }

  ngOnDestroy() {
    this.cleanup();
    this.connectionStatus.destroy();
  }
}
