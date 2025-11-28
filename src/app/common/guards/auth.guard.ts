import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const token = this.authService.getToken();

    if (!token) {
      this.toastr.error('Acesso negado. Faça login para continuar.', 'Autenticação Necessária');
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    if (this.authService.isTokenExpired(token)) {
      this.toastr.error('Sua sessão expirou. Faça login novamente.', 'Sessão Expirada');
      this.authService.logout().subscribe({
        complete: () => this.router.navigate(['/login'])
      });
      return false;
    }

    const allowedRole = route.data['role'];
    if (allowedRole) {
      const userRole = this.authService.getRole();

      if (!userRole || userRole !== allowedRole) {
        this.toastr.error('Você não tem permissão para acessar essa página!', 'Acesso Negado');
        this.router.navigate(['/']);
        return false;
      }
    }

    return true;
  }
}
