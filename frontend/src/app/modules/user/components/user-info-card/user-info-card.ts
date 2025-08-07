import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import type { UserInfo } from '@app/shared/services/user.service';

@Component({
  selector: 'app-user-info-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './user-info-card.html',
  styleUrls: ['./user-info-card.css']
})
export class UserInfoCard {
  userInfo = input.required<UserInfo>();
  showDetails = input<boolean>(true);

  // Obtener las iniciales del usuario
  getUserInitials(): string {
    const userInfo = this.userInfo();
    if (!userInfo?.email) return 'U';
    
    const email = userInfo.email;
    const parts = email.split('@')[0].split('.');
    
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    } else {
      return email[0].toUpperCase();
    }
  }

  // Obtener el nombre de usuario del email
  getDisplayName(): string {
    const userInfo = this.userInfo();
    if (!userInfo?.email) return 'Usuario';
    
    const localPart = userInfo.email.split('@')[0];
    return localPart.charAt(0).toUpperCase() + localPart.slice(1);
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
}
