import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoggedInGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    const token = this.authService.getToken();

    if (token) {
      const role = this.authService.getRole();
      switch (role) {
        case 'STUDENT':
          this.router.navigate(['/cursos']);
          break;
        case 'INSTRUCTOR':
          this.router.navigate(['/painel-instrutor']);
          break;
        case 'ADMINISTRATOR':
          this.router.navigate(['/painel-admin']);
          break;
        default:
          this.router.navigate(['/']);
      }
      return false;
    }

    return true;
  }
}

