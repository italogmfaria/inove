import { Component, OnInit, AfterViewChecked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '../common/service/course.service';
import { SectionService } from '../common/service/section.service';
import { ContentService } from '../common/service/content.service';
import { FileService } from '../common/service/file.service';
import { FeedbackService } from '../common/service/feedback.service';
import { UserProgressService } from '../common/service/user-progress.service';
import { CursoDTO } from '../common/dto/CursoDTO';
import { SectionDTO } from '../common/dto/SectionDTO';
import { ContentDTO } from '../common/dto/ContentDTO';
import { FeedBackDTO } from '../common/dto/FeedBackDTO';
import { CompletedContentResponseDTO } from '../common/dto/CompletedContentDTO';
import { AuthService } from '../common/service/auth.service';
import { ToastrService } from 'ngx-toastr';

import { profanities as en } from 'profanities';
import { profanities as pt } from 'profanities/pt-pt';
import { profanities as es } from 'profanities/es';


@Component({
  selector: 'app-painel-curso',
  templateUrl: './painel-curso.component.html',
  styleUrls: ['./painel-curso.component.css']
})
export class PainelCursoComponent implements OnInit, AfterViewChecked {
  courseId!: number;
  courseTitle: string = '';
  description: string = '';
  instructor: string = 'Instrutor Não Informado';
  courseCreationDate!: Date;
  lastUpdateDate!: Date;
  sections: (SectionDTO & { isOpen: boolean })[] = [];
  currentContentUrl: string = '';
  currentContentType: string = '';
  currentContent: ContentDTO | null = null;
  currentSectionId: number | null = null;
  course: CursoDTO | null = null;
  userFeedback?: FeedBackDTO;
  newComment: string = '';
  isEditing: boolean = false;
  userId!: number;
  isLoggedIn: boolean = false;
  isContentLoading: boolean = false;

  // Variáveis de progresso
  courseProgress: CompletedContentResponseDTO | null = null;
  progressPercentage: number = 0;
  completedContentIds: Set<number> = new Set();
  totalContents: number = 0;
  videoWatchedPercentage: number = 0;
  pdfScrolledPercentage: number = 0;
  hasMarkedCurrentContentComplete: boolean = false;
  private pdfScrollListenerAdded: boolean = false;

  showConfirmModal: boolean = false;
  private pendingAction: (() => void) | null = null;
  private profanityList: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private sectionService: SectionService,
    private contentService: ContentService,
    private fileService: FileService,
    private feedbackService: FeedbackService,
    private userProgressService: UserProgressService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    try {
      this.profanityList = [
        ...en,
        ...es,
        ...pt
      ];
    } catch (error) {
    }

    this.isLoggedIn = !!this.authService.getToken();
    const userId = this.authService.getUserId();
    if (userId !== null) {
      this.userId = userId;
    } else {
    }

    const courseIdParam = this.route.snapshot.paramMap.get('courseId');
    if (courseIdParam) {
      this.courseId = +courseIdParam;
      this.loadCourseDetails();
      this.loadSections();
      this.loadCourseProgress();
    } else {
      console.error('Nenhum courseId foi fornecido na URL.');
      this.router.navigate(['/cursos']);
    }
  }

  ngAfterViewChecked(): void {
    // Só tenta adicionar listener se for PDF e ainda não foi adicionado
    if (this.currentContentType === 'PDF' && !this.pdfScrollListenerAdded && !this.isContentLoading) {
      this.setupPDFScrollTracking();
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

        // Carregar todos os conteúdos para contar o total
        this.loadAllContentsCount();
      },
      (error) => {
        console.error('Erro ao carregar seções:', error);
      }
    );
  }

  loadAllContentsCount(): void {
    let totalCount = 0;
    let sectionsProcessed = 0;

    this.sections.forEach((section) => {
      this.contentService.getContents(this.courseId, section.id).subscribe(
        (contents) => {
          totalCount += contents.length;
          sectionsProcessed++;

          // Quando todas as seções forem processadas, atualiza o total
          if (sectionsProcessed === this.sections.length) {
            this.totalContents = totalCount;
            console.log(`Total de conteúdos do curso: ${this.totalContents}`);
          }
        },
        () => {
          sectionsProcessed++;
        }
      );
    });
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

  changeContent(content: ContentDTO, sectionId: number): void {
    this.isContentLoading = true;
    this.currentContent = content;
    this.currentSectionId = sectionId;
    this.currentContentUrl = this.fileService.getStreamUrl(content.fileName);
    this.currentContentType = content.contentType;
    this.hasMarkedCurrentContentComplete = this.isContentCompleted(content.id);
    this.videoWatchedPercentage = 0;
    this.pdfScrolledPercentage = 0;
    this.pdfScrollListenerAdded = false; // Reset do listener do PDF

    setTimeout(() => {
      this.isContentLoading = false;
      this.setupContentTracking();
    }, 500);
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

    try {
      const hasProfanity = this.containsProfanity(this.newComment);

      if (hasProfanity) {
        this.toastr.warning('Seu comentário contém linguagem inapropriada. Por favor, tenha mais respeito.', 'Atenção');
        return;
      }
    } catch (error) {
      this.toastr.error('Erro ao validar comentário. Por favor, tente novamente.', 'Erro');
      return;
    }


    if (this.userFeedback) {
      this.feedbackService.updateFeedback(this.userFeedback.id, this.userId, this.newComment).subscribe({
        next: () => {
          this.refreshComments();
          this.resetCommentForm();
          this.toastr.success('Feedback atualizado com sucesso!', 'Sucesso');
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
          this.toastr.success('Feedback adicionado com sucesso!', 'Sucesso');
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

  private containsProfanity(text: string): boolean {
    const lowerText = text.toLowerCase();

    const words = lowerText.split(/\s+/);

    return words.some(word => {
      const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');
      return this.profanityList.includes(cleanWord);
    });
  }

  // ========== MÉTODOS DE PROGRESSO DO CURSO ==========

  loadCourseProgress(): void {
    this.userProgressService.getCurrentUserProgress(this.courseId).subscribe({
      next: (progress) => {
        this.courseProgress = progress;
        this.progressPercentage = this.userProgressService.getPercentageAsNumber(progress);
        this.completedContentIds = new Set(progress.completedContents.map(c => c.contentId));
      },
      error: (error) => {
        console.error('Erro ao carregar progresso do curso:', error);
      }
    });
  }

  isContentCompleted(contentId: number): boolean {
    return this.completedContentIds.has(contentId);
  }

  isCurrentContent(contentId: number): boolean {
    return this.currentContent?.id === contentId;
  }

  setupContentTracking(): void {
    // Apenas para PDF, vídeo usa eventos do componente
    if (this.currentContentType === 'PDF') {
      // O tracking do PDF é feito via evento (scroll) no template
    }
  }

  onVideoProgressUpdate(percentage: number): void {
    this.videoWatchedPercentage = percentage;
  }

  setupPDFScrollTracking(): void {
    // Tenta encontrar o elemento interno do pdf-viewer que tem o scroll
    const pdfViewerElement = document.querySelector('.pdf-container');
    if (!pdfViewerElement) return;

    // O pdf-viewer cria elementos internos, vamos buscar o que tem scroll
    const scrollableElements = [
      pdfViewerElement.querySelector('.ng2-pdf-viewer-container'),
      pdfViewerElement.querySelector('pdf-viewer'),
      pdfViewerElement,
      ...Array.from(pdfViewerElement.querySelectorAll('*'))
    ].filter(el => el !== null) as HTMLElement[];

    // Encontra o elemento que tem scroll (scrollHeight > clientHeight)
    const scrollElement = scrollableElements.find(el => {
      return el.scrollHeight > el.clientHeight + 10; // +10 de margem
    });

    if (scrollElement) {

      const scrollHandler = () => {
        const scrollTop = scrollElement.scrollTop;
        const scrollHeight = scrollElement.scrollHeight;
        const clientHeight = scrollElement.clientHeight;

        if (scrollHeight > clientHeight) {
          const percentage = ((scrollTop + clientHeight) / scrollHeight) * 100;
          this.pdfScrolledPercentage = percentage;
          if (percentage >= 95 && !this.hasMarkedCurrentContentComplete) {
            this.markContentAsCompleted();
          }
        }
      };

      scrollElement.addEventListener('scroll', scrollHandler, { passive: true });
      this.pdfScrollListenerAdded = true;
    } else {
    }
  }

  onPDFScroll(event: Event): void {
    const pdfContainer = event.target as HTMLElement;
    const scrollTop = pdfContainer.scrollTop;
    const scrollHeight = pdfContainer.scrollHeight;
    const clientHeight = pdfContainer.clientHeight;

    if (scrollHeight > clientHeight) {
      const percentage = ((scrollTop + clientHeight) / scrollHeight) * 100;
      this.pdfScrolledPercentage = percentage;
      if (percentage >= 95 && !this.hasMarkedCurrentContentComplete) {
        this.markContentAsCompleted();
      }
    }
  }

  markContentAsCompleted(): void {
    if (!this.currentContent || !this.currentSectionId || this.hasMarkedCurrentContentComplete) {
      return;
    }

    this.hasMarkedCurrentContentComplete = true;

    this.userProgressService.markContentAsCompletedForCurrentUser(
      this.courseId,
      this.currentSectionId,
      this.currentContent.id
    ).subscribe({
      next: () => {
        this.completedContentIds.add(this.currentContent!.id);
        this.loadCourseProgress();
      },
      error: () => {
        this.hasMarkedCurrentContentComplete = false;
      }
    });
  }

  getFormattedProgress(): string {
    return `${this.progressPercentage}%`;
  }

  getTotalContents(): number {
    return this.totalContents;
  }
}


