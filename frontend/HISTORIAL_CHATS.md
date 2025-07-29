# Historial de Chats en el Sidebar

## Funcionalidad Implementada

Se ha implementado una funcionalidad completa para mostrar el historial de chats anteriores en el sidebar, filtrados por `agent_id` y `user_id`. 

## Características Principales

### 1. **Almacenamiento de Sesiones**
- Las sesiones de chat se almacenan automáticamente en `localStorage`
- Cada sesión incluye: `session_id`, `agent_id`, `user_id`, título, fechas, contador de mensajes
- Se mantiene un cache en memoria para mejor rendimiento

### 2. **Filtrado por Usuario y Agente**
- Solo se muestran chats del usuario actual (`user_id`)
- Solo se muestran chats del agente actual (`agent_id`)
- Cada agente tiene su propio historial independiente

### 3. **Interfaz de Usuario Mejorada**
- Lista de chats con títulos generados automáticamente
- Información de fecha y número de mensajes
- Vista previa del último mensaje
- Botón de eliminación por chat (visible al hacer hover)
- Botón para limpiar todas las conversaciones

### 4. **Navegación entre Sesiones**
- Clic en un chat anterior restaura esa sesión
- Botón "New chat" inicia una nueva sesión
- Mantiene el contexto del agente actual

## Archivos Modificados/Creados

### 1. **Modelo de Datos** (`chat-model.ts`)
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
}
```

### 2. **Servicio de Historial** (`chat-history.service.ts`)
- `getChatSessions(agentId)`: Obtiene chats del usuario para un agente específico
- `saveOrUpdateSession()`: Guarda o actualiza una sesión
- `deleteSession()`: Elimina una sesión específica
- `clearSessions()`: Limpia todas las sesiones de un agente
- `generateSessionTitle()`: Genera títulos automáticamente del primer mensaje

### 3. **Componente Sidebar** (`sidebar.ts` y `sidebar.html`)
- Muestra lista de chats anteriores
- Maneja navegación entre sesiones
- Funciones de eliminación y limpieza
- Formateo de fechas en español

### 4. **Servicio SSE** (`sse-service.ts`)
- Integración automática con el historial
- Registra nuevos mensajes automáticamente
- Soporte para sesiones específicas

### 5. **Componente Chat** (`chat.ts`)
- Soporte para parámetros de sesión en URL
- Pasa `agentId` al sidebar
- Maneja restauración de sesiones

## Cómo Funciona

### 1. **Inicio de Nueva Sesión**
```typescript
// Al enviar el primer mensaje
this.chatHistoryService.saveOrUpdateSession({
  session_id: sessionId,
  agent_id: agentId,
  user_id: userId,
  message: message
});
```

### 2. **Carga de Historial**
```typescript
// Al abrir el sidebar
this.chatSessions$ = this.chatHistoryService.getChatSessions(this.agentId);
```

### 3. **Navegación a Sesión**
```typescript
// Al hacer clic en un chat anterior
this.router.navigate(['/chat', this.agentId], { 
  queryParams: { session_id: session.session_id } 
});
```

## Beneficios

1. **Persistencia**: Los chats se mantienen entre sesiones del navegador
2. **Organización**: Cada agente tiene su propio historial
3. **Privacidad**: Solo el usuario actual ve sus chats
4. **Rendimiento**: Cache en memoria evita lecturas constantes de localStorage
5. **UX Mejorada**: Navegación intuitiva entre conversaciones anteriores

## Próximas Mejoras Posibles

1. **Sincronización con Backend**: API REST para persistir chats en servidor
2. **Búsqueda**: Filtrar chats por contenido o fecha
3. **Categorización**: Etiquetas o carpetas para organizar chats
4. **Exportación**: Descargar historial de conversaciones
5. **Restauración Completa**: Reconstruir toda la conversación al seleccionar un chat

## Uso

1. **Automático**: Los chats se guardan automáticamente al enviar mensajes
2. **Ver Historial**: Aparece automáticamente en el sidebar
3. **Nueva Conversación**: Clic en "New chat"
4. **Volver a Chat Anterior**: Clic en cualquier chat de la lista
5. **Eliminar Chat**: Hover sobre un chat y clic en icono de papelera
6. **Limpiar Todo**: Clic en "Clear conversations"

La funcionalidad está completamente implementada y lista para usar. El historial se actualiza automáticamente y está disponible inmediatamente para todos los usuarios.
