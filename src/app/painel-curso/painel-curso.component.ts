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

  showConfirmModal: boolean = false;
  private pendingAction: (() => void) | null = null;

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
        this.sections[sectionIndex].contents = contents.map(content => {
          if (content.fileName) {
            const fileName = content.fileName.toLowerCase();
            if (fileName.endsWith('.mp4') || fileName.endsWith('.avi') || fileName.endsWith('.mov') || fileName.endsWith('.mkv') || fileName.endsWith('.webm')) {
              content.contentType = 'VIDEO' as any;
            } else if (fileName.endsWith('.pdf')) {
              content.contentType = 'PDF' as any;
            }
          }
          return content;
        });
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
            this.course.feedBacks = feedbacks.map(feedback => {
              if (!feedback.student && this.userFeedback && feedback.id === this.userFeedback.id) {
                feedback.student = this.userFeedback.student;
              }
              return feedback;
            });
            this.loadUserFeedback();
          }
        },
        error: (error) => console.error('Erro ao recarregar feedbacks:', error)
      });
    }
  }

  addOrUpdateFeedback(): void {
    if (!this.newComment.trim()) return;

    if (this.userFeedback) {
      this.feedbackService.updateFeedback(this.userFeedback.id, this.userId, this.newComment).subscribe({
        next: () => {
          this.refreshComments();
          this.resetCommentForm();
        },
        error: (error) => {
          console.error('Erro ao atualizar feedback:', error);
          this.toastr.error('Não foi possível atualizar o feedback. Tente novamente.', 'Erro');
        }
      });
    } else {
      this.feedbackService.addFeedback(this.userId, this.courseId, this.newComment).subscribe({
        next: () => {
          this.refreshComments();
          this.resetCommentForm();
        },
        error: (error) => {
          console.error('Erro ao adicionar feedback:', error);
          this.toastr.error('Não foi possível adicionar o feedback. Tente novamente.', 'Erro');
        }
      });
    }
  }

  deleteFeedback(): void {
    if (this.userFeedback) {
      this.pendingAction = () => {
        this.confirmDeleteFeedback();
      };
      this.showConfirmModal = true;
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
        },
        error: (error) => {
          console.error('Erro ao excluir feedback:', error);
          this.toastr.error('Erro ao excluir feedback. Tente novamente.', 'Erro');
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

  goBack(): void {
    window.history.back();
  }
}
