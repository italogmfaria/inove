import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '../common/service/course.service';
import { SectionService } from '../common/service/section.service';
import { ContentService } from '../common/service/content.service';
import { FileService } from '../common/service/file.service';
import { CursoDTO } from '../common/dto/CursoDTO';
import { SectionDTO } from '../common/dto/SectionDTO';
import { ContentDTO } from '../common/dto/ContentDTO';

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
  comments: { user: string; text: string }[] = [];
  newComment: string = '';
  showCommentBox: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private sectionService: SectionService,
    private contentService: ContentService,
    private fileService: FileService 
  ) {}

  ngOnInit(): void {
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
        this.courseTitle = course.name;
        this.description = course.description;
        this.instructor = course.instructors?.[0]?.name || 'Instrutor Não Informado';
        this.courseCreationDate = new Date(course.creationDate);
        this.lastUpdateDate = new Date(course.lastUpdateDate);
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
    this.currentContentUrl = this.fileService.getStreamUrl(content.fileName);
    this.currentContentType = content.contentType;
  
    console.log("Conteúdo selecionado:", content);
    console.log("URL carregada:", this.currentContentUrl);
  }


  toggleCommentBox(): void {
    this.showCommentBox = !this.showCommentBox;
  }

  addComment(): void {
    if (this.newComment.trim()) {
      this.comments.push({
        user: 'Usuário Atual',
        text: this.newComment.trim(),
      });
      this.newComment = '';
      this.showCommentBox = false;
    }
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
