import { Routes } from '@angular/router';
import { siteRoutes } from './modules/site/site.routes';
import { chatRoutes } from './modules/chat/chat.routes';
import { userRoutes } from './modules/user/user.routes';

// IMPORTANTE: El orden importa. Las rutas más específicas deben ir primero
export const routes: Routes = [
  ...userRoutes,    // Rutas de usuario primero (/account)
  ...chatRoutes,    // Rutas de chat (/chat)
  ...siteRoutes,    // Rutas del site al final (incluye wildcard **)
];
