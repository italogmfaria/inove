import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../common/service/auth.service';

@Component({
  selector: 'app-painel-instrutor',
  templateUrl: './painel-instrutor.component.html',
  styleUrls: ['./painel-instrutor.component.css']
})
export class PainelInstrutorComponent {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  activeTab: 'cursos' | 'dadosInstrutor' = 'cursos';

  cursos = [
    {
      nome: 'Curso de PowerPoint',
      descricao: 'Aprenda os fundamentos do PowerPoint.',
      secoes: ['Introdução', 'Componentes', 'Estilos'],
      dataCriacao: new Date('2023-11-01'),
      ultimaAtualizacao: new Date('2023-11-01'),
      imagem: null,
      expanded: false
    },
    {
      nome: 'Curso de Word',
      descricao: 'Domine a ferramenta mais famosa de documentações.',
      secoes: ['Fontes', 'Páginas', 'Funções'],
      dataCriacao: new Date('2023-11-01'),
      ultimaAtualizacao: new Date('2023-11-01'),
      imagem: null,
      expanded: false
    }
  ];

  cursoEdit: any = { nome: '', descricao: '', imagem: null, dataCriacao: null, ultimaAtualizacao: null };

  showUpdateCourseModal: boolean = false;

  // Abrir modal para atualizar curso
  openUpdateCourseModal(curso: any): void {
    this.cursoEdit = { ...curso };
    this.showUpdateCourseModal = true;
  }

  // Fechar modal de atualizar curso
  closeUpdateCourseModal(): void {
    this.cursoEdit = { nome: '', descricao: '', imagem: null, dataCriacao: null, ultimaAtualizacao: null };
    this.showUpdateCourseModal = false;
  }

  // Atualizar curso
  updateCourse(): void {
    const index = this.cursos.findIndex((c) => c.nome === this.cursoEdit.nome.trim());
    if (index !== -1) {
      this.cursos[index] = {
        ...this.cursos[index],
        nome: this.cursoEdit.nome.trim(),
        descricao: this.cursoEdit.descricao.trim(),
        imagem: this.cursoEdit.imagem,
        ultimaAtualizacao: new Date()
      };
      alert('Curso atualizado com sucesso!');
      this.closeUpdateCourseModal();
    } else {
      alert('Erro ao atualizar o curso.');
    }
  }

  // Lidar com upload de imagem
  handleImageUpload(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.cursoEdit.imagem = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // Alternar a exibição de detalhes do curso
  toggleCourseDetails(curso: any): void {
    curso.expanded = !curso.expanded;
  }


  instrutor = {
    nome: 'João Silva',
    email: 'joao.silva@example.com',
    cpf: '123.456.789-00'
  };

  instrutorEdit = { ...this.instrutor };

  // Estados dos Modals
  showEditInstructorModal = false;


  // Alternar entre as abas
  changeTab(tab: 'cursos' | 'dadosInstrutor'): void {
    this.activeTab = tab;
  }

  // Abrir modal de edição do instrutor
  editInstructor(): void {
    this.instrutorEdit = { ...this.instrutor };
    this.showEditInstructorModal = true;
  }

  // Fechar modal de edição do instrutor
  closeEditInstructorModal(): void {
    this.showEditInstructorModal = false;
  }

  // Atualizar dados do instrutor
  updateInstructor(): void {
    if (this.instrutorEdit.nome && this.instrutorEdit.email && this.instrutorEdit.cpf) {
      this.instrutor = { ...this.instrutorEdit };
      alert('Dados do instrutor atualizados com sucesso!');
      this.closeEditInstructorModal();
    } else {
      alert('Por favor, preencha todos os campos obrigatórios.');
    }
  }

  // Criar seções do curso
  createSections(curso: any): void {
    if (curso && curso.nome) {
      this.router.navigate(['/cadastro-secao'], {
        queryParams: { curso: curso.nome }
      });
    } else {
      alert('Erro ao redirecionar para o cadastro de seções.');
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']); 
  }

  // Navegar para outra rota
  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
