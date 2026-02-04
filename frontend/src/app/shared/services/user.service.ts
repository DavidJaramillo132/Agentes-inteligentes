import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface UserInfo {
  email: string;
  userId: string;
  loginTime: number;
  accessToken?: string;
}

@Injectable({
  providedIn: 'root'
})

export class UserService {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  // Verificar si estamos en el navegador
  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  // Obtener información del usuario logueado
  getUserInfo(): UserInfo | null {
    if (!this.isBrowser()) {
      return null;
    }
    
    const userInfoStr = localStorage.getItem('userInfo');
    if (userInfoStr) {
      try {
        return JSON.parse(userInfoStr);
      } catch (error) {
        console.error('Error parsing user info:', error);
        return null;
      }
    }
    return null;
  }

  // Verificar si el usuario está logueado
  isLoggedIn(): boolean {
    if (!this.isBrowser()) {
      return false;
    }
    
    // Verificar tanto el flag isLoggedIn como la existencia de userInfo
    const isLoggedFlag = localStorage.getItem('isLoggedIn') === 'true';
    const userInfo = this.getUserInfo();
    
    // Usuario está logueado si tiene el flag Y tiene información de usuario válida
    const isAuthenticated = isLoggedFlag && userInfo !== null && !!userInfo.userId;
    
    // Si no está autenticado pero tiene datos residuales, limpiarlos
    if (!isAuthenticated && (isLoggedFlag || userInfo)) {
      console.log('[UserService] Limpiando datos de sesión inválidos');
      this.logout();
    }
    
    return isAuthenticated;
  }

  // Obtener user ID del usuario actual
  getCurrentUserId(): string {
    const userInfo = this.getUserInfo();
    return userInfo?.userId || 'anonymous_user';
  }

  // Obtener email del usuario actual
  getCurrentUserEmail(): string {
    const userInfo = this.getUserInfo();
    return userInfo?.email || 'anonymous@example.com';
  }

  // Obtener token de acceso
  getAccessToken(): string | null {
    if (!this.isBrowser()) {
      return null;
    }
    
    const userInfo = this.getUserInfo();
    return userInfo?.accessToken || localStorage.getItem('accessToken');
  }

  // Generar session ID único para el usuario
  generateSessionId(): string {
    const userInfo = this.getUserInfo();
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    
    if (userInfo) {
      const emailHash = btoa(userInfo.email).replace(/[^a-zA-Z0-9]/g, '').substring(0, 6);
      return `session_${emailHash}_${timestamp}_${random}`;
    } else {
      return `session_anonymous_${timestamp}_${random}`;
    }
  }

  // Cerrar sesión
  logout(): void {
    if (!this.isBrowser()) {
      return;
    }
    
    localStorage.removeItem('userInfo');
    localStorage.removeItem('isLoggedIn');  
    localStorage.removeItem('accessToken');
  }

  // Establecer datos de usuario al hacer login
  setUserSession(userInfo: UserInfo): void {
    if (!this.isBrowser()) {
      return;
    }
    
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
    localStorage.setItem('isLoggedIn', 'true');
    if (userInfo.accessToken) {
      localStorage.setItem('accessToken', userInfo.accessToken);
    }
    
    console.log('[UserService] Sesión de usuario establecida:', userInfo.email);
  }
}
