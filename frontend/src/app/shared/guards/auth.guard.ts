import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UserService } from '../../shared/services/user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    
    // Verificar si el usuario está logueado
    if (this.userService.isLoggedIn()) {
      console.log(' Usuario autenticado, acceso permitido');
      return true;
    }

    // Si no está logueado, redirigir al login
    console.log(' Usuario no autenticado, redirigiendo al login');
    this.router.navigate(['/login'], { 
      queryParams: { returnUrl: state.url }
    });
    
    return false;
  }
}
