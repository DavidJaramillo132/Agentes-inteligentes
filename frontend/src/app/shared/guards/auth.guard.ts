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
    
    console.log('[AuthGuard] Verificando acceso a:', state.url);
    const isLoggedIn = this.userService.isLoggedIn();
    console.log('[AuthGuard] Usuario logueado?', isLoggedIn);
    
    if (isLoggedIn) {
      console.log('[AuthGuard] Usuario autenticado, acceso permitido a', state.url);
      return true;
    }

    console.log('[AuthGuard] Usuario no autenticado, redirigiendo al login desde', state.url);
    this.router.navigate(['/login'], { 
      queryParams: { returnUrl: state.url }
    });
    return false;
  }
}
