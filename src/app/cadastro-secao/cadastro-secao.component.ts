import { Component, OnInit } from '@angular/core';
import { ContentDTO } from '../common/dto/ContentDTO';
import { ContentType } from '../common/dto/ContentType';
import { SectionDTO } from '../common/dto/SectionDTO';
import { ContentService } from '../common/service/content.service';
import { FileService } from '../common/service/file.service';
import { SectionService } from '../common/service/section.service';

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
  secaoEdit: SectionDTO = { id: 0, title: '', description: '', courseId: this.courseId, contents: [] };
  currentContent: ContentDTO = { id: 0, title: '', description: '', contentType: ContentType.VIDEO, fileUrl: '', fileName: '', sectionId: 0 };
  selectedFile?: File;
  ContentType = ContentType;

  constructor(
    private sectionService: SectionService,
    private contentService: ContentService,
    private fileService: FileService
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

  excluirSecao(sectionId: number): void {
    if (confirm('Tem certeza que deseja excluir esta seção?')) {
      this.sectionService.deleteSection(this.courseId, sectionId).subscribe(() => {
        this.secoes = this.secoes.filter(secao => secao.id !== sectionId);
      });
    }
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
        alert("Erro ao carregar os conteúdos desta seção.");
      }
    });
  }
  
  
  

  excluirConteudo(contentId: number, sectionId: number): void {
    if (confirm("Tem certeza que deseja excluir este conteúdo?")) {
      this.contentService.deleteContent(this.courseId, sectionId, contentId).subscribe({
        next: () => {
          alert("Conteúdo excluído com sucesso!");
          this.listarSecoes();
        },
        error: (err) => {
          console.error(err);
          alert("Erro ao excluir o conteúdo.");
        }
      });
    }
  }
  
  editarConteudo(conteudo: ContentDTO): void {
    this.currentContent = { ...conteudo }; // Clona os dados do conteúdo selecionado
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
      alert("Por favor, preencha todos os campos.");
      return;
    }
  
    this.isUploading = true;
  
    if (this.editingContent) {
      // Atualizar conteúdo existente
      this.contentService.updateContent(this.courseId, this.currentContent.sectionId, this.currentContent.id, this.currentContent)
        .subscribe({
          next: () => {
            alert("Conteúdo atualizado com sucesso!");
            this.isUploading = false;
            this.listarSecoes();
            this.closeContentModal();
          },
          error: (err) => {
            console.error(err);
            alert("Erro ao atualizar o conteúdo.");
            this.isUploading = false;
          }
        });
    } else {
      if (!this.selectedFile) {
        alert("Por favor, selecione um arquivo antes de continuar.");
        return;
      }
  
      this.contentService.uploadContent(this.courseId, this.currentContent.sectionId, this.selectedFile, this.currentContent)
        .subscribe({
          next: () => {
            alert("Conteúdo enviado com sucesso!");
            this.isUploading = false;
            this.listarSecoes();
            this.closeContentModal();
          },
          error: (err) => {
            console.error(err);
            alert("Erro ao enviar o conteúdo.");
            this.isUploading = false;
          }
        });
    }
  }
  

  closeContentModal(): void {
    this.showContentModal = false;
  }
}