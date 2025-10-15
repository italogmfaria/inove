import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CursoDTO } from "../common/dto/CursoDTO";
import { CourseService } from "../common/service/course.service";
import { AuthService } from "../common/service/auth.service";
import { FileService } from '../common/service/file.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-preview-curso',
  templateUrl: './preview-curso.component.html',
  styleUrls: ['./preview-curso.component.css'],
})
export class PreviewCursoComponent implements OnInit {
  course: CursoDTO | null = null;
  isLoggedIn: boolean = false;
  courseImageUrl: string = 'assets/placeholder.png';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private authService: AuthService,
    private fileService: FileService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.isLoggedIn = !!this.authService.getToken(); // Verifica login
    const courseId = this.route.snapshot.paramMap.get('id');
    if (courseId) {
      this.loadCourseDetails(parseInt(courseId, 10));
    }
  }

  loadCourseDetails(courseId: number) {
    this.courseService.getCourseById(courseId).subscribe(
      (course) => {
        if (course) {
          course.instructors = course.instructors.map(instructor => ({
            ...instructor,
            name: instructor.name || 'Desconhecido'
          }));

          course.feedBacks = course.feedBacks.map(feedback => ({
            ...feedback,
            student: {
              ...feedback.student,
              name: feedback.student?.name || 'Anônimo'
            }
          }));

          this.course = course;
          this.loadCourseImage(courseId);
        }
      },
      (error) => {
        console.error('Erro ao carregar detalhes do curso:', error);
      }
    );
  }

  loadCourseImage(courseId: number): void {
    this.fileService.getCourseImage(courseId).subscribe({
      next: (response) => {
        this.courseImageUrl = response.imageUrl;
      },
      error: (err) => {
        console.error(`Erro ao carregar imagem do curso ${courseId}:`, err);
        this.courseImageUrl = 'assets/placeholder.png';
      },
    });
  }

  subscribeAndNavigate(): void {
    if (!this.isLoggedIn) {
      this.toastr.warning('Você precisa estar logado para se inscrever no curso.', 'Atenção');
      this.router.navigate(['/login']);
      return;
    }

    if (!this.course) {
      console.error('Curso não encontrado.');
      this.toastr.error('Curso não encontrado.', 'Erro');
      return;
    }

    this.courseService.subscribeToCourse(this.course.id).subscribe({
      next: () => {
        this.toastr.success('Inscrição realizada com sucesso!', 'Sucesso');
        this.navigateToCurso();
      },
      error: (error) => {
        console.error('Erro ao se inscrever no curso:', error);
        if (error.message === 'Usuário não está logado.') {
          this.toastr.warning('Você precisa estar logado para se inscrever no curso.', 'Atenção');
          this.router.navigate(['/login']);
        } else {
          this.toastr.info('Você já está inscrito neste curso.', 'Informação');
          this.router.navigate([`/painel-curso/${this.course?.id}`]);
        }
      },
    });
  }

  navigateToCurso() {
    if (this.isLoggedIn) {
      this.router.navigate([`/painel-curso/${this.course?.id}`]);
    } else {
      this.toastr.warning('Você precisa estar logado para se inscrever no curso.', 'Atenção');
      this.router.navigate(['/login']);
    }
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
