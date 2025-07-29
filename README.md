# Sistema de Historial de Chat y Gestión de Sesiones

## 📋 Descripción General

Este proyecto implementa un sistema completo de historial de chat y gestión de sesiones para una aplicación de chat con IA basada en Angular. Los usuarios ahora pueden ver, navegar y reanudar conversaciones anteriores con agentes de IA, con persistencia completa de mensajes y continuidad de sesiones.

## ✨ Características

### 🏛️ **Historial Completo de Chat**
- **Almacenamiento Persistente**: Todas las conversaciones se guardan localmente usando `localStorage`
- **Filtrado por Usuario y Agente**: El historial de chat se filtra por `user_id` y `agent_id`
- **Persistencia de Mensajes**: Hilos de conversación completos incluyendo mensajes del usuario y respuestas de la IA
- **Gestión de Sesiones**: Cada conversación tiene un `session_id` único para una organización adecuada

### 🔄 **Navegación de Sesiones**
- **Integración con Sidebar**: Las conversaciones anteriores aparecen automáticamente en la barra lateral
- **Reanudación con Un Clic**: Haz clic en cualquier conversación anterior para reanudarla instantáneamente
- **Carga Completa de Mensajes**: Todos los mensajes anteriores (usuario + IA) se cargan automáticamente
- **Continuación Fluida**: Continúa las conversaciones exactamente donde las dejaste

### 💾 **Gestión Inteligente de Datos**
- **Guardado Automático**: Los mensajes se guardan automáticamente mientras chateas
- **Optimización de Caché**: Almacenamiento en caché en memoria para mejor rendimiento
- **Límites de Almacenamiento**: Limpieza automática para prevenir sobrecarga de almacenamiento (máx. 50 sesiones por agente)
- **Manejo de Errores**: Degradación elegante cuando localStorage no está disponible (compatibilidad con SSR)

## 🛠️ Implementación Técnica

### **Descripción de la Arquitectura**

```
├── Modelos (chat-model.ts)
│   ├── ChatSession - Metadatos de sesión con almacenamiento de mensajes
│   ├── ChatMessage - Estructura de mensaje individual
│   └── BaseAgentEvent - Estructura de eventos para actualizaciones en tiempo real
│
├── Servicios
│   ├── ChatHistoryService - Gestión central del historial
│   ├── UserService - Autenticación de usuario y generación de sesiones
│   └── SseService - Comunicación de chat en tiempo real
│
└── Componentes
    ├── SidebarComponent - Visualización del historial y navegación
    └── ChatComponent - Interfaz principal de chat con soporte de sesiones
```

### **Modelos de Datos Principal**

```typescript
export interface ChatSession {
  session_id: string
  agent_id: string
  user_id: string
  title: string
  created_at: number
  updated_at: number
  message_count: number
  last_message?: string
  messages?: ChatMessage[] // Almacenamiento completo de conversación
}

export interface ChatMessage {
  id: string
  content: string
  displayedContent: string
  isComplete: boolean
  isStreaming: boolean
  event: EventType
  timestamp: number
}
```

## 🔧 Detalles Clave de Implementación

### **1. Sistema de Almacenamiento de Sesiones**

```typescript
// Guardado automático de sesiones con historial completo de mensajes
saveOrUpdateSession(sessionData: {
  session_id: string;
  agent_id: string;
  user_id: string;
  message?: string;
  messages?: ChatMessage[];
}): void
```

### **2. Carga de Mensajes al Reanudar Sesión**

```typescript
// Cargar conversación completa al seleccionar del historial
private loadSessionMessages(sessionId: string): void {
  const sessionMessages = this.chatHistoryService.getSessionMessages(sessionId, agentId);
  if (sessionMessages.length > 0) {
    this.messageManager.clearMessages(this.messages);
    sessionMessages.forEach(message => {
      this.messages.push({ ...message });
    });
    this.scrollManager.scheduleScrollToBottom();
  }
}
```

### **3. Navegación de Sesiones Basada en URL**

```typescript
// Detectar sesión desde parámetros de URL y restaurar
ngOnInit(): void {
  this.route.queryParams.subscribe(params => {
    const sessionId = params['session_id'];
    if (sessionId) {
      this.sseService.setCurrentSession(sessionId);
      this.loadSessionMessages(sessionId);
    }
  });
}
```

### **4. Compatibilidad con SSR**

```typescript
// Detección de plataforma para disponibilidad de localStorage
private isBrowser(): boolean {
  return isPlatformBrowser(this.platformId);
}

// Operaciones seguras de localStorage
getUserInfo(): UserInfo | null {
  if (!this.isBrowser()) return null;
  // ... operaciones de localStorage
}
```

## 📂 Estructura de Archivos

```
src/app/modules/chat/
├── models/
│   └── chat-model.ts                    # Modelos de datos
├── services/
│   ├── chat-history.service.ts          # Gestión del historial
│   ├── sse-service.ts                   # Comunicación en tiempo real
│   └── chat-utils.service.ts            # Funciones de utilidad
├── components/
│   └── sidebar/
│       ├── sidebar.ts                   # Lógica de UI del historial
│       └── sidebar.html                 # Plantilla de UI del historial
└── pages/
    └── chat/
        ├── chat.ts                      # Lógica principal del chat
        └── chat.html                    # Interfaz del chat
```

## 🎯 Flujo de Experiencia del Usuario

### **Iniciando una Nueva Conversación**
1. El usuario envía un mensaje a un agente de IA
2. El sistema genera un `session_id` único
3. El mensaje y la respuesta se guardan con metadatos de sesión
4. La conversación aparece en el historial de la barra lateral

### **Reanudando una Conversación Anterior**
1. El usuario hace clic en una conversación en la barra lateral
2. El sistema navega a `/chat/{agentId}?session_id={sessionId}`
3. Todos los mensajes anteriores se cargan automáticamente
4. El usuario puede continuar la conversación sin problemas

### **Gestión de Sesiones**
1. Cada agente tiene un historial de conversación independiente
2. Las sesiones se organizan automáticamente por fecha
3. Las conversaciones se pueden eliminar individualmente o en lote
4. El almacenamiento se gestiona automáticamente para prevenir desbordamiento

---

## **Imagenes**

### **Login**

<img width="1911" height="1137" alt="image" src="https://github.com/user-attachments/assets/c701198a-1fe5-46af-bf53-7c363002a673" />

El usuario podra hacer login una vez ya este registrado

### **Register**

<img width="1904" height="1137" alt="image" src="https://github.com/user-attachments/assets/8e93b4cd-a032-4319-898c-916e0b610b49" />

El usuario podra registrase

### **Agentes**

<img width="1884" height="1141" alt="image" src="https://github.com/user-attachments/assets/6f198f0b-4c0b-4b75-8028-9038492d5a3d" />

Se muestran los diferente agents que hay disponibles

### **Chat Con los agentes **

<img width="1895" height="1087" alt="image" src="https://github.com/user-attachments/assets/a5785a2a-7f78-4aec-8e24-94a2cf1b45a6" />




