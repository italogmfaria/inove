import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../common/service/auth.service';
import { UserService } from '../common/service/user.service';
import { FileService } from '../common/service/file.service';
import { FeedbackService } from '../common/service/feedback.service';
import { SchoolService } from '../common/service/school.service';
import { UserProgressService } from '../common/service/user-progress.service';
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
  courseProgress: { [key: number]: number } = {};
  schools: any[] = [];
  editUserForm!: FormGroup;

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
    private schoolService: SchoolService,
    private userProgressService: UserProgressService,
    private toastr: ToastrService,
    private fb: FormBuilder
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
        if (user.id) {
          this.userService.getUserSchool(user.id).subscribe({
            next: (school) => {
              this.user.school = school;
              this.user.schoolId = school ? Number(school.id) : null;
            },
            error: (err) => {
              this.user.schoolId = null;
            }
          });
        }
      },
      error: (err) => {
        this.toastr.error('Não foi possível carregar seus dados. Tente novamente.', 'Erro');
      }
    });

    // Buscar lista de escolas
    this.schoolService.getSchools().subscribe({
      next: (schools) => {
        this.schools = schools;
      },
      error: (err) => {
        this.toastr.warning('Não foi possível carregar a lista de escolas.', 'Aviso');
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
              this.loadCourseProgress(course.id, userId);
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
      // Inicializar o formulário com os dados do usuário
      this.editUserForm = this.fb.group({
        name: [this.user.name || '', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
        email: [this.user.email || '', [Validators.required, Validators.email]],
        cpf: [CpfValidator.formatCpf(this.user.cpf) || '', [Validators.required, CpfValidator.validate]],
        schoolId: [this.user.schoolId || null]
      });
    }
    this.isEditing = !this.isEditing;
    this.showEditModal = !this.showEditModal;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.isEditing = false;
  }

  saveUserData(): void {
    if (this.editUserForm.invalid) {
      Object.keys(this.editUserForm.controls).forEach(key => {
        this.editUserForm.get(key)?.markAsTouched();
      });
      this.toastr.error('Por favor, corrija os erros no formulário.', 'Erro de Validação');
      return;
    }

    const formValue = this.editUserForm.value;
    const userName = formValue.name;

    // Preparar o payload
    const userUpdate: any = {
      id: this.user.id,
      name: formValue.name.trim(),
      email: formValue.email.trim(),
      cpf: CpfValidator.cleanCpf(formValue.cpf)
    };

    // Adicionar school como objeto com id se houver escola selecionada
    if (formValue.schoolId && formValue.schoolId !== 'null' && formValue.schoolId !== null) {
      userUpdate.school = {
        id: Number(formValue.schoolId)
      };
    } else {
      userUpdate.school = null;
    }

    this.userService.updateUser(userUpdate).subscribe({
      next: () => {
        this.toggleEdit();
        this.toastr.success(`Seus dados foram atualizados com sucesso, ${userName}!`, 'Dados Salvos');

        // Recarregar os dados do usuário
        const userId = Number(localStorage.getItem('userId'));
        this.userService.getUserById(userId).subscribe({
          next: (user) => {
            this.user = user;

            // Buscar escola atualizada usando o endpoint específico
            this.userService.getUserSchool(userId).subscribe({
              next: (school) => {
                this.user.school = school;
                this.user.schoolId = school ? Number(school.id) : null;
              },
              error: (err) => {
                // Usuário pode não ter escola associada
                this.user.schoolId = null;
              }
            });
          },
          error: (err) => {
            this.toastr.error('Não foi possível recarregar seus dados.', 'Erro');
          }
        });
      },
      error: (err) => {
        const errorMessage = err.error?.message || err.message || 'Não foi possível salvar seus dados. Tente novamente.';
        this.toastr.error(errorMessage, 'Erro');
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

  getSchoolName(): string {
    // Primeiro tenta pegar do objeto school se existir
    if (this.user.school && this.user.school.name) {
      return this.user.school.name;
    }

    // Se não, tenta buscar pelo schoolId na lista de escolas
    if (!this.user.schoolId) {
      return 'Nenhuma escola vinculada';
    }

    const schoolId = Number(this.user.schoolId);
    const school = this.schools.find(s => s.id === schoolId);
    return school ? school.name : 'Carregando...';
  }

  getErrorMessage(fieldName: string): string {
    const field = this.editUserForm?.get(fieldName);
    if (field?.hasError('required')) {
      return 'Este campo é obrigatório';
    }
    if (field?.hasError('email')) {
      return 'Digite um e-mail válido';
    }
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `Deve ter no mínimo ${minLength} caracteres`;
    }
    if (field?.hasError('maxlength')) {
      const maxLength = field.errors?.['maxlength'].requiredLength;
      return `Deve ter no máximo ${maxLength} caracteres`;
    }
    if (field?.hasError('cpfInvalid')) {
      return 'CPF inválido';
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.editUserForm?.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  loadCourseProgress(courseId: number, userId: number): void {
    // Usando a mesma implementação do painel-curso.component.ts
    this.userProgressService.getCurrentUserProgress(courseId).subscribe({
      next: (progress) => {
        const progressPercentage = this.userProgressService.getPercentageAsNumber(progress);
        this.courseProgress[courseId] = progressPercentage;
      },
      error: (error) => {
        console.error('Erro ao carregar progresso do curso:', error);
        this.courseProgress[courseId] = 0;
      }
    });
  }

  getCourseProgress(courseId: number): number {
    return this.courseProgress[courseId] || 0;
  }
}
