import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {LoginService} from '../common/service/login.service';
import {LoginResponseDTO} from "../common/dto/LoginResponseDTO";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(private router: Router,
              private loginService: LoginService) {}

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  onLogin(event: Event) {
    event.preventDefault();
    if (this.email && this.password) {
      this.loginService.login(this.email, this.password).subscribe(
        (response: LoginResponseDTO) => {
          console.log('Login bem-sucedido!', response);

          localStorage.setItem('authToken', response.token);

          this.router.navigate(['/cursos']);
        },
        (error) => {
          console.error('Erro no login:', error);
          alert('Credenciais inválidas. Verifique e tente novamente.');
        }
      );
    } else {
      alert('Por favor, preencha todos os campos.');
    }
  }
}
