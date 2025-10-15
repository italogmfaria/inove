import { Component, OnInit } from '@angular/core';
import { ContentDTO } from '../common/dto/ContentDTO';
import { ContentType } from '../common/dto/ContentType';
import { SectionDTO } from '../common/dto/SectionDTO';
import { ContentService } from '../common/service/content.service';
import { FileService } from '../common/service/file.service';
import { SectionService } from '../common/service/section.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cadastro-secao',
  templateUrl: './cadastro-secao.component.html',
  styleUrls: ['./cadastro-secao.component.css']
})
export class CadastroSecaoComponent implements OnInit {
  secoes: SectionDTO[] = [];
  courseId: number = 1;
  showEditSecaoModal = false;
  showContentModal = false;
  isUploading = false;
  editingContent = false;
  uploadProgress = 0;
  secaoEdit: SectionDTO = { id: 0, title: '', description: '', courseId: this.courseId, contents: [] };
  currentContent: ContentDTO = { id: 0, title: '', description: '', contentType: ContentType.VIDEO, fileUrl: '', fileName: '', sectionId: 0 };
  selectedFile?: File;
  ContentType = ContentType;

  // Propriedades para o modal de confirmação
  showConfirmModal: boolean = false;
  confirmationTitle: string = '';
  confirmationMessage: string = '';
  private pendingAction: (() => void) | null = null;

  constructor(
    private sectionService: SectionService,
    private contentService: ContentService,
    private fileService: FileService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.listarSecoes();
  }

  selecionarTipoConteudo(tipo: string): void {
    this.currentContent.contentType = tipo as ContentType;
  }

  listarSecoes(): void {
    this.sectionService.getSections(this.courseId).subscribe(secoes => {
      this.secoes = secoes.map(secao => ({ ...secao, isOpen: false }));
    });
  }

  criarNovaSecao(): void {
    const novaSecao: SectionDTO = { id: 0, title: 'Nova Seção', description: '', courseId: this.courseId, contents: [] };
    this.sectionService.createSection(this.courseId, novaSecao).subscribe(secaoCriada => {
      this.secoes.push(secaoCriada);
    });
  }

  confirmarExclusao(sectionId: number): void {
    this.showConfirmModal = true;
    this.confirmationTitle = 'Confirmação de Exclusão';
    this.confirmationMessage = 'Clique novamente para confirmar a exclusão desta seção.';
    this.pendingAction = () => this.excluirSecao(sectionId);
  }

  excluirSecao(sectionId: number): void {
    // Configurar o modal de confirmação
    this.confirmationTitle = 'Remover Seção';
    this.confirmationMessage = 'Tem certeza que deseja remover esta seção? Esta ação não pode ser desfeita e todos os conteúdos vinculados serão perdidos.';

    // Armazenar a ação pendente
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

    // Exibir o modal
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
        // Para cada conteúdo, buscamos o tipo de arquivo correto
        conteudos.forEach((conteudo, index) => {
          if (conteudo.fileName) {
            this.contentService.getFileType(conteudo.fileName).subscribe({
              next: (response) => {
                // Corrigindo a atribuição do tipo de conteúdo
                conteudos[index].contentType = response.contentType.includes('video') ? ContentType.VIDEO : ContentType.PDF;
              },
              error: () => {
                console.error(`Erro ao buscar tipo do arquivo: ${conteudo.fileName}`);
              }
            });
          }
        });

        // Atualiza os conteúdos da seção
        this.secoes[sectionIndex].contents = conteudos;
      },
      error: (error) => {
        console.error("Erro ao carregar conteúdos:", error);
        this.toastr.error("Erro ao carregar os conteúdos desta seção.", 'Erro');
      }
    });
  }




  excluirConteudo(contentId: number, sectionId: number): void {
    // Buscar o nome do conteúdo para exibir na confirmação
    let contentName = 'este conteúdo';
    const section = this.secoes.find(s => s.id === sectionId);
    if (section && section.contents) {
      const content = section.contents.find(c => c.id === contentId);
      if (content) {
        contentName = `"${content.title}"`;
      }
    }

    // Configurar o modal de confirmação
    this.confirmationTitle = 'Remover Conteúdo';
    this.confirmationMessage = `Tem certeza que deseja remover ${contentName}? Esta ação não pode ser desfeita.`;

    // Armazenar a ação pendente
    this.pendingAction = () => {
      console.log('Tentando excluir conteúdo:', { courseId: this.courseId, sectionId, contentId });
      this.contentService.deleteContent(this.courseId, sectionId, contentId).subscribe({
        next: (response) => {
          console.log('Conteúdo excluído com sucesso:', response);
          this.toastr.success("Conteúdo excluído com sucesso!", 'Sucesso');
          const sectionIndex = this.secoes.findIndex(s => s.id === sectionId);
          if (sectionIndex !== -1) {
            this.carregarConteudos(sectionId, sectionIndex);
          }
        },
        error: (err) => {
          console.error('Erro detalhado ao excluir conteúdo:', err);
          this.toastr.error(`Erro ao excluir o conteúdo: ${err.message || err.error?.message || 'Erro desconhecido'}`, 'Erro');
        }
      });
    };

    // Exibir o modal
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
  }

////////

  adicionarConteudo(sectionId: number): void {
    this.currentContent = { id: 0, title: '', description: '', contentType: ContentType.VIDEO, fileUrl: '', fileName: '', sectionId };
    this.showContentModal = true;
    this.editingContent = false;
  }

  handleFileUpload(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  saveContent(): void {
    if (!this.currentContent.title || !this.currentContent.description) {
      this.toastr.warning("Por favor, preencha todos os campos.", 'Atenção');
      return;
    }

    this.isUploading = true;
    this.uploadProgress = 0;

    if (this.editingContent) {
      // Atualizar conteúdo existente
      this.contentService.updateContent(this.courseId, this.currentContent.sectionId, this.currentContent.id, this.currentContent)
        .subscribe({
          next: () => {
            this.toastr.success("Conteúdo atualizado com sucesso!", 'Sucesso');
            this.isUploading = false;
            this.listarSecoes();
            this.closeContentModal();
          },
          error: (err) => {
            console.error(err);
            this.toastr.error("Erro ao atualizar o conteúdo.", 'Erro');
            this.isUploading = false;
          }
        });
    } else {
      if (!this.selectedFile) {
        this.toastr.warning("Por favor, selecione um arquivo antes de continuar.", 'Atenção');
        return;
      }

      // Simular progresso de upload
      const progressInterval = setInterval(() => {
        this.uploadProgress += 10;
        if (this.uploadProgress >= 90) {
          clearInterval(progressInterval);
        }
      }, 200);

      this.contentService.uploadContent(this.courseId, this.currentContent.sectionId, this.selectedFile, this.currentContent)
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
          error: (err) => {
            clearInterval(progressInterval);
            console.error(err);
            this.toastr.error("Erro ao enviar o conteúdo.", 'Erro');
            this.isUploading = false;
            this.uploadProgress = 0;
          }
        });
    }
  }


  closeContentModal(): void {
    this.showContentModal = false;
  }

  // Métodos de confirmação
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
