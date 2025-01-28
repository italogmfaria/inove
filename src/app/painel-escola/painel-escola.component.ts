import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../common/service/auth.service';

@Component({
  selector: 'app-painel-escola',
  templateUrl: './painel-escola.component.html',
  styleUrls: ['./painel-escola.component.css'],
})
export class PainelEscolaComponent {
  activeTab: 'usuarios' | 'dadosEscola' = 'usuarios';

  // Data for users and school
  usuarios = [
    { nome: 'João Gabriel', email: 'joaogabriel@example.com', cpf: '000.000.000-00' },
    { nome: 'José Antonio', email: 'joseantonio@example.com', cpf: '000.000.000-01' },
    { nome: 'Diego Ribeiro', email: 'diegoribeiro@example.com', cpf: '000.000.000-02' },
  ];

  escola = {
    nome: 'Escola ABC',
    email: 'contato@escolaabc.com',
    cidade: 'São Paulo',
    estado: 'SP',
  };

  // Modal States
  showEditUserModal: boolean = false;
  showEditEscolaModal: boolean = false;
  showAddUserModal: boolean = false;

  newUser: any = { nome: '', email: '', cpf: '' };
  usuarioEdit: any = { nome: '', email: '', cpf: '' };
  escolaEdit: any = { nome: '', email: '', cidade: '', estado: '' };


  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  // Abrir modal para adicionar usuário
  openAddUserModal(): void {
    this.newUser = { nome: '', email: '', cpf: '' };
    this.showAddUserModal = true;
  }

  // Fechar modal para adicionar usuário
  closeAddUserModal(): void {
    this.newUser = { nome: '', email: '', cpf: '' };
    this.showAddUserModal = false;
  }

  // Salvar o novo usuário
  saveUser(): void {
    if (this.newUser.nome && this.newUser.email && this.newUser.cpf) {
      const cpfExists = this.usuarios.some((u) => u.cpf === this.newUser.cpf);

      if (cpfExists) {
        alert('Já existe um usuário com este CPF.');
      } else {
        this.usuarios.push({ ...this.newUser });
        alert('Usuário adicionado com sucesso!');
        this.closeAddUserModal();
      }
    } else {
      alert('Por favor, preencha todos os campos.');
    }
  }

  // Navigation
  changeTab(tab: 'usuarios' | 'dadosEscola'): void {
    this.activeTab = tab;
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']); 
  }

  // User Management
  editUser(index: number): void {
    this.usuarioEdit = { ...this.usuarios[index] };
    this.showEditUserModal = true;
  }

  closeUserModal(): void {
    this.usuarioEdit = { nome: '', email: '', cpf: '' };
    this.showEditUserModal = false;
  }

  updateUser(): void {
    const index = this.usuarios.findIndex(u => u.cpf === this.usuarioEdit.cpf);
    if (index !== -1) {
      this.usuarios[index] = { ...this.usuarioEdit };
      alert('Usuário atualizado com sucesso!');
    }
    this.closeUserModal();
  }

  deleteUser(index: number): void {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      this.usuarios.splice(index, 1);
    }
  }

  addUser(): void {
    alert('Funcionalidade para adicionar novo usuário.');
  }

  // Escola Management
  editEscola(): void {
    this.escolaEdit = { ...this.escola };
    this.showEditEscolaModal = true;
  }

  closeEscolaModal(): void {
    this.escolaEdit = { nome: '', email: '', cidade: '', estado: '' };
    this.showEditEscolaModal = false;
  }

  updateEscola(): void {
    this.escola = { ...this.escolaEdit };
    alert('Dados da escola atualizados com sucesso!');
    this.closeEscolaModal();
  }
}
