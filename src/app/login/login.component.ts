import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from "../common/service/auth.service";
import { LoginResponseDTO } from "../common/dto/LoginResponseDTO";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  showPassword: boolean = false;
  isSubmitting: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Este campo é obrigatório';
    }
    if (field?.hasError('email')) {
      return 'Digite um e-mail válido';
    }
    if (field?.hasError('minlength')) {
      return 'A senha deve ter no mínimo 6 caracteres';
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onLogin(event: Event): void {
    event.preventDefault();

    // Marcar todos os campos como touched para mostrar erros
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });

    if (this.loginForm.invalid) {
      this.toastr.warning('Por favor, preencha todos os campos corretamente', 'Atenção');
      return;
    }

    this.isSubmitting = true;
    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (response: LoginResponseDTO) => {
        console.log('Resposta do login:', response);

        this.authService.saveTokens(response.token, response.refreshToken);

        if (response.userId) {
          this.authService.saveUserId(response.userId);
        } else {
          console.error('Erro: userId não encontrado na resposta do login.');
          this.toastr.error('Erro ao recuperar informações do usuário. Tente novamente mais tarde.', 'Erro');
          this.isSubmitting = false;
          return;
        }

        const role = this.authService.getRole();
        switch (role) {
          case 'STUDENT':
            this.router.navigate(['/cursos']);
            break;
          case 'INSTRUCTOR':
            this.router.navigate(['/painel-instrutor']);
            break;
          case 'ADMINISTRATOR':
            this.router.navigate(['/painel-admin']);
            break;
          default:
            console.error('Papel desconhecido:', role);
            this.toastr.error('Erro ao determinar o papel do usuário.', 'Erro');
            this.router.navigate(['/']);
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Erro ao autenticar', error);
        this.toastr.error('Credenciais inválidas', 'Erro');
        this.isSubmitting = false;
      },
    });
  }
}
