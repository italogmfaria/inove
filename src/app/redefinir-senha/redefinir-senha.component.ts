import { Component, OnInit, DoCheck } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-redefinir-senha',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './redefinir-senha.component.html',
  styleUrl: './redefinir-senha.component.css'
})
export class RedefinirSenhaComponent implements OnInit, DoCheck {
  email: string = '';
  code: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  isLoading: boolean = false;

  passwordValidation = {
    minLength: false,
    hasUpper: false,
    hasLower: false,
    hasNumber: false
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    // Obter e-mail e código dos parâmetros da rota
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      this.code = params['code'] || '';

      if (!this.email || !this.code) {
        this.toastr.error('Informações de recuperação inválidas. Redirecionando...', 'Erro');
        this.router.navigate(['/esqueci-senha']);
      }
    });
  }

  // Adicionar validação ao digitar
  ngDoCheck(): void {
    if (this.newPassword) {
      this.validatePassword();
    }
  }

  validatePassword(): void {
    this.passwordValidation.minLength = this.newPassword.length >= 8;
    this.passwordValidation.hasUpper = /[A-Z]/.test(this.newPassword);
    this.passwordValidation.hasLower = /[a-z]/.test(this.newPassword);
    this.passwordValidation.hasNumber = /[0-9]/.test(this.newPassword);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  isFormValid(): boolean {
    const isPasswordValid =
      this.passwordValidation.minLength &&
      this.passwordValidation.hasUpper &&
      this.passwordValidation.hasLower &&
      this.passwordValidation.hasNumber;

    return isPasswordValid &&
           this.newPassword === this.confirmPassword &&
           this.newPassword.length > 0;
  }

  redefinirSenha(): void {
    // Validar se as senhas são válidas
    this.validatePassword();

    if (!this.isFormValid()) {
      if (this.newPassword !== this.confirmPassword) {
        this.toastr.error('As senhas não coincidem.', 'Erro');
      } else {
        this.toastr.error('A senha não atende aos requisitos.', 'Erro');
      }
      return;
    }

    this.isLoading = true;

    // Simular redefinição de senha (substituir por chamada real à API)
    setTimeout(() => {
      this.isLoading = false;
      this.toastr.success('Senha redefinida com sucesso!', 'Sucesso');
      // Navegar para login
      this.router.navigate(['/login']);
    }, 1500);
  }

  voltarLogin(): void {
    this.router.navigate(['/login']);
  }
}
