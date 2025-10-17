import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ContentDTO } from '../common/dto/ContentDTO';
import { ContentType } from '../common/dto/ContentType';
import { SectionDTO } from '../common/dto/SectionDTO';
import { ContentService } from '../common/service/content.service';
import { FileService } from '../common/service/file.service';
import { SectionService } from '../common/service/section.service';
import { CourseService } from '../common/service/course.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cadastro-secao',
  templateUrl: './cadastro-secao.component.html',
  styleUrls: ['./cadastro-secao.component.css']
})
export class CadastroSecaoComponent implements OnInit {
  secoes: SectionDTO[] = [];
  courseId: number = 0;
  showEditSecaoModal = false;
  showContentModal = false;
  isUploading = false;
  editingContent = false;
  uploadProgress = 0;
  secaoEdit: SectionDTO;
  currentContent: ContentDTO = { id: 0, title: '', description: '', contentType: ContentType.VIDEO, fileUrl: '', fileName: '', sectionId: 0 };
  selectedFile?: File;
  ContentType = ContentType;

  showConfirmModal: boolean = false;
  confirmationTitle: string = '';
  confirmationMessage: string = '';
  private pendingAction: (() => void) | null = null;


  private readonly MAX_VIDEO_SIZE = 50 * 1024 * 1024;
  private readonly MAX_PDF_SIZE = 50 * 1024 * 1024;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sectionService: SectionService,
    private contentService: ContentService,
    private courseService: CourseService,
    private fileService: FileService,
    private toastr: ToastrService
  ) {
    this.secaoEdit = { id: 0, title: '', description: '', courseId: 0, contents: [] };
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const courseId = params.get('id');
      if (!courseId) {
        this.toastr.error('ID do curso não fornecido');
        this.router.navigate(['/cursos']);
        return;
      }

      this.courseId = parseInt(courseId);
      this.secaoEdit.courseId = this.courseId;
      this.loadCourseAndSections();
    });
  }

  private loadCourseAndSections(): void {
    this.courseService.getCourseById(this.courseId).subscribe({
      next: (_) => {
        this.listarSecoes();
      },
      error: () => {
        this.toastr.error('Curso não encontrado ou você não tem acesso a ele');
        this.router.navigate(['/cursos']);
      }
    });
  }

  selecionarTipoConteudo(tipo: string): void {
    this.currentContent.contentType = tipo as ContentType;
  }

  listarSecoes(): void {
    this.sectionService.getSections(this.courseId).subscribe({
      next: (secoes) => {
        this.secoes = secoes.map(secao => ({ ...secao, isOpen: false }));
      },
      error: () => {
        this.toastr.error('Erro ao carregar as seções do curso');
      }
    });
  }

  criarNovaSecao(): void {
    const novaSecao: SectionDTO = {
      id: 0,
      title: 'Nova Seção',
      description: '',
      courseId: this.courseId,
      contents: []
    };

    this.sectionService.createSection(this.courseId, novaSecao).subscribe({
      next: (secaoCriada) => {
        this.secoes.push(secaoCriada);
        this.toastr.success('Seção criada com sucesso');
      },
      error: () => {
        this.toastr.error('Erro ao criar a seção');
      }
    });
  }

  confirmarExclusao(sectionId: number): void {
    this.showConfirmModal = true;
    this.confirmationTitle = 'Confirmação de Exclusão';
    this.confirmationMessage = 'Clique novamente para confirmar a exclusão desta seção.';
    this.pendingAction = () => this.excluirSecao(sectionId);
  }

  excluirSecao(sectionId: number): void {
    this.confirmationTitle = 'Remover Seção';
    this.confirmationMessage = 'Tem certeza que deseja remover esta seção? Esta ação não pode ser desfeita e todos os conteúdos vinculados serão perdidos.';

    this.pendingAction = () => {
      this.sectionService.deleteSection(this.courseId, sectionId).subscribe({
        next: () => {
          this.secoes = this.secoes.filter(secao => secao.id !== sectionId);
          this.toastr.success('Seção excluída com sucesso!', 'Sucesso');
        },
        error: () => {
          this.toastr.error('Erro ao excluir a seção.', 'Erro');
        }
      });
    };

    this.showConfirmModal = true;
  }

  editarSecao(secao: SectionDTO): void {
    this.secaoEdit = { ...secao };
    this.showEditSecaoModal = true;
  }

  salvarEdicaoSecao(): void {
    this.sectionService.updateSection(this.courseId, this.secaoEdit.id, this.secaoEdit).subscribe(() => {
      this.listarSecoes();
      this.closeEditSecaoModal();
    });
  }

  closeEditSecaoModal(): void {
    this.showEditSecaoModal = false;
  }

  toggleSection(index: number): void {
    this.secoes[index].isOpen = !this.secoes[index].isOpen;

    if (this.secoes[index].isOpen) {
      this.carregarConteudos(this.secoes[index].id, index);
    }
  }


  carregarConteudos(sectionId: number, sectionIndex: number): void {
    this.contentService.getContents(this.courseId, sectionId).subscribe({
      next: (conteudos) => {
        this.secoes[sectionIndex].contents = conteudos;

        conteudos.forEach((conteudo, index) => {
          if (conteudo.fileName) {
            const fileName = conteudo.fileName.toLowerCase();
            if (fileName.endsWith('.mp4') || fileName.endsWith('.avi') || fileName.endsWith('.mov') || fileName.endsWith('.mkv') || fileName.endsWith('.webm')) {
              this.secoes[sectionIndex].contents[index].contentType = ContentType.VIDEO;
            } else if (fileName.endsWith('.pdf')) {
              this.secoes[sectionIndex].contents[index].contentType = ContentType.PDF;
            }
          }
        });
      },
      error: () => {
        this.toastr.error("Erro ao carregar os conteúdos desta seção.", 'Erro');
      }
    });
  }




  excluirConteudo(contentId: number, sectionId: number): void {
    let contentName = 'este conteúdo';
    const section = this.secoes.find(s => s.id === sectionId);
    if (section && section.contents) {
      const content = section.contents.find(c => c.id === contentId);
      if (content) {
        contentName = `"${content.title}"`;
      }
    }

    this.confirmationTitle = 'Remover Conteúdo';
    this.confirmationMessage = `Tem certeza que deseja remover ${contentName}? Esta ação não pode ser desfeita.`;

    this.pendingAction = () => {
      this.contentService.deleteContent(this.courseId, sectionId, contentId).subscribe({
        next: () => {
          this.toastr.success("Conteúdo excluído com sucesso!", 'Sucesso');
          const sectionIndex = this.secoes.findIndex(s => s.id === sectionId);
          if (sectionIndex !== -1) {
            this.carregarConteudos(sectionId, sectionIndex);
          }
        },
        error: (err) => {
          this.toastr.error(`Erro ao excluir o conteúdo: ${err.message || err.error?.message || 'Erro desconhecido'}`, 'Erro');
        }
      });
    };

    this.showConfirmModal = true;
  }

  editarConteudo(conteudo: ContentDTO): void {
    this.currentContent = { ...conteudo };
    if (!this.currentContent.sectionId) {
      const section = this.secoes.find(s => s.contents.includes(conteudo));
      this.currentContent.sectionId = section ? section.id : 0;
    }
    this.showContentModal = true;
    this.editingContent = true;
    this.selectedFile = undefined; // Limpar arquivo selecionado
  }

  adicionarConteudo(sectionId: number): void {
    this.currentContent = { id: 0, title: '', description: '', contentType: ContentType.VIDEO, fileUrl: '', fileName: '', sectionId };
    this.showContentModal = true;
    this.editingContent = false;
    this.selectedFile = undefined; // Limpar arquivo selecionado
  }

  handleFileUpload(event: any): void {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    // Validar tamanho do arquivo
    const maxSize = this.currentContent.contentType === ContentType.VIDEO
      ? this.MAX_VIDEO_SIZE
      : this.MAX_PDF_SIZE;

    const maxSizeMB = maxSize / (1024 * 1024);
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);

    if (file.size > maxSize) {
      const tipoArquivo = this.currentContent.contentType === ContentType.VIDEO ? 'vídeos' : 'PDFs';
      this.toastr.error(
        `O arquivo selecionado (${fileSizeMB} MB) excede o tamanho máximo permitido de ${maxSizeMB} MB para ${tipoArquivo}.`,
        'Arquivo muito grande'
      );
      // Limpar o input de arquivo
      event.target.value = '';
      this.selectedFile = undefined;
      return;
    }

    this.selectedFile = file;
    this.toastr.success(`Arquivo "${file.name}" (${fileSizeMB} MB) selecionado com sucesso!`, 'Arquivo pronto');
  }

  // Métodos para preview de conteúdo
  showPreviewModal: boolean = false;

  getContentPreviewUrl(): string {
    if (this.currentContent.fileName) {
      return this.fileService.getStreamUrl(this.currentContent.fileName);
    }
    return '';
  }

  hasExistingContent(): boolean {
    return this.editingContent && !!this.currentContent.fileName;
  }

  openPreviewModal(): void {
    this.showPreviewModal = true;
  }

  closePreviewModal(): void {
    this.showPreviewModal = false;
  }

  isVideo(): boolean {
    return this.currentContent.contentType === ContentType.VIDEO;
  }

  isPDF(): boolean {
    return this.currentContent.contentType === ContentType.PDF;
  }

  saveContent(): void {
    // Validações antes de iniciar o upload
    if (!this.currentContent.title || !this.currentContent.description) {
      this.toastr.warning("Por favor, preencha todos os campos.", 'Atenção');
      this.isUploading = false;
      return;
    }

    // Para criação de novo conteúdo, validar se tem arquivo
    if (!this.editingContent && !this.selectedFile) {
      this.toastr.warning("Por favor, selecione um arquivo antes de continuar.", 'Atenção');
      this.isUploading = false;
      return;
    }

    // Validar tamanho do arquivo novamente antes de enviar
    if (this.selectedFile) {
      const maxSize = this.currentContent.contentType === ContentType.VIDEO
        ? this.MAX_VIDEO_SIZE
        : this.MAX_PDF_SIZE;

      if (this.selectedFile.size > maxSize) {
        const maxSizeMB = maxSize / (1024 * 1024);
        const tipoArquivo = this.currentContent.contentType === ContentType.VIDEO ? 'vídeos' : 'PDFs';
        this.toastr.error(
          `O arquivo excede o tamanho máximo permitido de ${maxSizeMB} MB para ${tipoArquivo}.`,
          'Arquivo muito grande'
        );
        this.isUploading = false;
        return;
      }
    }

    this.isUploading = true;
    this.uploadProgress = 0;

    if (this.editingContent) {
      if (this.selectedFile) {
        const progressInterval = setInterval(() => {
          this.uploadProgress += 10;
          if (this.uploadProgress >= 90) {
            clearInterval(progressInterval);
          }
        }, 200);

        this.contentService.updateContentWithFile(
          this.courseId,
          this.currentContent.sectionId,
          this.currentContent.id,
          this.selectedFile,
          this.currentContent
        ).subscribe({
          next: () => {
            clearInterval(progressInterval);
            this.uploadProgress = 100;
            setTimeout(() => {
              this.toastr.success("Conteúdo e arquivo atualizados com sucesso!", 'Sucesso');
              this.isUploading = false;
              this.uploadProgress = 0;
              this.listarSecoes();
              this.closeContentModal();
            }, 500);
          },
          error: () => {
            clearInterval(progressInterval);
            this.toastr.error("Erro ao atualizar o conteúdo com o novo arquivo.", 'Erro');
            this.isUploading = false;
            this.uploadProgress = 0;
          }
        });
      } else {
        this.contentService.updateContent(this.courseId, this.currentContent.sectionId, this.currentContent.id, this.currentContent)
          .subscribe({
            next: () => {
              this.toastr.success("Conteúdo atualizado com sucesso!", 'Sucesso');
              this.isUploading = false;
              this.listarSecoes();
              this.closeContentModal();
            },
            error: () => {
              this.toastr.error("Erro ao atualizar o conteúdo.", 'Erro');
              this.isUploading = false;
            }
          });
      }
    } else {
      const progressInterval = setInterval(() => {
        this.uploadProgress += 10;
        if (this.uploadProgress >= 90) {
          clearInterval(progressInterval);
        }
      }, 200);

      this.contentService.uploadContent(this.courseId, this.currentContent.sectionId, this.selectedFile!, this.currentContent)
        .subscribe({
          next: () => {
            clearInterval(progressInterval);
            this.uploadProgress = 100;
            setTimeout(() => {
              this.toastr.success("Conteúdo enviado com sucesso!", 'Sucesso');
              this.isUploading = false;
              this.uploadProgress = 0;
              this.listarSecoes();
              this.closeContentModal();
            }, 500);
          },
          error: () => {
            clearInterval(progressInterval);
            this.toastr.error("Erro ao enviar o conteúdo.", 'Erro');
            this.isUploading = false;
            this.uploadProgress = 0;
          }
        });
    }
  }


  closeContentModal(): void {
    this.showContentModal = false;
    this.showPreviewModal = false;
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

  goBack(): void {
    window.history.back();
  }
}
