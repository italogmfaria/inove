import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  // Usamos chaves diferentes para sessionStorage (limpas ao fechar a aba)
  private sessionIdKey = 'sessionId';
  private sessionActiveKey = 'sessionActive';

  // Em memória (mais seguro)
  private sessionId: string | null = null;
  private isSessionActive: boolean = false;
  private sessionIdSubject = new BehaviorSubject<string | null>(null);
  public sessionId$ = this.sessionIdSubject.asObservable();

  constructor() {
    this.initializeSession();
    this.setupStorageListener();
  }

  /**
   * Inicializa a sessão da aba atual
   */
  private initializeSession(): void {
    // Tenta recuperar do sessionStorage (apenas desta aba)
    let sessionId = this.getSessionIdFromStorage();
    let sessionActive = this.getSessionActiveFromStorage();

    // Se não tem sessionId, gera um novo
    if (!sessionId) {
      sessionId = this.generateSessionId();
      this.setSessionIdToStorage(sessionId);
      this.isSessionActive = true;
      this.markSessionAsActive();
    } else {
      // Se já tinha sessionId, mantém o estado de ativo do sessionStorage
      this.isSessionActive = sessionActive;
    }

    this.sessionId = sessionId;
    this.sessionIdSubject.next(sessionId);
  }

  /**
   * Monitora mudanças em outras abas
   */
  private setupStorageListener(): void {
    window.addEventListener('storage', (event) => {
      // Se o sessionId foi alterado em outra aba, força logout
      if (event.key === this.sessionIdKey && event.newValue !== this.sessionId) {
        this.handleSessionConflict();
      }

      // Se a sessão foi marcada como inativa em outra aba
      if (event.key === this.sessionActiveKey && event.newValue === 'false') {
        this.handleSessionLogout();
      }
    });

    // Monitora quando a aba é fechada
    window.addEventListener('beforeunload', () => {
      // Verifica se existem outras abas abertas
      if (!this.hasOtherTabs()) {
        this.markSessionAsInactive();
      }
    });
  }

  /**
   * Cria uma nova sessão (chamado ao fazer login)
   */
  createSession(): string {
    const sessionId = this.generateSessionId();
    this.setSessionIdToStorage(sessionId);
    this.sessionId = sessionId;
    this.isSessionActive = true;
    this.markSessionAsActive();
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
   * Obtém o ID da sessão atual (em memória)
   */
  getSessionId(): string | null {
    return this.sessionId;
  }

  /**
   * Define o ID da sessão no sessionStorage
   * sessionStorage é mais seguro que localStorage - limpa ao fechar a aba
   */
  private setSessionIdToStorage(sessionId: string): void {
    try {
      sessionStorage.setItem(this.sessionIdKey, sessionId);
    } catch (e) {
      console.warn('sessionStorage não disponível, usando apenas memória', e);
    }
  }

  /**
   * Obtém o ID da sessão do sessionStorage
   */
  private getSessionIdFromStorage(): string | null {
    try {
      return sessionStorage.getItem(this.sessionIdKey);
    } catch (e) {
      console.warn('sessionStorage não disponível', e);
      return null;
    }
  }

  /**
   * Obtém o estado ativo da sessão do sessionStorage
   */
  private getSessionActiveFromStorage(): boolean {
    try {
      const active = sessionStorage.getItem(this.sessionActiveKey);
      return active === 'true';
    } catch (e) {
      console.warn('sessionStorage não disponível', e);
      return true; // Por padrão, assume que está ativo
    }
  }

  /**
   * Marca a sessão como ativa
   */
  private markSessionAsActive(): void {
    try {
      sessionStorage.setItem(this.sessionActiveKey, 'true');
    } catch (e) {
      console.warn('sessionStorage não disponível', e);
    }
  }

  /**
   * Marca a sessão como inativa
   */
  private markSessionAsInactive(): void {
    try {
      sessionStorage.setItem(this.sessionActiveKey, 'false');
    } catch (e) {
      console.warn('sessionStorage não disponível', e);
    }
  }

  /**
   * Verifica se existem outras abas abertas
   */
  private hasOtherTabs(): boolean {
    // Usa sessionStorage para contar quantas abas estão ativas
    try {
      const tabCountKey = 'activeTabsCount';
      const currentCount = parseInt(sessionStorage.getItem(tabCountKey) || '0', 10);
      return currentCount > 1;
    } catch (e) {
      return false;
    }
  }

  /**
   * Registra a aba como ativa (chamado ao abrir a aplicação)
   */
  registerTab(): void {
    try {
      const tabCountKey = 'activeTabsCount';
      const currentCount = parseInt(sessionStorage.getItem(tabCountKey) || '0', 10);
      sessionStorage.setItem(tabCountKey, (currentCount + 1).toString());

      // Remove o contador quando a aba fecha
      window.addEventListener('beforeunload', () => {
        const count = parseInt(sessionStorage.getItem(tabCountKey) || '1', 10);
        sessionStorage.setItem(tabCountKey, Math.max(0, count - 1).toString());
      });
    } catch (e) {
      console.warn('sessionStorage não disponível', e);
    }
  }

  /**
   * Trata conflito de sessão (usuário logado em outra aba)
   */
  private handleSessionConflict(): void {
    console.warn('Sessão detectada em outra aba. Atualizando...');
    this.isSessionActive = false;
    window.location.href = '/login';
  }

  /**
   * Trata logout da sessão
   */
  private handleSessionLogout(): void {
    console.warn('Sessão encerrada em outra aba.');
    this.isSessionActive = false;
    window.location.href = '/login';
  }

  /**
   * Verifica se a sessão atual é válida
   */
  isSessionValid(): boolean {
    return this.isSessionActive && !!this.sessionId;
  }

  /**
   * Limpa a sessão (chamado ao fazer logout)
   */
  clearSession(): void {
    this.sessionId = null;
    this.isSessionActive = false;
    this.sessionIdSubject.next(null);

    try {
      sessionStorage.removeItem(this.sessionIdKey);
      sessionStorage.removeItem(this.sessionActiveKey);
      const tabCountKey = 'activeTabsCount';
      const currentCount = parseInt(sessionStorage.getItem(tabCountKey) || '1', 10);
      sessionStorage.setItem(tabCountKey, Math.max(0, currentCount - 1).toString());
    } catch (e) {
      console.warn('sessionStorage não disponível', e);
    }
  }
}

