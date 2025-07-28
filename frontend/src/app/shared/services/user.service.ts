import { Injectable } from '@angular/core';

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

  constructor() { }

  // Obtener información del usuario logueado
  getUserInfo(): UserInfo | null {
    const userInfoStr = localStorage.getItem('userInfo');
    if (userInfoStr) {
      return JSON.parse(userInfoStr);
    }
    return null;
  }

  // Verificar si el usuario está logueado
  isLoggedIn(): boolean {
    return localStorage.getItem('isLoggedIn') === 'true';
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
    localStorage.removeItem('userInfo');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('accessToken');
  }
}
