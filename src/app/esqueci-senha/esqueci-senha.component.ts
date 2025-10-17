import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { PasswordRecoveryService } from '../common/service/password-recovery.service';

@Component({
  selector: 'app-esqueci-senha',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './esqueci-senha.component.html',
  styleUrl: './esqueci-senha.component.css'
})
export class EsqueciSenhaComponent {
  email: string = '';
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private passwordRecoveryService: PasswordRecoveryService
  ) {}

  enviarCodigo(): void {
    if (!this.email) {
      this.toastr.warning('Por favor, digite seu e-mail.', 'Atenção');
      return;
    }

    // Validar formato de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.toastr.error('Por favor, digite um e-mail válido.', 'Erro');
      return;
    }

    this.isLoading = true;

    this.passwordRecoveryService.requestRecoveryCode(this.email).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastr.success('Código enviado para seu e-mail!', 'Sucesso');
        // Navegar para verificar código passando o e-mail
        this.router.navigate(['/verificar-codigo'], {
          queryParams: { email: this.email }
        });
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Erro ao enviar código:', error);
        // Por segurança, mesmo em erro mostramos mensagem de sucesso
        this.toastr.success('Se o e-mail estiver cadastrado, você receberá o código.', 'Enviado');
        this.router.navigate(['/verificar-codigo'], {
          queryParams: { email: this.email }
        });
      }
    });
  }

  voltarLogin(): void {
    this.router.navigate(['/login']);
  }
}
