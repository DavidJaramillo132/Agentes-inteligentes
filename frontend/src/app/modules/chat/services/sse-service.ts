import { Injectable } from "@angular/core"
import { Observable } from "rxjs"
import { environment } from '@environments/environment';
import { env } from "process";
import { UserService } from '../../../shared/services/user.service';
import { ChatHistoryService } from './chat-history.service';


export interface SSEMessage {
  content: string
  content_type: string
  event: string
  run_id: string
  agent_id: string
  session_id: string
  created_at: number
  model?: string
  messages?: any[]
  metrics?: any
  failed_generation?: any
}

export interface StreamResponse {
  fullContent: string
  currentChunk: string
  event: string
  isComplete: boolean
  isError: boolean
  rawMessage: SSEMessage
}

@Injectable({
  providedIn: "root",
})
export class SseService {
  private readonly apiUrl = environment.agentsDirectUrl;
  private currentSessionId: string | null = null;

  constructor(
    private userService: UserService,
    private chatHistoryService: ChatHistoryService
  ) { }

  // Método para iniciar una nueva sesión de chat
  startNewChatSession(): void {
    this.currentSessionId = this.userService.generateSessionId();
  }

  // Método para establecer una sesión específica
  setCurrentSession(sessionId: string): void {
    this.currentSessionId = sessionId;
  }

  // Método para obtener el session ID actual
  getCurrentSessionId(): string {
    if (!this.currentSessionId) {
      this.startNewChatSession();
    }
    return this.currentSessionId!;
  }

  // Método para obtener el session ID actual
  private getSessionId(): string {
    return this.getCurrentSessionId();
  }

  streamFromAgent(agentId: string, message: string): Observable<StreamResponse> {
    const url = `${this.apiUrl}/${agentId}/runs`
    
    // Obtener información del usuario logueado
    const userId = this.userService.getCurrentUserId();
    const sessionId = this.getSessionId(); // Usar sesión persistente
    
    // Registrar el mensaje del usuario en el historial
    this.chatHistoryService.saveOrUpdateSession({
      session_id: sessionId,
      agent_id: agentId,
      user_id: userId,
      message: message
    });
    
    const formData = new FormData()
    formData.append("message", message)
    formData.append("stream", "true")
    formData.append("monitor", "false")
    formData.append("session_id", sessionId)
    formData.append("user_id", userId)

    return new Observable<StreamResponse>((observer) => {
      const controller = new AbortController()
      let fullContent = ""
      let buffer = ""

      fetch(url, {
        method: "POST",
        headers: {
          Accept: "text/event-stream",
          "Cache-Control": "no-cache",
        },
        body: formData,
        signal: controller.signal,
      })
        .then(async (response) => {
          if (!response.ok || !response.body) {
            const errorText = await response.text()
            throw new Error(`Error SSE: ${response.status} ${response.statusText} - ${errorText}`)
          }

          const reader = response.body.getReader()
          const decoder = new TextDecoder("utf-8")

          while (true) {
            const { value, done } = await reader.read()
            if (done) {
              break
            }

            const decodedChunk = decoder.decode(value, { stream: true })
            buffer += decodedChunk

            // Extraer objetos JSON completos del buffer (VERSIÓN CORREGIDA)
            const { jsonObjects, remainingBuffer } = this.extractCompleteJsonObjects(buffer)
            buffer = remainingBuffer


            for (const jsonStr of jsonObjects) {
              try {
                const sseMessage: SSEMessage = JSON.parse(jsonStr)

                // Actualizar fullContent ANTES de procesar el mensaje
                if (sseMessage.event === "RunResponse" && sseMessage.content) {
                  fullContent += sseMessage.content
                }

                this.processSSEMessage(sseMessage, fullContent, observer)

                // Terminar si es un evento de finalización
                if (sseMessage.event === "RunCompleted" || sseMessage.event === "RunError") {
                  return
                }
              } catch (parseError) {
                console.warn("Error parsing JSON object:", parseError, "JSON:", jsonStr)
              }
            }
          }

          observer.complete()
        })
        .catch((err) => {
          console.error("SSE Error:", err)
          observer.error(err)
        })

      return () => {
        controller.abort()
      }
    })
  }

