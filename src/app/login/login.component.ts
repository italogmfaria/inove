import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from "../common/service/auth.service";
import { LoginResponseDTO } from "../common/dto/LoginResponseDTO";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private authService: AuthService, private router: Router) {}

  onLogin(event: Event) {
    event.preventDefault();

    this.authService.login(this.email, this.password).subscribe({
      next: (response: LoginResponseDTO) => {
        console.log('Resposta do login:', response);
    
        this.authService.saveTokens(response.token, response.refreshToken);
    
        if (response.userId) {
          this.authService.saveUserId(response.userId);
        } else {
          console.error('Erro: userId não encontrado na resposta do login.');
          alert('Erro ao recuperar informações do usuário. Tente novamente mais tarde.');
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
            alert('Erro ao determinar o papel do usuário.');
            this.router.navigate(['/']);
        }
      },
      error: (error) => {
        console.error('Erro ao autenticar', error);
        alert('Credenciais inválidas');
      },
    });
  }    

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}
