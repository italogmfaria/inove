import { Component, OnInit } from '@angular/core';
import { SessionService } from './common/service/session.service';
import { AuthService } from './common/service/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'Inove-Painel';

  constructor(
    private sessionService: SessionService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Registra esta aba como ativa
    this.sessionService.registerTab();

    // Sincroniza o token dos cookies ao carregar a página
    this.initializeAuthState();
  }

  /**
   * Inicializa o estado de autenticação a partir dos cookies
   */
  private initializeAuthState(): void {
    const token = this.authService.getToken();

    if (token) {
      // Token existe (do cookie), inicializa a sessão
      this.sessionService.createSession();
    }
  }
}