  // MÉTODO CORREGIDO para extraer objetos JSON completosw
  private extractCompleteJsonObjects(buffer: string): { jsonObjects: string[]; remainingBuffer: string } {
    const jsonObjects: string[] = []
    let braceCount = 0
    let startIndex = 0
    let inString = false
    let escapeNext = false
    let currentIndex = 0

    while (currentIndex < buffer.length) {
      const char = buffer[currentIndex]

      if (escapeNext) {
        escapeNext = false
        currentIndex++
        continue
      }

      if (char === "\\") {
        escapeNext = true
        currentIndex++
        continue
      }

      if (char === '"' && !escapeNext) {
        inString = !inString
        currentIndex++
        continue
      }

      if (!inString) {
        if (char === "{") {
          if (braceCount === 0) {
            startIndex = currentIndex
          }
          braceCount++
        } else if (char === "}") {
          braceCount--
          if (braceCount === 0) {
            // Objeto JSON completo encontrado
            const jsonStr = buffer.substring(startIndex, currentIndex + 1)
            if (jsonStr.trim()) {
              jsonObjects.push(jsonStr)
            }
          }
        }
      }

      currentIndex++
    }

    // Si hay un objeto JSON incompleto, mantenerlo en el buffer
    let remainingBuffer = ""
    if (braceCount > 0) {
      remainingBuffer = buffer.substring(startIndex)
      console.warn("[SSE] JSON incompleto en buffer:", remainingBuffer.substring(0, 100) + "...")
    }

    return { jsonObjects, remainingBuffer }
  }

  private processSSEMessage(sseMessage: SSEMessage, fullContent: string, observer: any): void {
    if (sseMessage.event === "RunResponse" && sseMessage.content) {
      const streamResponse: StreamResponse = {
        fullContent: fullContent,
        currentChunk: sseMessage.content,
        event: sseMessage.event,
        isComplete: false,
        isError: false,
        rawMessage: sseMessage,
      }
      observer.next(streamResponse)
    }

    if (sseMessage.event === "RunCompleted") {
      const completedResponse: StreamResponse = {
        fullContent: sseMessage.content || fullContent,
        currentChunk: "",
        event: sseMessage.event,
        isComplete: true,
        isError: false,
        rawMessage: sseMessage,
      }
      observer.next(completedResponse)
      observer.complete()
    }

    if (sseMessage.event === "RunError") {
      const errorResponse: StreamResponse = {
        fullContent: sseMessage.content || fullContent,
        currentChunk: sseMessage.content,
        event: sseMessage.event,
        isComplete: true,
        isError: true,
        rawMessage: sseMessage,
      }
      observer.next(errorResponse)
      observer.complete()
    }

    if (sseMessage.event === "UpdatingMemory") {
      const memoryResponse: StreamResponse = {
        fullContent,
        currentChunk: sseMessage.content,
        event: sseMessage.event,
        isComplete: false,
        isError: false,
        rawMessage: sseMessage,
      }
      observer.next(memoryResponse)
    }

    if (sseMessage.event === "RunStarted") {
      const startedResponse: StreamResponse = {
        fullContent,
        currentChunk: sseMessage.content,
        event: sseMessage.event,
        isComplete: false,
        isError: false,
        rawMessage: sseMessage,
      }
      observer.next(startedResponse)
    }

    if (sseMessage.event === "ToolCallStarted") {
      const toolResponse: StreamResponse = {
        fullContent,
        currentChunk: sseMessage.content,
        event: sseMessage.event,
        isComplete: false,
        isError: false,
        rawMessage: sseMessage,
      }
      observer.next(toolResponse)
    }
  }
}
