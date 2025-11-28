import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable, BehaviorSubject} from "rxjs";
import {environment} from "../../../environments/environment";
import {LoginResponseDTO} from "../dto/LoginResponseDTO";
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = `${environment.apiBaseUrl}/auth/login`;
  private tokenSubject = new BehaviorSubject<string | null>(null);
  public token$ = this.tokenSubject.asObservable();

  constructor(
    private http: HttpClient,
    private sessionService: SessionService
  ) {
    // Tenta recuperar o token da memória ou do cookie ao inicializar
    this.initializeToken();

    // Sincroniza token do cookie continuamente
    this.startTokenSync();
  }

  /**
   * Sincroniza o token do cookie para memória periodicamente
   * Garante que mudanças em outras abas sejam detectadas
   */
  private startTokenSync(): void {
    setInterval(() => {
      const cookieToken = this.getTokenFromCookie();
      const memoryToken = this.tokenSubject.value;

      // Se o cookie mudou (login em outra aba), atualiza memória
      if (cookieToken && cookieToken !== memoryToken) {
        this.tokenSubject.next(cookieToken);
      }

      // Se não tem cookie mas tem em memória (logout em outra aba), limpa
      if (!cookieToken && memoryToken) {
        this.tokenSubject.next(null);
        this.sessionService.clearSession();
      }
    }, 1000); // Verifica a cada segundo
  }

  /**
   * Inicializa o token da memória ou do cookie
   */
  private initializeToken(): void {
    // Tenta obter do cookie (mais seguro)
    const token = this.getTokenFromCookie();
    if (token) {
      this.tokenSubject.next(token);
    }
  }

  login(email: string, password: string, recaptchaToken?: string): Observable<LoginResponseDTO> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const body: any = { email, password };

    // Adiciona o token do reCAPTCHA se estiver presente
    if (recaptchaToken) {
      body.recaptchaToken = recaptchaToken;
    }

    return this.http.post<LoginResponseDTO>(this.baseUrl, body, { headers });
  }

  /**
   * Salva os tokens de forma segura
   * O servidor DEVE enviar os tokens como HttpOnly Cookies
   * Esta função armazena o token em memória para uso da aplicação
   */
  saveTokens(token: string, refreshToken: string) {
    // Armazena em memória (não persiste ao recarregar)
    this.tokenSubject.next(token);

    // IMPORTANTE: O servidor deve enviar os tokens como HttpOnly Cookies automaticamente
    // Se não estiver fazendo isso, configure no backend:
    // - Set-Cookie: authToken=<token>; HttpOnly; Secure; SameSite=Strict; Path=/
    // - Set-Cookie: refreshToken=<refreshToken>; HttpOnly; Secure; SameSite=Strict; Path=/

    // Cria uma nova sessão ao fazer login
    this.sessionService.createSession();
  }

  saveUserId(userId: number | undefined) {
    if (userId !== undefined && userId !== null) {
      // NOTA: userId pode ser armazenado em localStorage se não contiver dados sensíveis
      localStorage.setItem('userId', userId.toString());
    } else {
      console.error('Erro: userId está indefinido ou nulo.');
    }
  }

  getUserId(): number | null {
    const userId = localStorage.getItem('userId');
    return userId ? parseInt(userId, 10) : null;
  }

  getToken(): string | null {
    // Prioridade: memória -> cookie -> null
    const memoryToken = this.tokenSubject.value;
    if (memoryToken) {
      return memoryToken;
    }
    return this.getTokenFromCookie();
  }

  /**
   * Obtém o token do cookie
   * Tenta ler authTokenReadable (sem HttpOnly) para sincronização
   * O navegador também envia authToken (HttpOnly) automaticamente nas requisições
   */
  private getTokenFromCookie(): string | null {
    // Primeira tentativa: authTokenReadable (para leitura no frontend)
    const readableName = 'authTokenReadable=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');

    for (let cookie of cookieArray) {
      cookie = cookie.trim();
      if (cookie.indexOf(readableName) === 0) {
        return cookie.substring(readableName.length, cookie.length);
      }
    }

    // Se não encontrar authTokenReadable, tenta authToken
    // (Este será nulo porque HttpOnly não pode ser lido via JS,
    // mas mantém a compatibilidade)
    const authName = 'authToken=';
    for (let cookie of cookieArray) {
      cookie = cookie.trim();
      if (cookie.indexOf(authName) === 0) {
        return cookie.substring(authName.length, cookie.length);
      }
    }

    return null;
  }

  getRefreshToken(): string | null {
    // O refresh token também deve vir de um HttpOnly Cookie
    // O navegador o envia automaticamente nas requisições
    const name = 'refreshToken=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');

    for (let cookie of cookieArray) {
      cookie = cookie.trim();
      if (cookie.indexOf(name) === 0) {
        return cookie.substring(name.length, cookie.length);
      }
    }
    return null;
  }

  logout(): Observable<void> {
    // Chamada ao backend para limpar cookies
    const logoutUrl = `${environment.apiBaseUrl}/auth/logout`;

    return new Observable(observer => {
      this.http.post<void>(logoutUrl, {}).subscribe({
        next: () => {
          // Limpa a memória
          this.tokenSubject.next(null);
          localStorage.removeItem('userId');

          // Limpa os cookies localmente
          this.clearTokenCookies();

          // Limpa a sessão
          this.sessionService.clearSession();

          observer.next();
          observer.complete();
        },
        error: (err) => {
          // Mesmo com erro, limpa localmente
          this.tokenSubject.next(null);
          localStorage.removeItem('userId');
          this.clearTokenCookies();
          this.sessionService.clearSession();

          observer.error(err);
        }
      });
    });
  }

  /**
   * Limpa os cookies de autenticação
   */
  private clearTokenCookies(): void {
    // Tenta limpar os cookies localmente (o servidor deve fazer isso)
    // Limpa com diferentes configurações para garantir remoção
    const expiryDate = 'Thu, 01 Jan 1970 00:00:00 UTC';

    // Limpar authToken (HttpOnly)
    document.cookie = `authToken=; expires=${expiryDate}; path=/; SameSite=Strict;`;

    // Limpar refreshToken (HttpOnly)
    document.cookie = `refreshToken=; expires=${expiryDate}; path=/; SameSite=Strict;`;

    // Limpar authTokenReadable (sem HttpOnly, para sincronização frontend)
    document.cookie = `authTokenReadable=; expires=${expiryDate}; path=/; SameSite=Strict;`;
  }

  getRole(): string | null {
    const token = this.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.role;
      } catch (e) {
        console.error('Erro ao decodificar o token:', e);
        return null;
      }
    }
    return null;
  }

  /**
   * Verifica se o token está armazenado
   */
  isTokenStored(): boolean {
    return !!this.getToken();
  }
}
