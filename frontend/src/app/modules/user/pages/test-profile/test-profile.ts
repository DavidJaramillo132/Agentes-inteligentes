import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '@app/shared/services/user.service';

@Component({
  selector: 'app-test-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-base-200 p-8">
      <div class="max-w-2xl mx-auto">
        <h1 class="text-3xl font-bold mb-6">Página de Prueba - Profile</h1>
        
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title">Estado de Autenticación</h2>
            
            <div class="space-y-4">
              <div>
                <strong>¿Usuario logueado?</strong>
                <span class="ml-2" [class]="isLoggedIn ? 'text-success' : 'text-error'">
                  {{ isLoggedIn ? 'SÍ' : 'NO' }}
                </span>
              </div>
              
              <div *ngIf="userInfo">
                <strong>Información del usuario:</strong>
                <pre class="bg-base-200 p-4 rounded mt-2">{{ userInfo | json }}</pre>
              </div>
              
              <div *ngIf="!userInfo">
                <span class="text-warning">No hay información de usuario</span>
              </div>
            </div>
            
            <div class="card-actions justify-end mt-6">
              <button class="btn btn-primary" onclick="window.history.back()">
                Volver
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TestProfile {
  userInfo: any = null;
  isLoggedIn: boolean = false;

  constructor(private userService: UserService) {
    console.log('[TestProfile] Componente inicializado');
    this.checkUserStatus();
  }

  private checkUserStatus(): void {
    this.isLoggedIn = this.userService.isLoggedIn();
    this.userInfo = this.userService.getUserInfo();
    
    console.log('[TestProfile] isLoggedIn =', this.isLoggedIn);
    console.log('[TestProfile] userInfo =', this.userInfo);
  }
}
