import { Component, OnInit } from '@angular/core';
import { ContentService } from '../common/service/content.service';
import { FileService } from '../common/service/file.service';
import { SectionService } from '../common/service/section.service';
import { ContentDTO } from '../common/dto/ContentDTO';
import { SectionDTO } from '../common/dto/SectionDTO';
import { ContentType } from '../common/dto/ContentType';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-cadastro-secao',
  templateUrl: './cadastro-secao.component.html',
  styleUrls: ['./cadastro-secao.component.css']
})
export class CadastroSecaoComponent implements OnInit {
  secoes: SectionDTO[] = [];
  courseId: number = 1;
  ContentType = ContentType;
  showEditSecaoModal = false;
  isUploading: boolean = false; 
  secaoEdit: SectionDTO = {
    id: 0,
    title: '',
    description: '',
    courseId: 0,
    contents: []
  };
  showContentModal = false;
  currentContent: ContentDTO = {
    id: 0,
    title: '',
    description: '',
    contentType: ContentType.VIDEO,
    fileUrl: '',
    fileName: '',
    sectionId: 0
  };
  
  editingContent = false;
  selectedFile: File | null = null;
  editingIndexes: { secaoIndex: number; conteudoIndex?: number } | null = null;

  constructor(
    private sectionService: SectionService,
    private contentService: ContentService,
    private fileService: FileService,
    private route: ActivatedRoute // Para obter os parâmetros da URL
  ) {}
  
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['cursoId']) {
        this.courseId = +params['cursoId']; // Obtém o cursoId da URL
        console.log("Curso ID recebido:", this.courseId); // <-- Debug
        this.getSecoes();
      } else {
        console.error("Erro: Nenhum cursoId foi recebido!");
      }
    });
  }

  // Carregar seções do curso
  getSecoes(): void {
    if (!this.courseId) {
      console.error("Erro: Nenhum curso selecionado.");
      return;
    }
  
    this.sectionService.getSections(this.courseId).subscribe(
      (data: SectionDTO[]) => {
        console.log("Seções recebidas do back-end:", data); // Log para depurar as seções recebidas
        this.secoes = data.map(secao => ({
          ...secao,
          isOpen: false, // Propriedade para alternar a exibição
          contents: secao.contents || [] // Garante que contents seja um array
        }));
      },
      (error) => {
        console.error("Erro ao carregar as seções:", error);
      }
    );
  }
  
  

  toggleSection(index: number): void {
    const secao = this.secoes[index];
  
    secao.isOpen = !secao.isOpen;
  
    if (secao.isOpen) {
      // Certifica-se de que secao.contents sempre existe
      if (!secao.contents) {
        secao.contents = [];
      }
  
      // Apenas carrega os conteúdos se ainda não tiver carregado antes
      if (secao.contents.length === 0) {
        this.contentService.getContents(this.courseId, secao.id).subscribe(
          (conteudos) => {
            secao.contents = conteudos;
          },
          (error) => {
            console.error("Erro ao carregar conteúdos da seção:", error);
          }
        );
      }
    }
  }
  
  

  // Criar uma nova seção
  criarNovaSecao(): void {
    const newSection: SectionDTO = {
      id: 0, // Temporário (será gerado pelo back-end)
      title: 'Nova Seção',
      description: '',
      courseId: this.courseId,
      contents: []
    };

    this.sectionService.createSection(this.courseId, newSection).subscribe(() => {
      this.getSecoes();
    });
  }

  // Abrir modal para editar seção
  editarSecao(secao: SectionDTO): void {
    this.secaoEdit = { ...secao };
    this.showEditSecaoModal = true;
  }
  
  // Salvar edição da seção
  salvarEdicaoSecao(): void {
    if (this.secaoEdit) {
      this.sectionService.updateSection(this.courseId, this.secaoEdit.id, this.secaoEdit).subscribe(() => {
        this.getSecoes();
        this.showEditSecaoModal = false;
      });
    }
  }

  // Excluir seção
  excluirSecao(sectionId: number): void {
    if (confirm('Tem certeza que deseja excluir esta seção?')) {
      this.sectionService.deleteSection(this.courseId, sectionId).subscribe(
        () => {
          alert('Seção excluída com sucesso.');
          this.getSecoes(); 
        },
        (error) => {
          console.error('Erro ao excluir a seção:', error);
          alert('Erro ao excluir a seção. Tente novamente mais tarde.');
        }
      );
    }
  }
  

  // Adicionar conteúdo à seção
  adicionarConteudo(sectionId: number): void {
    this.currentContent = {
      id: 0, // Será gerado pelo back-end
      title: '',
      description: '',
      contentType: ContentType.VIDEO,
      fileUrl: '',
      fileName: '',
      sectionId: sectionId
    };
    this.editingContent = false;
    this.showContentModal = true;
  }

  // Editar conteúdo
  editarConteudo(conteudo: ContentDTO): void {
    if (!conteudo) {
      console.error("Erro: Nenhum conteúdo foi fornecido para edição.");
      return;
    }
  
    // Preenche o conteúdo atual no modal
    this.currentContent = { ...conteudo };
    this.editingContent = true;
  
    // Log para depurar o conteúdo selecionado
    console.log("Conteúdo selecionado:", conteudo);
  
    // Verifica se existe um arquivo associado
    if (conteudo.fileName) {
      console.log(`Arquivo associado encontrado: ${conteudo.fileName}`);
    } else {
      console.warn("Nenhum arquivo associado encontrado para este conteúdo.");
    }
  
    this.showContentModal = true;
  }

  // Excluir conteúdo
  excluirConteudo(contentId: number, sectionId: number): void {
    if (confirm(`Tem certeza que deseja excluir este conteúdo?`)) {
      this.contentService.deleteContent(this.courseId, sectionId, contentId).subscribe(() => {
        this.getSecoes();
      });
    }
  }

