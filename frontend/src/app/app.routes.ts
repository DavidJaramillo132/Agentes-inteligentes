import { Routes } from '@angular/router';

// IMPORTANTE: El orden importa. Las rutas más específicas deben ir primero
export const routes: Routes = [
  // Rutas de usuario - Lazy loaded
  {
    path: 'account',
    loadChildren: () => import('./modules/user/user.routes').then(m => m.lazyUserRoutes)
  },
  // Rutas de chat - Lazy loaded
  {
    path: 'chat',
    loadChildren: () => import('./modules/chat/chat.routes').then(m => m.lazyChatRoutes)
  },
  // Rutas del site (login, register, home)
  {
    path: 'login',
    loadComponent: () => import('./modules/login/pages/login/login').then(m => m.Login)
  },
  {
    path: 'register',
    loadComponent: () => import('./modules/login/pages/register/register').then(m => m.Register)
  },
  {
    path: 'agents',
    loadComponent: () => import('./modules/site/pages/home/home').then(m => m.Home)
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/login'
  },
];
