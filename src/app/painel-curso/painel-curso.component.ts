import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '../common/service/course.service';
import { SectionService } from '../common/service/section.service';
import { ContentService } from '../common/service/content.service';
import { FileService } from '../common/service/file.service';
import { FeedbackService } from '../common/service/feedback.service';
import { CursoDTO } from '../common/dto/CursoDTO';
import { SectionDTO } from '../common/dto/SectionDTO';
import { ContentDTO } from '../common/dto/ContentDTO';
import { FeedBackDTO } from '../common/dto/FeedBackDTO';
import { AuthService } from '../common/service/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-painel-curso',
  templateUrl: './painel-curso.component.html',
  styleUrls: ['./painel-curso.component.css']
})
export class PainelCursoComponent implements OnInit {
  courseId!: number;
  courseTitle: string = '';
  description: string = '';
  instructor: string = 'Instrutor Não Informado';
  courseCreationDate!: Date;
  lastUpdateDate!: Date;
  sections: (SectionDTO & { isOpen: boolean })[] = [];
  currentContentUrl: string = '';
  currentContentType: string = '';
  course: CursoDTO | null = null;
  userFeedback?: FeedBackDTO;
  newComment: string = '';
  isEditing: boolean = false;
  userId!: number;
  isLoggedIn: boolean = false;
  isContentLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private sectionService: SectionService,
    private contentService: ContentService,
    private fileService: FileService,
    private feedbackService: FeedbackService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = !!this.authService.getToken();
    const userId = this.authService.getUserId();
    if (userId !== null) {
      this.userId = userId;
    } else {
      console.error('Erro: Usuário não autenticado.');
    }

    const courseIdParam = this.route.snapshot.paramMap.get('courseId');
    if (courseIdParam) {
      this.courseId = +courseIdParam;
      this.loadCourseDetails();
      this.loadSections();
    } else {
      console.error('Nenhum courseId foi fornecido na URL.');
      this.router.navigate(['/cursos']);
    }
  }


  loadCourseDetails(): void {
    this.courseService.getCourseById(this.courseId).subscribe(
      (course) => {
        this.course = course;
        this.courseTitle = course.name;
        this.description = course.description;
        this.instructor = course.instructors?.[0]?.name || 'Instrutor Não Informado';
        this.courseCreationDate = new Date(course.creationDate);
        this.lastUpdateDate = new Date(course.lastUpdateDate);
        this.loadUserFeedback();
      },
      (error) => {
        console.error('Erro ao carregar detalhes do curso:', error);
        this.router.navigate(['/cursos']);
      }
    );
  }

  loadSections(): void {
    this.sectionService.getSections(this.courseId).subscribe(
      (sections) => {
        this.sections = sections.map((section) => ({
          ...section,
          isOpen: false,
          contents: [],
        }));
      },
      (error) => {
        console.error('Erro ao carregar seções:', error);
      }
    );
  }

  toggleSection(index: number): void {
    const section = this.sections[index];
    section.isOpen = !section.isOpen;

    if (section.isOpen && section.contents.length === 0) {
      this.loadContents(section.id, index);
    }
  }

  loadContents(sectionId: number, sectionIndex: number): void {
    this.contentService.getContents(this.courseId, sectionId).subscribe(
      (contents) => {
        this.sections[sectionIndex].contents = contents;
      },
      (error) => {
        console.error('Erro ao carregar conteúdos:', error);
      }
    );
  }

  changeContent(content: ContentDTO): void {
    this.isContentLoading = true;
    this.currentContentUrl = this.fileService.getStreamUrl(content.fileName);
    this.currentContentType = content.contentType;

    console.log("Conteúdo selecionado:", content);
    console.log("URL carregada:", this.currentContentUrl);

    // Auto-hide loading after 2 seconds as fallback
    setTimeout(() => {
      this.isContentLoading = false;
    }, 2000);
  }

  onContentLoadStart(): void {
    this.isContentLoading = true;
  }

  onContentLoaded(): void {
    this.isContentLoading = false;
  }

  loadUserFeedback(): void {
    if (!this.course) return;
    this.userFeedback = this.course.feedBacks.find(f => f.student.id === this.userId);
  }

  refreshComments(): void {
    if (this.course) {
      this.feedbackService.getFeedbacksByCourse(this.courseId).subscribe({
        next: (feedbacks) => {
          if (this.course) {
            this.course.feedBacks = feedbacks;
            this.loadUserFeedback();
          }
        },
        error: (error) => console.error('Erro ao recarregar comentários:', error)
      });
    }
  }

  addOrUpdateFeedback(): void {
    if (!this.newComment.trim()) return;

    if (this.userFeedback) {
      // Editar feedback existente
      this.feedbackService.updateFeedback(this.userFeedback.id, this.userId, this.newComment).subscribe({
        next: (updatedFeedback) => {
          window.location.reload();
        },
        error: (error) => {
          window.location.reload();
        }
      });
    } else {
      // Criar novo feedback
      this.feedbackService.addFeedback(this.userId, this.courseId, this.newComment).subscribe({
        next: (newFeedback) => {
          window.location.reload();
        },
        error: (error) => {
          window.location.reload();
        }
      });
    }
  }

  deleteFeedback(): void {
    if (this.userFeedback) {
      // Mostrar toast de confirmação usando um modal customizado ou diretamente deletar com feedback
      this.toastr.info('Tem certeza que deseja excluir seu comentário?', 'Confirmação', {
        timeOut: 5000,
        closeButton: true,
        tapToDismiss: false
      }).onTap.subscribe(() => {
        this.confirmDeleteFeedback();
      });
    }
  }

  private confirmDeleteFeedback(): void {
    if (this.userFeedback) {
      this.feedbackService.deleteFeedback(this.userFeedback.id, this.userId).subscribe({
        next: () => {
          if (this.course) {
            this.course.feedBacks = this.course.feedBacks.filter(f => f.id !== this.userFeedback?.id);
          }
          this.userFeedback = undefined;
          this.resetCommentForm();
          this.toastr.success('Comentário excluído com sucesso!', 'Sucesso');
        },
        error: (error) => {
          console.error('Erro ao excluir comentário:', error);
          this.toastr.error('Erro ao excluir comentário. Tente novamente.', 'Erro');
        }
      });
    }
  }

  enableEdit(): void {
    this.newComment = this.userFeedback?.comment || '';
    this.isEditing = true;
  }

  toggleCommentBox(): void {
    this.isEditing = true;
  }

  resetCommentForm(): void {
    this.isEditing = false;
    this.newComment = '';
  }

  cancelEdit(): void {
    this.resetCommentForm();
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
