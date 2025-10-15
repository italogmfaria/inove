import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

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
    private toastr: ToastrService
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

    // Simular envio de código (substituir por chamada real à API)
    setTimeout(() => {
      this.isLoading = false;
      this.toastr.success('Código enviado para seu e-mail!', 'Sucesso');
      // Navegar para verificar código passando o e-mail
      this.router.navigate(['/verificar-codigo'], {
        queryParams: { email: this.email }
      });
    }, 1500);
  }

  voltarLogin(): void {
    this.router.navigate(['/login']);
  }
}

