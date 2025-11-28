import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private sessionIdKey = 'sessionId';
  private sessionId: string | null = null;
  private sessionIdSubject = new BehaviorSubject<string | null>(null);
  public sessionId$ = this.sessionIdSubject.asObservable();

  constructor() {
    this.initializeSession();
  }

  /**
   * Inicializa a sessão
   */
  private initializeSession(): void {
    let sessionId = this.getSessionIdFromStorage();

    if (!sessionId) {
      sessionId = this.generateSessionId();
      this.setSessionIdToStorage(sessionId);
    }

    this.sessionId = sessionId;
    this.sessionIdSubject.next(sessionId);
  }

  /**
   * Cria uma nova sessão (chamado ao fazer login)
   */
  createSession(): string {
    const sessionId = this.generateSessionId();
    this.setSessionIdToStorage(sessionId);
    this.sessionId = sessionId;
    this.sessionIdSubject.next(sessionId);
    return sessionId;
  }

  /**
   * Gera um ID único para a sessão
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Obtém o ID da sessão
   */
  getSessionId(): string | null {
    return this.sessionId;
  }

  /**
   * Define o ID da sessão no sessionStorage
   */
  private setSessionIdToStorage(sessionId: string): void {
    try {
      sessionStorage.setItem(this.sessionIdKey, sessionId);
    } catch (e) {
      // sessionStorage indisponível
    }
  }

  /**
   * Obtém o ID da sessão do sessionStorage
   */
  private getSessionIdFromStorage(): string | null {
    try {
      return sessionStorage.getItem(this.sessionIdKey);
    } catch (e) {
      return null;
    }
  }

  /**
   * Verifica se a sessão é válida
   */
  isSessionValid(): boolean {
    return !!this.sessionId;
  }

  /**
   * Limpa a sessão
   */
  clearSession(): void {
    this.sessionId = null;
    this.sessionIdSubject.next(null);

    try {
      sessionStorage.removeItem(this.sessionIdKey);
    } catch (e) {
      // sessionStorage indisponível
    }
  }
}
