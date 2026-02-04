import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatButtonComponent } from '../chat-button/chat-button';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { siteConfigRoutes } from '@modules/site/config/site-config.routes';
import { ChatHistoryService } from '../../services/chat-history.service';
import { ChatSession } from '../../models/chat-model';
import { SseService } from '../../services/sse-service';
import { UserService } from '@app/shared/services/user.service';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, ChatButtonComponent, RouterLink, MatIconModule],
  templateUrl: './sidebar.html'
})

export class SidebarComponent implements OnInit, OnDestroy {
  @Input() agentId: string = '';

  readonly siteRoutesConfig = siteConfigRoutes;
  chatSessions$: Observable<ChatSession[]>;
  private destroy$ = new Subject<void>();
  isOpen: boolean = true;

  constructor(
    private chatHistoryService: ChatHistoryService,
    private sseService: SseService,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {
    this.chatSessions$ = this.chatHistoryService.getCurrentSessions();
  }

  ngOnInit(): void {
    // Obtener el agentId de la ruta si no se pasó como Input
    if (!this.agentId || this.agentId.trim() === '') {
      this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
        if (params['agentId']) {
          this.agentId = params['agentId'];
          this.loadChatHistory();
        }
      });
    } else {
      this.loadChatHistory();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadChatHistory(): void {
    if (this.agentId && this.agentId.trim() !== '') {
      this.chatSessions$ = this.chatHistoryService.getChatSessions(this.agentId);
    }
  }

  startNewChat(): void {
    this.sseService.startNewChatSession();
    // Navegar a la página de chat sin parámetros de sesión para iniciar una nueva
    if (this.agentId && this.agentId.trim() !== '') {
      this.router.navigate(['/chat', this.agentId]);
    }
  }

  selectChatSession(session: ChatSession): void {
    // Navegar a la sesión específica (esto requerirá modificar las rutas para soportar session_id)
    if (this.agentId && this.agentId.trim() !== '' && session.session_id) {
      this.router.navigate(['/chat', this.agentId], {
        queryParams: { session_id: session.session_id }
      });
    }
  }

  clearConversations(): void {
    const confirmed = confirm('¿Estás seguro de que deseas eliminar todas las conversaciones? Esta acción no se puede deshacer.');
    
    if (confirmed && this.agentId && this.agentId.trim() !== '') {
      this.chatHistoryService.clearSessions(this.agentId);
    }
  }

  deleteSession(session: ChatSession): void {
    if (this.agentId && this.agentId.trim() !== '' && session.session_id) {
      this.chatHistoryService.deleteSession(session.session_id, this.agentId);
    }
  }

  toggleSidebar(): void {
    this.isOpen = !this.isOpen;
  }

  formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return 'Hoy';
    } else if (diffInDays === 1) {
      return 'Ayer';
    } else if (diffInDays < 7) {
      return `Hace ${diffInDays} días`;
    } else {
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short'
      });
    }
  }

  trackBySessionId(index: number, session: ChatSession): string {
    return session.session_id;
  }

  // Funciones para los botones del menú inferior
  toggleLightMode(): void {
    // Aquí puedes implementar la lógica para cambiar entre modo claro y oscuro
    console.log('Toggle light mode clicked');
    // Ejemplo: this.themeService.toggleTheme();
  }

  openAccountSettings(): void {
    // Verificar estado del usuario antes de navegar
    const isLoggedIn = this.userService?.isLoggedIn() || false;
    const userInfo = this.userService?.getUserInfo();

    console.log('[Sidebar] openAccountSettings called');
    console.log('[Sidebar] isLoggedIn =', isLoggedIn);
    console.log('[Sidebar] userInfo =', userInfo);

    if (!isLoggedIn) {
      console.log('[Sidebar] Usuario no autenticado, redirigiendo a login');
      this.router.navigate(['/login']);
      return;
    }

    // Navegar a la página de perfil del usuario
    console.log('[Sidebar] Navegando a /account');
    this.router.navigate(['/account']).then(success => {
      console.log('[Sidebar] Navegación exitosa?', success);
    }).catch(error => {
      console.error('[Sidebar] Error en navegación:', error);
    });
  }

}
