import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { SessionService } from '../service/session.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private sessionService: SessionService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const token = this.authService.getToken();

    if (!token) {
      this.router.navigate(['/login']);
      return false;
    }

    // Verifica se a sessão é válida
    if (!this.sessionService.isSessionValid()) {
      this.toastr.error('Sua sessão expirou ou você foi desconectado em outra aba!', 'Sessão Inválida');
      this.authService.logout().subscribe({
        complete: () => this.router.navigate(['/login'])
      });
      return false;
    }

    const userRole = this.authService.getRole();
    const allowedRole = route.data['role'];

    if (allowedRole && userRole !== allowedRole) {
      this.toastr.error('Você não tem permissão para acessar essa página!', 'Acesso Negado');
      this.authService.logout().subscribe({
        complete: () => this.router.navigate(['/login'])
      });
      return false;
    }
    return true;
  }
}
