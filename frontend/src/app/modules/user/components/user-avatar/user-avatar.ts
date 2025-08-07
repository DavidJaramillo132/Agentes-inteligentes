import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import type { UserInfo } from '@app/shared/services/user.service';

@Component({
  selector: 'app-user-avatar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-avatar.html',
  styleUrls: ['./user-avatar.css']
})
export class UserAvatar {
  userInfo = input.required<UserInfo>();
  size = input<'sm' | 'md' | 'lg'>('md');
  showName = input<boolean>(false);
  clickable = input<boolean>(true);

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

  // Obtener las clases de tamaño
  getSizeClasses(): string {
    const sizeMap = {
      sm: 'w-8 h-8 text-sm',
      md: 'w-12 h-12 text-base',
      lg: 'w-16 h-16 text-lg'
    };
    return sizeMap[this.size()];
  }
}
