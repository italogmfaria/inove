import { Injectable } from '@angular/core';
import {
  HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {environment} from "../../../environments/environment";

type Rule = { method?: string; pattern: RegExp };

// ===== REGRAS PÚBLICAS (espelham sua SecurityFilterChain) =====
const PUBLIC_RULES: Rule[] = [
  // SWAGGER / infra
  { pattern: /^\/swagger-ui(\/.*)?$/ },
  { pattern: /^\/v3\/api-docs(\/.*)?$/ },
  { pattern: /^\/error\/?$/ },

  // AUTENTICAÇÃO
  { method: 'POST', pattern: /^\/api\/inove\/auth(\/.*)?$/ },

  // USUÁRIOS
  { method: 'POST', pattern: /^\/api\/inove\/usuarios\/discente\/?$/ },
  { method: 'POST', pattern: /^\/api\/inove\/usuarios(\/.*)?$/ },
  { method: 'PUT',  pattern: /^\/api\/inove\/usuarios(\/.*)?$/ },
  { method: 'GET',  pattern: /^\/api\/inove\/usuarios\/instrutor\/confirmar\/?$/ },
  { method: 'GET',  pattern: /^\/api\/inove\/usuarios\/[^/]+\/cursos\/?$/ },

  // ESCOLAS
  { method: 'POST', pattern: /^\/api\/inove\/escolas(\/.*)?$/ },
  { method: 'GET',  pattern: /^\/api\/inove\/escolas(\/.*)?$/ },
  { method: 'PUT',  pattern: /^\/api\/inove\/escolas(\/.*)?$/ },

  // CURSOS (GET liberado; veja observação sobre POST/PUT/DELETE abaixo)
  { method: 'GET',  pattern: /^\/api\/inove\/cursos\/?$/ },
  { method: 'GET',  pattern: /^\/api\/inove\/cursos\/[^/]+\/?$/ },
  { method: 'GET',  pattern: /^\/api\/inove\/cursos\/[^/]+\/preview-imagem\/?$/ },

  // STREAM DE CONTEÚDO
  { method: 'GET',  pattern: /^\/api\/inove\/cursos\/secoes\/conteudos\/stream\/[^/]+\/?$/ },

  // FEEDBACKS (todos os métodos liberados)
  { pattern: /^\/api\/inove\/feedbacks(\/.*)?$/ },
];

function isApiUrl(url: string): boolean {
  try {
    const u = new URL(url, window.location.origin);
    const base = new URL(environment.apiBaseUrl);
    return u.host === base.host;
  } catch { return false; }
}

function isPublic(method: string, path: string): boolean {
  method = method.toUpperCase();
  return PUBLIC_RULES.some(r =>
    (!r.method || r.method.toUpperCase() === method) && r.pattern.test(path)
  );
}

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!isApiUrl(req.url)) return next.handle(req);

    let cloned = req;
    try {
      const url = new URL(req.url, window.location.origin);
      const path = url.pathname;
      if (isPublic(req.method, path)) {
        if (req.headers.has('Authorization')) {
          cloned = req.clone({ headers: req.headers.delete('Authorization') });
        }
      } else {
        const token = localStorage.getItem('authToken');
        if (token) {
          cloned = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
        }
      }
    } catch { }

    return next.handle(cloned).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401) {
        }
        return throwError(() => err);
      })
    );
  }
}
