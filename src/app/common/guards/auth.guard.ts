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
      console.warn('[AuthGuard] Sem token, redirecionando para login');
      this.router.navigate(['/login']);
      return false;
    }

    // Valida a sessão
    if (!this.sessionService.isSessionValid()) {
      console.warn('[AuthGuard] Sessão inválida, redirecionando para login');
      this.toastr.error('Sua sessão expirou ou você foi desconectado em outra aba!', 'Sessão Inválida');
      this.authService.logout().subscribe({
        complete: () => this.router.navigate(['/login'])
      });
      return false;
    }

    // Valida o token (se está expirado)
    if (this.isTokenExpired(token)) {
      console.warn('[AuthGuard] Token expirado, tentando refresh...');
      // TODO: Implementar refresh de token
      this.router.navigate(['/login']);
      return false;
    }

    const userRole = this.authService.getRole();
    const allowedRole = route.data['role'];

    if (allowedRole && userRole !== allowedRole) {
      console.warn(`[AuthGuard] Papel do usuário (${userRole}) não autorizado para rota (${allowedRole})`);
      this.toastr.error('Você não tem permissão para acessar essa página!', 'Acesso Negado');
      this.authService.logout().subscribe({
        complete: () => this.router.navigate(['/login'])
      });
      return false;
    }

    console.log('[AuthGuard] Acesso permitido');
    return true;
  }

  /**
   * Verifica se o token JWT está expirado
   */
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Converter para milisegundos
      return Date.now() >= expirationTime;
    } catch (e) {
      console.error('[AuthGuard] Erro ao verificar expiração do token:', e);
      return true; // Por segurança, considera como expirado se não conseguir validar
    }
  }
}
