import { Routes } from '@angular/router';
import { Chat } from './pages/chat/chat';
import { chatConfigRoutes } from './config/chat-config-route';
import { AuthGuard } from '../../shared/guards/auth.guard';

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
