import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  canActivate(): boolean {
    const isLoggedIn = this.userService.isLoggedIn();
    
    // Si ya está autenticado, redirigir a /agents
    if (isLoggedIn) {
      this.router.navigate(['/agents']);
      return false;
    }

    // Si no está autenticado, permitir acceso a login/register
    return true;
  }
}
