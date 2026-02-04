import { Routes } from '@angular/router';
import { chatConfigRoutes } from './config/chat-config-route';
import { AuthGuard } from '../../shared/guards/auth.guard';

// Rutas lazy-loaded (sin el path base 'chat')
export const lazyChatRoutes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      {
        path: chatConfigRoutes.children.chat.path,
        loadComponent: () => import('./pages/chat/chat').then(m => m.Chat),
      },
    ],
  },
];
