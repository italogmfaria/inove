import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../common/service/auth.service';
import { UserService } from '../common/service/user.service';
import { FileService } from '../common/service/file.service';
import { CourseService } from '../common/service/course.service';
import { ToastrService } from 'ngx-toastr';
import { CpfValidator } from '../common/validators/cpf.validator';

@Component({
  selector: 'app-painel-instrutor',
  templateUrl: './painel-instrutor.component.html',
  styleUrls: ['./painel-instrutor.component.css']
})
export class PainelInstrutorComponent implements OnInit {
  activeTab: 'cursos' | 'dadosInstrutor' = 'cursos';
  instrutor: any = {};
  instrutorEdit: any = {};
  showEditInstructorModal = false;
  isLoading: boolean = false;
  isLoadingImage: boolean = false;

  cursos: any[] = [];

  cursoEdit: any = { id: 0, name: '', description: '', imageUrl: '', creationDate: null, lastUpdateDate: null };
  showUpdateCourseModal: boolean = false;
  selectedImageFile: File | null = null;

  showConfirmModal: boolean = false;
  confirmationTitle: string = '';
  confirmationMessage: string = '';
  private pendingAction: (() => void) | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private fileService: FileService,
    private courseService: CourseService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadInstructorData();
    this.loadInstructorCourses();
  }

  openUpdateCourseModal(curso: any): void {
    if (curso) {
      this.cursoEdit = {
        id: curso.id,
        name: curso.name,
        description: curso.description,
        imageUrl: '',
        creationDate: curso.creationDate,
        lastUpdateDate: curso.lastUpdateDate
      };

      this.isLoadingImage = true;

      this.fileService.getCourseImage(curso.id).subscribe(
        (response) => {
          this.cursoEdit.imageUrl = response.imageUrl;
          this.isLoadingImage = false;
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
    if (!this.cursoEdit.name || this.cursoEdit.name.trim().length === 0) {
      this.toastr.warning('O nome do curso é obrigatório.', 'Atenção');
      return;
    }

    this.isLoading = true;

    if (this.selectedImageFile) {
      const maxSize = 5 * 1024 * 1024;
      if (this.selectedImageFile.size > maxSize) {
        this.toastr.error('A imagem deve ter no máximo 5MB', 'Erro');
        this.isLoading = false;
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(this.selectedImageFile.type)) {
        this.toastr.error('Formato de imagem não suportado. Use JPG ou PNG', 'Erro');
        this.isLoading = false;
        return;
      }

      this.fileService.uploadCourseImage(this.cursoEdit.id, this.selectedImageFile).subscribe({
        next: (imageUrl) => {
          this.cursoEdit.imageUrl = imageUrl;
          this.updateCourseData();
        },
        error: (error) => {
          console.error('Erro detalhado ao fazer upload da imagem:', error);
          this.toastr.error(error.message || 'Erro ao enviar a imagem. Tente novamente.', 'Erro');
          this.isLoading = false;
        }
      });
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
        this.toastr.success('Curso atualizado com sucesso!', 'Sucesso');
        this.loadInstructorCourses();
        this.closeUpdateCourseModal();
      },
      (error) => {
        this.isLoading = false;
        this.toastr.error('Erro ao atualizar o curso.', 'Erro');
        console.error(error);
      }
    );
  }

  loadInstructorCourses(): void {
    const userId = localStorage.getItem('userId');
    if (userId) {
      this.courseService.getInstructorCourses(+userId).subscribe((cursos) => {
        this.cursos = cursos;
        this.cursos.forEach(curso => {
          this.fileService.getCourseImage(curso.id).subscribe(
            (response) => {
              curso.imageUrl = response.imageUrl;
            },
            (error) => {
              console.error('Erro ao carregar imagem do curso:', error);
              curso.imageUrl = 'assets/placeholder.png';
            }
          );
        });
      });
    }
  }

  createSections(curso: any): void {
    if (curso && curso.id) {
      this.router.navigate(['/cadastro-secao', curso.id]);
    } else {
      this.toastr.error('Erro ao redirecionar para o cadastro de seções.', 'Erro');
      console.error("Erro: curso.id está indefinido.");
    }
  }

  closeUpdateCourseModal(): void {
    this.showUpdateCourseModal = false;
  }

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
    this.instrutorEdit = {
      ...this.instrutor,
      cpf: CpfValidator.formatCpf(this.instrutor.cpf)
    };
    this.showEditInstructorModal = true;
  }

  closeEditInstructorModal(): void {
    this.showEditInstructorModal = false;
  }

  updateInstructor(): void {
    if (!this.instrutorEdit.name || !this.instrutorEdit.email || !this.instrutorEdit.cpf) {
      this.toastr.warning('Nome, Email e CPF são obrigatórios!', 'Atenção');
      return;
    }

    const userUpdate = {
      id: this.instrutor.id,
      name: this.instrutorEdit.name,
      email: this.instrutorEdit.email,
      cpf: CpfValidator.cleanCpf(this.instrutorEdit.cpf)
    };

    this.userService.updateUser(userUpdate).subscribe(() => {
      this.instrutor = { ...this.instrutorEdit };
      this.toastr.success('Dados do instrutor atualizados com sucesso!', 'Sucesso');
      this.closeEditInstructorModal();
    }, error => {
      this.toastr.error('Erro ao atualizar os dados.', 'Erro');
      console.error(error);
    });
  }

  logout(): void {
    this.confirmationTitle = 'Sair da Plataforma';
    this.confirmationMessage = 'Tem certeza que deseja sair do painel do instrutor? Você precisará fazer login novamente para acessar.';

    this.pendingAction = () => {
      this.authService.logout();
      this.router.navigate(['/login']);
    };

    this.showConfirmModal = true;
  }

  confirmAction(): void {
    if (this.pendingAction) {
      this.pendingAction();
      this.pendingAction = null;
    }
    this.showConfirmModal = false;
  }

  cancelConfirmation(): void {
    this.pendingAction = null;
    this.showConfirmModal = false;
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleEscape(_event: KeyboardEvent) {
    if (this.showUpdateCourseModal) {
      this.closeUpdateCourseModal();
    } else if (this.showEditInstructorModal) {
      this.closeEditInstructorModal();
    } else if (this.showConfirmModal) {
      this.cancelConfirmation();
    }
  }
}
