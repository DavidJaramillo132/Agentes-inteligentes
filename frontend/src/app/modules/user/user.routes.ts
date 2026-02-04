import { Routes } from '@angular/router';
import { AuthGuard } from '@app/shared/guards/auth.guard';

// Rutas lazy-loaded (sin el path base 'account')
export const lazyUserRoutes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'profile',
        pathMatch: 'full'
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile').then(m => m.UserProfile),
      },
      {
        path: 'test',
        loadComponent: () => import('./pages/test-profile/test-profile').then(m => m.TestProfile),
      },
    ],
  },
];
