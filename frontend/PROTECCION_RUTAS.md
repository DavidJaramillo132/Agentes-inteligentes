# Protección de Rutas con Autenticación

## 📋 Descripción General

Se ha implementado un sistema completo de protección de rutas que impide el acceso a páginas protegidas si el usuario no ha iniciado sesión, y redirige automáticamente a usuarios autenticados lejos de las páginas de login/register.

## 🛡️ Guards Implementados

### **1. AuthGuard - Para Rutas Protegidas**
Protege rutas que requieren autenticación (como `/agents` y `/chat`).

```typescript
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  canActivate(): boolean {
    if (this.userService.isLoggedIn()) {
      return true; // Permitir acceso
    }
    
    // Redirigir al login con URL de retorno
    this.router.navigate(['/login'], { 
      queryParams: { returnUrl: state.url }
    });
    return false;
  }
}
```

### **2. NoAuthGuard - Para Páginas de Autenticación**
Previene que usuarios ya autenticados accedan a login/register.

```typescript
@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {
  canActivate(): boolean {
    if (this.userService.isLoggedIn()) {
      this.router.navigate(['/agents']); // Redirigir a página principal
      return false;
    }
    return true; // Permitir acceso a login/register
  }
}
```

## 🔐 Rutas Protegidas

### **Rutas del Sitio Principal (site.routes.ts)**
```typescript
export const siteRoutes: Routes = [
  {
    path: 'login',
    component: Login,
    canActivate: [NoAuthGuard] // Solo si NO está logueado
  },
  {
    path: 'register',
    component: Register,
    canActivate: [NoAuthGuard] // Solo si NO está logueado
  },
  {
    path: 'agents',
    component: Home,
    canActivate: [AuthGuard] // Solo si está logueado
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
```

### **Rutas de Chat (chat.routes.ts)**
```typescript
export const chatRoutes: Routes = [
  {
    path: chatConfigRoutes.base.path,
    canActivate: [AuthGuard], // Proteger toda la sección de chat
    children: [
      {
        path: chatConfigRoutes.children.chat.path,
        component: Chat,
      },
    ],
  },
];
```

## 🔧 UserService Mejorado

### **Validación Robusta de Autenticación**
```typescript
isLoggedIn(): boolean {
  if (!this.isBrowser()) {
    return false;
  }
  
  // Verificar tanto el flag como la existencia de datos de usuario
  const isLoggedFlag = localStorage.getItem('isLoggedIn') === 'true';
  const userInfo = this.getUserInfo();
  
  const isAuthenticated = isLoggedFlag && userInfo !== null && !!userInfo.userId;
  
  // Limpiar datos inválidos automáticamente
  if (!isAuthenticated && (isLoggedFlag || userInfo)) {
    this.logout();
  }
  
  return isAuthenticated;
}
```

### **Gestión de Sesión Completa**
```typescript
// Establecer sesión al hacer login
setUserSession(userInfo: UserInfo): void {
  localStorage.setItem('userInfo', JSON.stringify(userInfo));
  localStorage.setItem('isLoggedIn', 'true');
  if (userInfo.accessToken) {
    localStorage.setItem('accessToken', userInfo.accessToken);
  }
}

// Limpiar sesión al hacer logout
logout(): void {
  localStorage.removeItem('userInfo');
  localStorage.removeItem('isLoggedIn');  
  localStorage.removeItem('accessToken');
}
```

## 🎯 Flujos de Navegación

### **Usuario No Autenticado**
1. **Intenta acceder a `/agents`** → Redirigido a `/login`
2. **Intenta acceder a `/chat/agent123`** → Redirigido a `/login`
3. **Accede a `/login`** → Permitido ✅
4. **Accede a `/register`** → Permitido ✅

### **Usuario Autenticado**
1. **Accede a `/agents`** → Permitido ✅
2. **Accede a `/chat/agent123`** → Permitido ✅
3. **Intenta acceder a `/login`** → Redirigido a `/agents`
4. **Intenta acceder a `/register`** → Redirigido a `/agents`

### **Rutas No Existentes**
- **Cualquier ruta no definida** → Redirigido a `/login`

## 🔄 URL de Retorno

Cuando un usuario no autenticado intenta acceder a una ruta protegida:

```typescript
// El guard guarda la URL original
this.router.navigate(['/login'], { 
  queryParams: { returnUrl: state.url }
});

// Después del login, puede redirigir a la URL original
const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/agents';
this.router.navigateByUrl(returnUrl);
```

## 🛠️ Archivos Modificados/Creados

```
src/app/
├── shared/
│   ├── guards/
│   │   ├── auth.guard.ts          # Guard para rutas protegidas
│   │   └── no-auth.guard.ts       # Guard para páginas de auth
│   └── services/
│       └── user.service.ts        # Servicio mejorado con validación robusta
├── modules/
│   ├── site/
│   │   └── site.routes.ts         # Rutas principales con guards
│   └── chat/
│       └── chat.routes.ts         # Rutas de chat protegidas
```

## ✅ Beneficios de la Implementación

### **🔒 Seguridad**
- Acceso controlado a todas las rutas sensibles
- Validación robusta del estado de autenticación
- Limpieza automática de datos de sesión inválidos

### **📱 Experiencia de Usuario**
- Redirección inteligente basada en estado de autenticación
- Preservación de URL de destino para después del login
- Navegación fluida sin páginas de error

### **🧹 Mantenimiento**
- Guards reutilizables para diferentes tipos de protección
- Lógica centralizada de autenticación
- Fácil extensión para nuevos tipos de permisos

## 🚀 Uso en Desarrollo

### **Para Nuevas Rutas Protegidas:**
```typescript
{
  path: 'nueva-ruta-protegida',
  component: MiComponente,
  canActivate: [AuthGuard]
}
```

### **Para Rutas Solo para No Autenticados:**
```typescript
{
  path: 'solo-invitados',
  component: MiComponente,
  canActivate: [NoAuthGuard]
}
```

## 🔍 Testing

### **Casos de Prueba Principales:**
- ✅ Usuario no autenticado no puede acceder a rutas protegidas
- ✅ Usuario autenticado no puede acceder a login/register
- ✅ Redirección correcta según estado de autenticación
- ✅ Preservación de URL de retorno
- ✅ Limpieza automática de datos de sesión inválidos

La implementación está completa y proporciona una protección robusta de rutas con una excelente experiencia de usuario.
