import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Component, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({
  name: 'safeUrl'
})
export class SafeUrlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(value);
  }
}

// Define a specific type for content
type ContentType = 'video' | 'pdf';

interface Content {
  title: string;
  type: ContentType;
  url: string;
}

interface Section {
  title: string;
  contents: Content[];
  isOpen: boolean;
}

@Component({
  selector: 'app-painel-curso',
  templateUrl: './painel-curso.component.html',
  styleUrls: ['./painel-curso.component.css'],
})
export class PainelCursoComponent {
  constructor(private router: Router) {}


  courseTitle = 'NOME DO CURSO';
  description = 'Este é um exemplo de uma descrição de um curso.';
  instructor = 'João Silva';
  courseCreationDate: Date = new Date('2024-11-26');
  lastUpdateDate: Date = new Date('2024-11-27');


  currentContentUrl: string = 'https://www.youtube.com/embed/kQxQQOj2Wg8';
  currentContentType: ContentType = 'video';


  sections: Section[] = [
    {
      title: 'Seção 1: Introdução',
      contents: [
        { title: 'Conteúdo 1: Introdução', type: 'video', url: 'https://www.youtube.com/embed/kQxQQOj2Wg8' },
        { title: 'Conteúdo 2: PDF Introdução', type: 'pdf', url: 'https://eppg.fgv.br/sites/default/files/teste.pdf' },
        { title: 'Conteúdo 3: Introdução', type: 'video', url: 'https://www.youtube.com/embed/l73dA-A0Si4' },
      ],
      isOpen: true,
    },
    {
      title: 'Seção 2: Fundamentos',
      contents: [
        { title: 'Conteúdo 1: Fundamentos', type: 'video', url: 'https://www.youtube.com/embed/l73dA-A0Si4' },
        { title: 'Conteúdo 2: PDF Fundamentos', type: 'pdf', url: 'https://eppg.fgv.br/sites/default/files/teste.pdf' },
      ],
      isOpen: false,
    },
  ];


  comments = [
    { user: 'Usuário 1', text: 'Comentário do usuário 1' },
    { user: 'Usuário 2', text: 'Comentário do usuário 2' },
    { user: 'Usuário 3', text: 'Comentário do usuário 3' },
  ];


  showCommentBox = false;
  newComment = '';


  toggleCommentBox(): void {
    this.showCommentBox = !this.showCommentBox;
  }

  addComment(): void {
    if (this.newComment.trim()) {
      this.comments.push({ user: 'Novo Usuário', text: this.newComment });
      this.newComment = '';
      this.showCommentBox = false;
    }
  }


  toggleSection(index: number): void {
    this.sections[index].isOpen = !this.sections[index].isOpen;
  }


  changeContent(content: Content): void {
    this.currentContentType = content.type;
    this.currentContentUrl = content.url;
  }


  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
