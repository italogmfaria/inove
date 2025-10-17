import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../common/service/auth.service';
import { UserService } from '../common/service/user.service';
import { FileService } from '../common/service/file.service';
import { FeedbackService } from '../common/service/feedback.service';
import { ToastrService } from 'ngx-toastr';
import { CpfValidator } from '../common/validators/cpf.validator';

@Component({
  selector: 'app-perfil-usuario',
  templateUrl: './perfil-usuario.component.html',
  styleUrls: ['./perfil-usuario.component.css'],
})
export class PerfilUsuarioComponent implements OnInit {
  activePanel: 'cursos' | 'dados' = 'cursos';
  isEditing: boolean = false;
  showEditModal: boolean = false;
  user: any = {};
  userCourses: any[] = [];
  courseImages: { [key: number]: string } = {};

  // Propriedades para o modal de confirmação
  showConfirmModal: boolean = false;
  confirmationType: 'delete' | 'logout' = 'delete';
  confirmationTitle: string = '';
  confirmationMessage: string = '';
  private pendingAction: (() => void) | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private fileService: FileService,
    private feedbackService: FeedbackService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const userId = Number(localStorage.getItem('userId'));
    if (!userId || userId === 0) {
      this.router.navigate(['/login']);
      return;
    }

    // Buscar dados do usuário
    this.userService.getUserById(userId).subscribe({
      next: (user) => {
        this.user = user;
      },
      error: (err) => {
        this.toastr.error('Não foi possível carregar seus dados. Tente novamente.', 'Erro');
      }
    });

    // Buscar os cursos do usuário e carregar as imagens
    this.userCourses = []; // Inicializar como array vazio

    this.userService.getUserCourses(userId).subscribe({
      next: (courses) => {
        if (courses && Array.isArray(courses) && courses.length > 0) {
          // Filtrar cursos válidos (que tenham pelo menos id e name)
          this.userCourses = courses.filter(course =>
            course &&
            course.id !== undefined &&
            course.id !== null &&
            course.name
          );

          if (this.userCourses.length > 0) {
            this.userCourses.forEach((course) => {
              this.loadCourseImage(course.id);
            });
          }
        } else {
          this.userCourses = [];
        }
      },
      error: (err) => {
        this.userCourses = [];

        if (err.status === 401) {
          this.toastr.error('Sua sessão expirou. Faça login novamente.', 'Erro de Autenticação');
          this.authService.logout();
          this.router.navigate(['/login']);
        } else if (err.status === 404) {
          // Não mostrar erro ao usuário, pode ser normal não ter cursos
        } else {
          this.toastr.warning('Não foi possível carregar seus cursos.', 'Aviso');
        }
      }
    });
  }

  // Método para buscar a imagem do curso e armazená-la no `courseImages`
  loadCourseImage(courseId: number): void {
    this.fileService.getCourseImage(courseId).subscribe({
      next: (response) => {
        this.courseImages[courseId] = response.imageUrl;
      },
      error: (err) => {
        this.courseImages[courseId] = 'assets/placeholder.png';
      },
    });
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  switchPanel(panel: 'cursos' | 'dados'): void {
    this.activePanel = panel;
  }

  toggleEdit(): void {
    if (!this.isEditing) {
      // Formatar o CPF ao abrir o modal
      this.user = {
        ...this.user,
        cpf: CpfValidator.formatCpf(this.user.cpf)
      };
    }
    this.isEditing = !this.isEditing;
    this.showEditModal = !this.showEditModal;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.isEditing = false;
  }

  saveUserData(): void {
    const userName = this.user.name;
    const userUpdate = {
      ...this.user,
      cpf: CpfValidator.cleanCpf(this.user.cpf)
    };

    this.userService.updateUser(userUpdate).subscribe({
      next: () => {
        this.toggleEdit();
        this.toastr.success(`Seus dados foram atualizados com sucesso, ${userName}!`, 'Dados Salvos');
      },
      error: (err) => {
        this.toastr.error("Não foi possível salvar seus dados. Tente novamente.", 'Erro');
      }
    });
  }

  navigateToCourse(courseId: number): void {
    this.router.navigate(['/painel-curso', courseId]);
  }

  removeCourse(courseId: number): void {
    const course = this.userCourses.find(c => c.id === courseId);
    const courseName = course ? course.name : 'este curso';

    this.confirmationType = 'delete';
    this.confirmationTitle = 'Remover Curso';
    this.confirmationMessage = `Tem certeza que deseja remover "${courseName}" dos seus cursos? Esta ação não pode ser desfeita.`;

    this.pendingAction = () => {
      const userId = Number(localStorage.getItem('userId'));

      this.userService.removeUserCourse(userId, courseId).subscribe({
        next: () => {
          this.userCourses = this.userCourses.filter((course) => course.id !== courseId);
          this.toastr.success(`O curso "${courseName}" foi removido com sucesso!`, 'Curso Removido');
        },
        error: (err) => {
          this.toastr.error("Não foi possível remover o curso. Tente novamente.", 'Erro');
        }
      });
    };

    this.showConfirmModal = true;
  }

  logout(): void {
    this.confirmationType = 'logout';
    this.confirmationTitle = 'Sair da Plataforma';
    this.confirmationMessage = 'Tem certeza que deseja sair? Você precisará fazer login novamente para acessar a plataforma.';

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
}
