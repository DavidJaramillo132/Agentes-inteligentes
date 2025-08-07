import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { UserService, type UserInfo } from '@app/shared/services/user.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class UserProfile implements OnInit {
  private userService = inject(UserService);
  private router = inject(Router);

  userInfo: UserInfo | null = null;
  isLoading: boolean = true;

  ngOnInit(): void {
    this.loadUserInfo();
  }

  private loadUserInfo(): void {
    try {
      this.userInfo = this.userService.getUserInfo();
      
      if (!this.userInfo) {
        console.warn('No se encontró información del usuario');
        this.router.navigate(['/login']);
        return;
      }

      console.log('Información del usuario cargada:', this.userInfo);
    } catch (error) {
      console.error('Error al cargar información del usuario:', error);
    } finally {
      this.isLoading = false;
    }
  }

  logout(): void {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      this.userService.logout();
      this.router.navigate(['/login']);
    }
  }

  goBack(): void {
    this.router.navigate(['/agents']);
  }

  // Formatear fecha de último login
  formatLoginTime(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  // Calcular tiempo desde el último login
  getTimeSinceLogin(timestamp: number): string {
    const now = Date.now();
    const diffInMinutes = Math.floor((now - timestamp) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'Hace menos de un minuto';
    } else if (diffInMinutes < 60) {
      return `Hace ${diffInMinutes} minuto${diffInMinutes !== 1 ? 's' : ''}`;
    } else if (diffInMinutes < 1440) { // 24 horas
      const hours = Math.floor(diffInMinutes / 60);
      return `Hace ${hours} hora${hours !== 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `Hace ${days} día${days !== 1 ? 's' : ''}`;
    }
  }

  // Obtener las iniciales del usuario
  getUserInitials(): string {
    if (!this.userInfo?.email) return 'U';
    
    const email = this.userInfo.email;
    const parts = email.split('@')[0].split('.');
    
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    } else {
      return email[0].toUpperCase();
    }
  }

  // Obtener el nombre de usuario del email
  getDisplayName(): string {
    if (!this.userInfo?.email) return 'Usuario';
    
    const localPart = this.userInfo.email.split('@')[0];
    return localPart.charAt(0).toUpperCase() + localPart.slice(1);
  }
}
