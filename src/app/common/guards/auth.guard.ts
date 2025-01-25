import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const token = this.authService.getToken();

    if (!token) {
      this.router.navigate(['/login']);
      return false;
    }

    const userRole = this.authService.getRole();
    const allowedRole = route.data['role'];

    if (allowedRole && userRole !== allowedRole) {
      alert('Você não tem acesso a essa página!');
      return false;
    }
    return true;
  }
}