// Fechar modal de conteúdo
closeContentModal(): void {
  this.showContentModal = false;
  this.currentContent = {
    id: 0,
    title: '',
    description: '',
    contentType: ContentType.VIDEO,
    fileUrl: '',
    fileName: '',
    sectionId: 0
  };
  this.selectedFile = null;
}

  // Lidar com upload de arquivo
  handleFileUpload(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  // Salvar conteúdo (criação ou edição)
  saveContent(): void {
    if (!this.currentContent || !this.currentContent.title) {
      alert('Preencha todos os campos corretamente.');
      return;
    }
  
    this.isUploading = true; // Ativa o loading durante o upload
  
    if (this.selectedFile) {
      // Faz upload do novo arquivo
      this.fileService.uploadContent(this.courseId, this.currentContent.sectionId, this.currentContent, this.selectedFile)
        .subscribe(
          (response) => {
            console.log("Upload bem-sucedido:", response);
            alert(response); // Exibe a mensagem de sucesso do servidor
            this.getSecoes(); // Atualiza as seções
            this.closeContentModal();
          },
          (error) => {
            console.error("Erro no upload:", error);
            alert("Erro no upload do conteúdo.");
          }
        )
        .add(() => this.isUploading = false); // Desativa o loading após o upload
    } else {
      // Atualiza somente os dados do conteúdo, sem upload de arquivo
      this.contentService.updateContent(this.courseId, this.currentContent.sectionId, this.currentContent.id, this.currentContent)
        .subscribe(
          () => {
            console.log("Conteúdo atualizado com sucesso.");
            this.getSecoes();
            this.closeContentModal();
          },
          (error) => {
            console.error("Erro ao atualizar o conteúdo:", error);
            alert("Erro ao atualizar o conteúdo.");
          }
        )
        .add(() => this.isUploading = false); // Desativa o loading após o update
    }
  }
  
  
  

  // Fechar modal de edição da seção
  closeEditSecaoModal(): void {
    this.showEditSecaoModal = false;
    this.secaoEdit = {
      id: 0,
      title: '',
      description: '',
      courseId: 0,
      contents: []
    };
  }
  
}