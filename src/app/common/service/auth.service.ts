import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, BehaviorSubject } from "rxjs";
import { environment } from "../../../environments/environment";
import { LoginResponseDTO } from "../dto/LoginResponseDTO";
import { SessionService } from './session.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = `${environment.apiBaseUrl}/auth/login`;
  private tokenSubject = new BehaviorSubject<string | null>(this.getStoredToken());
  public token$ = this.tokenSubject.asObservable();

  // Chaves para armazenamento
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_ID_KEY = 'user_id';

  constructor(
    private http: HttpClient,
    private sessionService: SessionService,
    private toastr: ToastrService
  ) {}

  /**
   * Faz login e retorna os tokens
   */
  login(email: string, password: string, recaptchaToken?: string): Observable<LoginResponseDTO> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const body: any = { email, password };

    if (recaptchaToken) {
      body.recaptchaToken = recaptchaToken;
    }

    return this.http.post<LoginResponseDTO>(this.baseUrl, body, { headers });
  }

  /**
   * Salva os tokens no localStorage
   */
  saveTokens(token: string, refreshToken: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    this.tokenSubject.next(token);
    this.sessionService.createSession();
  }

  /**
   * Obtém o token do localStorage
   */
  getToken(): string | null {
    return this.getStoredToken();
  }

  /**
   * Método privado para obter token do storage
   */
  private getStoredToken(): string | null {
    try {
      const token = localStorage.getItem(this.TOKEN_KEY);
      return token ? token : null;
    } catch (e) {
      this.toastr.error('Erro ao acessar armazenamento local', 'Erro');
      return null;
    }
  }

  /**
   * Obtém o refresh token
   */
  getRefreshToken(): string | null {
    try {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    } catch (e) {
      this.toastr.error('Erro ao obter token de atualização', 'Erro');
      return null;
    }
  }

  /**
   * Salva o ID do usuário
   */
  saveUserId(userId: number | undefined): void {
    if (userId !== undefined && userId !== null) {
      localStorage.setItem(this.USER_ID_KEY, userId.toString());
    } else {
      this.toastr.error('Erro: Informações de usuário inválidas', 'Erro');
    }
  }

  /**
   * Obtém o ID do usuário
   */
  getUserId(): number | null {
    try {
      const userId = localStorage.getItem(this.USER_ID_KEY);
      return userId ? parseInt(userId, 10) : null;
    } catch (e) {
      this.toastr.error('Erro ao obter ID do usuário', 'Erro');
      return null;
    }
  }

  /**
   * Faz logout
   */
  logout(): Observable<void> {
    const logoutUrl = `${environment.apiBaseUrl}/auth/logout`;

    return new Observable(observer => {
      this.http.post<void>(logoutUrl, {}).subscribe({
        next: () => {
          this.clearAuth();
          observer.next();
          observer.complete();
        },
        error: (err) => {
          this.clearAuth();
          observer.error(err);
        }
      });
    });
  }

  /**
   * Limpa todos os dados de autenticação
   */
  private clearAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_ID_KEY);
    this.tokenSubject.next(null);
    this.sessionService.clearSession();
  }

  /**
   * Obtém a role do usuário decodificando o JWT
   */
  getRole(): string | null {
    const token = this.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.role || payload.authorities?.[0]?.authority;
      } catch (e) {
        this.toastr.error('Erro ao processar dados de autenticação', 'Erro');
        return null;
      }
    }
    return null;
  }

  /**
   * Verifica se o token existe e é válido
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  /**
   * Verifica se o token está expirado
   */
  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000;
      return Date.now() >= expirationTime;
    } catch (e) {
      this.toastr.error('Erro ao validar autenticação', 'Erro');
      return true;
    }
  }
}
