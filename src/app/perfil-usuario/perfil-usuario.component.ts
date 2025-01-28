import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../common/service/auth.service';


@Component({
  selector: 'app-perfil-usuario',
  templateUrl: './perfil-usuario.component.html',
  styleUrls: ['./perfil-usuario.component.css'],
})
export class PerfilUsuarioComponent {
  activePanel: 'cursos' | 'dados' = 'cursos';
  isEditing: boolean = false;

  user = {
    nome: 'João Silva',
    email: 'joao.silva@example.com',
    cpf: '123.456.789-00',
    escola:"Escola Municipal Maria Cândida de Jesus",
  };

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']); 
  }

  switchPanel(panel: 'cursos' | 'dados'): void {
    this.activePanel = panel;
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
  }
}
