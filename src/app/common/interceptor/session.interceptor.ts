import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../service/auth.service';
import { SessionService } from '../service/session.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class SessionInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private sessionService: SessionService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Habilita envio automático de cookies nas requisições
    // Isso permite que o servidor veja os HttpOnly Cookies
    let reqWithCredentials = req.clone({
      withCredentials: true
    });

    // Adiciona o token Bearer ao header Authorization quando disponível
    // Isso garante que o token seja enviado mesmo para cookies HttpOnly
    const token = this.authService.getToken();
    if (token && !reqWithCredentials.headers.has('Authorization')) {
      reqWithCredentials = reqWithCredentials.clone({
        headers: reqWithCredentials.headers.set('Authorization', `Bearer ${token}`)
      });
    }

    // Verifica se a sessão é válida antes de fazer requisições
    if (!this.sessionService.isSessionValid() && this.authService.getToken()) {
      // Se tem token mas sessão inválida, faz logout
      this.authService.logout().subscribe({
        complete: () => this.router.navigate(['/login'])
      });
      return throwError(() => new Error('Sessão inválida'));
    }

    return next.handle(reqWithCredentials).pipe(
      catchError((error: HttpErrorResponse) => {
        // Se receber 401 (Unauthorized), faz logout
        if (error.status === 401) {
          this.authService.logout().subscribe({
            complete: () => {
              this.sessionService.clearSession();
              this.toastr.error('Sua sessão expirou. Faça login novamente.', 'Sessão Expirada');
              this.router.navigate(['/login']);
            }
          });
        }

        return throwError(() => error);
      })
    );
  }
}

