import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {LoginService} from '../common/service/login.service';
import {LoginResponseDTO} from "../common/dto/LoginResponseDTO";
import {AuthService} from "../common/service/auth.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private authService: AuthService, private router: Router) {}

  onLogin(event: Event) {
    event.preventDefault();

    this.authService.login(this.email, this.password).subscribe({
      next: (response: LoginResponseDTO) => {
        this.authService.saveTokens(response.token, response.refreshToken);
        this.router.navigate(['/cursos']);
      },
      error: (error) => {
        console.error('Erro ao autenticar', error);
        alert('Credenciais inválidas');
      }
    });
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}


