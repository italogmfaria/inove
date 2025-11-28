import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { AuthService } from '../service/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class SessionInterceptor implements HttpInterceptor {
  private readonly MAX_RETRIES = 2;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Habilita envio automático de cookies
    let reqWithCredentials = req.clone({
      withCredentials: true
    });

    // Adiciona o token Bearer ao header Authorization
    const token = this.authService.getToken();
    if (token) {
      reqWithCredentials = reqWithCredentials.clone({
        headers: reqWithCredentials.headers.set('Authorization', `Bearer ${token}`)
      });
    }

    return next.handle(reqWithCredentials).pipe(
      // Retry automático em caso de erro temporário
      retry({
        count: this.MAX_RETRIES,
        delay: (error) => {
          if (error.status === 0 || error.status === 408 || error.status === 504) {
            return throwError(() => error);
          }
          return throwError(() => error);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        // Se receber 401, o token é inválido
        if (error.status === 401) {
          this.toastr.error('Sua sessão expirou. Faça login novamente.', 'Sessão Expirada');
          this.authService.logout().subscribe({
            complete: () => this.router.navigate(['/login'])
          });
        }

        return throwError(() => error);
      })
    );
  }
}
