import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../common/service/auth.service';
import { UserService } from '../common/service/user.service';
import { FileService } from '../common/service/file.service';
import { FeedbackService } from '../common/service/feedback.service';
import { ToastrService } from 'ngx-toastr';

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
      console.error("Erro: Usuário não autenticado.");
      this.router.navigate(['/login']);
      return;
    }

    // Buscar dados do usuário
    this.userService.getUserById(userId).subscribe({
      next: (user) => (this.user = user),
      error: (err) => console.error("Erro ao buscar usuário:", err),
    });

    // Buscar os cursos do usuário e carregar as imagens
    this.userService.getUserCourses(userId).subscribe({
      next: (courses) => {
        this.userCourses = courses;
        this.userCourses.forEach((course) => {
          this.loadCourseImage(course.id);
        });
      },
      error: (err) => console.error("Erro ao buscar cursos:", err),
    });
  }

  // Método para buscar a imagem do curso e armazená-la no `courseImages`
  loadCourseImage(courseId: number): void {
    this.fileService.getCourseImage(courseId).subscribe({
      next: (response) => {
        this.courseImages[courseId] = response.imageUrl;
      },
      error: (err) => {
        console.error(`Erro ao carregar imagem do curso ${courseId}:`, err);
        this.courseImages[courseId] = 'assets/placeholder.png'; // Imagem padrão caso não consiga carregar
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
    this.isEditing = !this.isEditing;
    this.showEditModal = !this.showEditModal;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.isEditing = false;
  }

  saveUserData(): void {
    const userName = this.user.name;
    this.userService.updateUser(this.user).subscribe({
      next: () => {
        this.toggleEdit();
        this.toastr.success(`Seus dados foram atualizados com sucesso, ${userName}!`, 'Dados Salvos');
      },
      error: (err) => {
        console.error("Erro ao salvar dados:", err);
        this.toastr.error("Não foi possível salvar seus dados. Tente novamente.", 'Erro');
      }
    });
  }

  navigateToCourse(courseId: number): void {
    this.router.navigate(['/painel-curso', courseId]);
  }

  removeCourse(courseId: number): void {
    // Buscar o nome do curso para exibir na confirmação
    const course = this.userCourses.find(c => c.id === courseId);
    const courseName = course ? course.name : 'este curso';

    // Configurar o modal de confirmação
    this.confirmationType = 'delete';
    this.confirmationTitle = 'Remover Curso';
    this.confirmationMessage = `Tem certeza que deseja remover "${courseName}" dos seus cursos? Esta ação não pode ser desfeita e seu feedback neste curso será removido.`;

    // Armazenar a ação pendente
    this.pendingAction = () => {
      const userId = Number(localStorage.getItem('userId'));

      // Primeiro, deletar o feedback do curso (se existir)
      this.feedbackService.deleteFeedbackByUserAndCourse(userId, courseId).subscribe({
        next: () => {
          // Após deletar o feedback, remover o curso
          this.userService.removeUserCourse(userId, courseId).subscribe({
            next: () => {
              this.userCourses = this.userCourses.filter((course) => course.id !== courseId);
              this.toastr.success(`O curso "${courseName}" e seu feedback foram removidos com sucesso!`, 'Curso Removido');
            },
            error: (err) => {
              console.error("Erro ao remover curso:", err);
              this.toastr.error("Não foi possível remover o curso. Tente novamente.", 'Erro');
            }
          });
        },
        error: (err) => {
          // Se não houver feedback ou houver erro ao deletar, continuar removendo o curso
          console.log("Nenhum feedback para remover ou erro ao deletar feedback, continuando...");
          this.userService.removeUserCourse(userId, courseId).subscribe({
            next: () => {
              this.userCourses = this.userCourses.filter((course) => course.id !== courseId);
              this.toastr.success(`O curso "${courseName}" foi removido com sucesso!`, 'Curso Removido');
            },
            error: (err) => {
              console.error("Erro ao remover curso:", err);
              this.toastr.error("Não foi possível remover o curso. Tente novamente.", 'Erro');
            }
          });
        }
      });
    };

    // Exibir o modal
    this.showConfirmModal = true;
  }

  logout(): void {
    // Configurar o modal de confirmação
    this.confirmationType = 'logout';
    this.confirmationTitle = 'Sair da Plataforma';
    this.confirmationMessage = 'Tem certeza que deseja sair? Você precisará fazer login novamente para acessar a plataforma.';

    // Armazenar a ação pendente
    this.pendingAction = () => {
      this.authService.logout();
      this.router.navigate(['/login']);
    };

    // Exibir o modal
    this.showConfirmModal = true;
  }

  // Confirmar a ação pendente
  confirmAction(): void {
    if (this.pendingAction) {
      this.pendingAction();
      this.pendingAction = null;
    }
    this.showConfirmModal = false;
  }

  // Cancelar a confirmação
  cancelConfirmation(): void {
    this.pendingAction = null;
    this.showConfirmModal = false;
  }
}
