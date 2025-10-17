import { Component, OnInit, DoCheck } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { PasswordRecoveryService } from '../common/service/password-recovery.service';

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
    hasNumber: false,
    hasLetter: false,
    passwordsMatch: false
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private passwordRecoveryService: PasswordRecoveryService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      this.code = params['code'] || '';

      if (!this.email || !this.code) {
        this.toastr.error('Informações de recuperação inválidas. Redirecionando...', 'Erro');
        this.router.navigate(['/esqueci-senha']);
      }
    });
  }

  ngDoCheck(): void {
    if (this.newPassword) {
      this.validatePassword();
    }
    if (this.confirmPassword) {
      this.checkPasswordsMatch();
    }
  }

  validatePassword(): void {
    this.passwordValidation.minLength = this.newPassword.length >= 6;
    this.passwordValidation.hasNumber = /[0-9]/.test(this.newPassword);
    this.passwordValidation.hasLetter = /[a-zA-Z]/.test(this.newPassword);
  }

  checkPasswordsMatch(): void {
    this.passwordValidation.passwordsMatch =
      this.newPassword === this.confirmPassword &&
      this.confirmPassword.length > 0;
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
      this.passwordValidation.hasNumber &&
      this.passwordValidation.hasLetter;

    return isPasswordValid &&
           this.passwordValidation.passwordsMatch;
  }

  redefinirSenha(): void {
    this.validatePassword();
    this.checkPasswordsMatch();

    if (!this.isFormValid()) {
      if (this.newPassword !== this.confirmPassword) {
        this.toastr.error('As senhas não coincidem.', 'Erro');
      } else {
        this.toastr.error('A senha não atende aos requisitos.', 'Erro');
      }
      return;
    }

    this.isLoading = true;

    this.passwordRecoveryService.resetPassword(this.email, this.code, this.newPassword).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastr.success('Senha redefinida com sucesso!', 'Sucesso');
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Erro ao redefinir senha:', error);
        const errorMessage = error?.error?.message || 'Erro ao redefinir senha. Tente novamente.';
        this.toastr.error(errorMessage, 'Erro');
      }
    });
  }

  voltarLogin(): void {
    this.router.navigate(['/login']);
  }
}
