import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UserService } from '../../shared/services/user.service';

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    
    // Si el usuario ya está logueado, redirigir a agents
    if (this.userService.isLoggedIn()) {
      console.log('✅ Usuario ya autenticado, redirigiendo a agents');
      this.router.navigate(['/agents']);
      return false;
    }

    // Si no está logueado, permitir acceso a login/register
    console.log('ℹ️ Usuario no autenticado, acceso permitido a login/register');
    return true;
  }
}
