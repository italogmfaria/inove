import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { AuthService } from '../service/auth.service';
import { SessionService } from '../service/session.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class SessionInterceptor implements HttpInterceptor {
  private readonly MAX_RETRIES = 3;
  private readonly TIMEOUT_MS = 30000; // 30 segundos

  constructor(
    private authService: AuthService,
    private sessionService: SessionService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Habilita envio automático de cookies nas requisições
      let reqWithCredentials = req.clone({
      withCredentials: true
    });

    // Adiciona o token Bearer ao header Authorization quando disponível
    const token = this.authService.getToken();
    if (token && !reqWithCredentials.headers.has('Authorization')) {
      reqWithCredentials = reqWithCredentials.clone({
        headers: reqWithCredentials.headers.set('Authorization', `Bearer ${token}`)
      });
    }

    // NÃO valida sessão aqui para evitar falsos positivos
    // A validação será feita pelo Guard nas rotas protegidas

    return next.handle(reqWithCredentials).pipe(
      // Retry automático em caso de timeout
      retry({
        count: this.MAX_RETRIES,
        delay: (error, retryCount) => {
          if (error.status === 0 || error.status === 408 || error.status === 504) {
            console.warn(`[SessionInterceptor] Tentativa de retry ${retryCount}/${this.MAX_RETRIES}`);
            return throwError(() => error);
          }
          return throwError(() => error);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error(`[SessionInterceptor] Erro HTTP ${error.status}:`, error.message);

        // Se receber 401 (Unauthorized), faz logout
        if (error.status === 401) {
          console.warn('[SessionInterceptor] Token inválido (401), fazendo logout');
          this.authService.logout().subscribe({
            complete: () => {
              this.sessionService.clearSession();
              this.toastr.error('Sua sessão expirou. Faça login novamente.', 'Sessão Expirada');
              this.router.navigate(['/login']);
            }
          });
        }

        // Para erros de timeout ou conexão, não faz logout imediato
        if (error.status === 0 || error.status === 408 || error.status === 504) {
          console.warn('[SessionInterceptor] Timeout ou erro de conexão, mas mantendo sessão ativa');
          // Não faz logout por timeout, deixa o usuário tentar novamente
        }

        return throwError(() => error);
      })
    );
  }
}



