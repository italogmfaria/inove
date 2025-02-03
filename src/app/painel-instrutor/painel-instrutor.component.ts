import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../common/service/auth.service';
import { UserService } from '../common/service/user.service';
import { FileService } from '../common/service/file.service';
import { CourseService } from '../common/service/course.service';

@Component({
  selector: 'app-painel-instrutor',
  templateUrl: './painel-instrutor.component.html',
  styleUrls: ['./painel-instrutor.component.css']
})
export class PainelInstrutorComponent {
  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private fileService: FileService,
    private courseService: CourseService
  ) {}

  activeTab: 'cursos' | 'dadosInstrutor' = 'cursos';
  instrutor: any = {};
  instrutorEdit: any = {};
  showEditInstructorModal = false;
  isLoading: boolean = false; 

  cursos: any[] = [];

  cursoEdit: any = { id: 0, name: '', description: '', imageUrl: '', creationDate: null, lastUpdateDate: null };
  showUpdateCourseModal: boolean = false;
  selectedImageFile: File | null = null;

  ngOnInit(): void {
    this.loadInstructorData();
    this.loadInstructorCourses();
  }


  isLoadingImage: boolean = false; // Indica se a imagem do curso está carregando

// Abrir modal para editar curso e carregar a imagem da nuvem
openUpdateCourseModal(curso: any): void {
  if (curso) {
    this.cursoEdit = { 
      id: curso.id, 
      name: curso.name, 
      description: curso.description, 
      imageUrl: '', // Inicializa vazio
      creationDate: curso.creationDate, 
      lastUpdateDate: curso.lastUpdateDate 
    };

    // Adicionar loading para o preview da imagem
    this.isLoadingImage = true;

    // Chamar o serviço para obter a URL da imagem do curso
    this.fileService.getCourseImage(curso.id).subscribe(
      (response) => {
        this.cursoEdit.imageUrl = response.imageUrl;
        this.isLoadingImage = false; // Desativar loading após carregar
        console.log("URL carregada diretamente para o S3:", this.cursoEdit.imageUrl);
      },
      (error) => {
        console.error('Erro ao carregar a imagem do curso:', error);
        this.isLoadingImage = false;
      }
    );

    this.selectedImageFile = null; 
    this.showUpdateCourseModal = true;
  } else {
    console.error("Erro: Nenhum curso selecionado.");
  }
}

// Carregar imagem do curso ao abrir o modal
loadCourseImage(courseId: number): void {
  if (!courseId) return;

  this.isLoadingImage = true; // Ativar o loading enquanto carrega a imagem

  this.fileService.getCourseImage(courseId).subscribe(
    (imageUrl) => {
      this.cursoEdit.imageUrl = imageUrl;
      this.isLoadingImage = false; // Desativar o loading quando a imagem carregar
    },
    (error) => {
      console.error('Erro ao carregar a imagem do curso:', error);
      this.isLoadingImage = false;
    }
  );
}

// Upload de imagem
handleImageUpload(event: any): void {
  const file = event.target.files[0];
  if (file) {
    this.selectedImageFile = file;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.cursoEdit.imageUrl = e.target.result; 
    };
    reader.readAsDataURL(file);
  }
}

updateCourse(): void {
  this.isLoading = true; 

  if (this.selectedImageFile) {
    this.fileService.uploadCourseImage(this.cursoEdit.id, this.selectedImageFile).subscribe(
      (imageUrl) => {
        this.cursoEdit.imageUrl = imageUrl;
        this.updateCourseData(); 
      },
      (error) => {
        console.error('Erro ao fazer upload da imagem:', error);
        alert('Erro ao enviar a imagem. Tente novamente.');
        this.isLoading = false; 
      }
    );
  } else {
    this.updateCourseData(); 
  }
}

  
  private updateCourseData(): void {
    const coursePayload = {
      name: this.cursoEdit.name,
      description: this.cursoEdit.description,
      imageUrl: this.cursoEdit.imageUrl
    };
  
    this.courseService.updateCourseInstructor(this.cursoEdit.id, coursePayload).subscribe(
      () => {
        this.isLoading = false;
        alert('Curso atualizado com sucesso!');
        this.loadInstructorCourses();
        this.closeUpdateCourseModal();
      },
      (error) => {
        this.isLoading = false; 
        alert('Erro ao atualizar o curso.');
        console.error(error);
      }
    );
  }
  

  // Carregar cursos em que o instrutor está vinculado
  loadInstructorCourses(): void {
    const userId = localStorage.getItem('userId');
    if (userId) {
      this.courseService.getInstructorCourses(+userId).subscribe((cursos) => {
        this.cursos = cursos;
      });
    }
  }

  // Alternar a exibição de detalhes do curso
  toggleCourseDetails(curso: any): void {
    curso.expanded = !curso.expanded;
  }

  // Criar seções do curso
  createSections(curso: any): void {
    if (curso && curso.id) {
      this.router.navigate(['/cadastro-secao'], { queryParams: { cursoId: curso.id } });
    } else {
      alert('Erro ao redirecionar para o cadastro de seções.');
      console.error("Erro: curso.id está indefinido.");
    }
  }
  

// Fechar modal de edição de curso
closeUpdateCourseModal(): void {
  this.showUpdateCourseModal = false;
}



// INSTRUCTOR DADOS

  loadInstructorData(): void {
    const userId = localStorage.getItem('userId'); 
    if (userId) {
      this.userService.getUserById(+userId).subscribe((user) => {
        this.instrutor = user;
        this.instrutorEdit = { ...user };
      });
    }
  }

  changeTab(tab: 'cursos' | 'dadosInstrutor'): void {
    this.activeTab = tab;
  }

  editInstructor(): void {
    this.instrutorEdit = { ...this.instrutor };
    this.showEditInstructorModal = true;
  }

  closeEditInstructorModal(): void {
    this.showEditInstructorModal = false;
  }

  updateInstructor(): void {
    if (!this.instrutorEdit.name || !this.instrutorEdit.email) {
      alert('Nome e Email são obrigatórios!');
      return;
    }

    this.userService.updateUser({
      id: this.instrutor.id,
      name: this.instrutorEdit.name,
      email: this.instrutorEdit.email
    }).subscribe(() => {
      this.instrutor = { ...this.instrutorEdit };
      alert('Dados do instrutor atualizados com sucesso!');
      this.closeEditInstructorModal();
    }, error => {
      alert('Erro ao atualizar os dados.');
      console.error(error);
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
