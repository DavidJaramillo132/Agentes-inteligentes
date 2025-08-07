import { Routes } from '@angular/router';
import { AuthGuard } from '@app/shared/guards/auth.guard';
import { UserProfile } from './pages/profile/profile';
import { TestProfile } from './pages/test-profile/test-profile';

export const userRoutes: Routes = [
  {
    path: 'account',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'profile',
        pathMatch: 'full'
      },
      {
        path: 'profile',
        component: UserProfile,
      },
      {
        path: 'test',
        component: TestProfile,
      },
    ],
  },
];
