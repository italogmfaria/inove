import {CommonModule} from '@angular/common';
import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-cadastro-secao',
  templateUrl: './cadastro-secao.component.html',
  styleUrls: ['./cadastro-secao.component.css']
})
export class CadastroSecaoComponent {
  secoes = [
    {
      nome: 'Introdução',
      conteudos: [
        {nome: 'Bem-vindo ao curso', tipo: 'Vídeo'},
        {nome: 'Objetivos do curso', tipo: 'Teórico'}
      ],
      expanded: false
    },
    {
      nome: 'Fundamentos',
      conteudos: [
        {nome: 'Conceitos básicos', tipo: 'Vídeo'}
      ],
      expanded: false
    }
  ];

  // Modal States
  showEditSecaoModal: boolean = false;
  showContentModal: boolean = false;

  secaoEdit: any = {nome: ''};
  secaoEditIndex: number | null = null;

  currentContent: any = {nome: '', tipo: 'Vídeo', arquivo: null};
  editingContent: boolean = false;
  editingIndexes: { secaoIndex: number; conteudoIndex?: number } | null = null;

  // Alternar a exibição de detalhes da seção
  toggleSection(index: number): void {
    this.secoes[index].expanded = !this.secoes[index].expanded;
  }

  // Abrir modal para atualizar seção
  editarSecao(index: number): void {
    this.secaoEdit = {...this.secoes[index]};
    this.secaoEditIndex = index;
    this.showEditSecaoModal = true;
  }

  // Excluir conteúdo de uma seção
  excluirConteudo(secaoIndex: number, conteudoIndex: number): void {
    this.secoes[secaoIndex].conteudos.splice(conteudoIndex, 1);
  }

  // Excluir seção
  excluirSecao(index: number): void {
    const confirmDelete = confirm(`Tem certeza que deseja excluir a seção ${index + 1}?`);
    if (confirmDelete) {
      this.secoes.splice(index, 1);
    }
  }

  // Criar nova seção
  criarNovaSecao(): void {
    this.secoes.push({nome: `Nova Seção ${this.secoes.length + 1}`, conteudos: [], expanded: false});
  }

  // Adicionar conteúdo à seção
  adicionarConteudo(secaoIndex: number): void {
    if (secaoIndex >= 0 && secaoIndex < this.secoes.length) {
      this.currentContent = {nome: '', tipo: 'Vídeo', arquivo: null};
      this.editingContent = false; // Indica que é um novo conteúdo
      this.editingIndexes = {secaoIndex};
      this.showContentModal = true;
    } else {
      console.error('Índice da seção inválido');
    }
  }

  // Editar conteúdo de uma seção
  editarConteudo(secaoIndex: number, conteudoIndex: number): void {
    if (
      secaoIndex >= 0 &&
      secaoIndex < this.secoes.length &&
      conteudoIndex >= 0 &&
      conteudoIndex < this.secoes[secaoIndex].conteudos.length
    ) {
      const conteudo = this.secoes[secaoIndex].conteudos[conteudoIndex];
      this.currentContent = {...conteudo}; // Carregar os dados no formulário
      this.editingContent = true; // Indica que é uma edição
      this.editingIndexes = {secaoIndex, conteudoIndex};
      this.showContentModal = true;
    } else {
      console.error('Índice da seção ou do conteúdo inválido');
    }
  }

  // Fechar modal
  closeContentModal(): void {
    this.showContentModal = false;
    this.currentContent = {nome: '', tipo: 'Vídeo', arquivo: null};
    this.editingIndexes = null;
    this.editingContent = false;
  }


  // Lidar com upload de arquivo
  handleFileUpload(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.currentContent.arquivo = file;
    }
  }

  // Salvar o conteúdo (novo ou atualizado)
  saveContent(): void {
    const secaoIndex = this.editingIndexes?.secaoIndex;

    if (secaoIndex !== undefined && secaoIndex >= 0 && secaoIndex < this.secoes.length) {
      if (this.currentContent.nome) {
        if (this.editingContent && this.editingIndexes?.conteudoIndex !== undefined) {
          // Atualizar conteúdo existente
          const conteudoIndex = this.editingIndexes.conteudoIndex;
          this.secoes[secaoIndex].conteudos[conteudoIndex] = {...this.currentContent};
        } else {
          // Adicionar novo conteúdo
          this.secoes[secaoIndex].conteudos.push({...this.currentContent});
        }

        this.closeContentModal();
      } else {
        alert('Por favor, preencha todos os campos.');
      }
    } else {
      console.error('Índice da seção inválido ao salvar conteúdo');
    }
  }

// Salvar alterações na seção
  salvarEdicaoSecao(): void {
    if (this.secaoEditIndex !== null && this.secaoEdit.nome.trim() !== '') {
      this.secoes[this.secaoEditIndex].nome = this.secaoEdit.nome.trim(); // Atualiza o nome da seção
      this.closeEditSecaoModal();
    } else {
      alert('Por favor, insira um nome válido para a seção.');
    }
  }

// Fechar modal de edição de seção
  closeEditSecaoModal(): void {
    this.showEditSecaoModal = false;
    this.secaoEdit = {nome: ''};
    this.secaoEditIndex = null;
  }
}
