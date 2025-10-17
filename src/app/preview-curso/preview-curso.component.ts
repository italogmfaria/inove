import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CursoDTO } from "../common/dto/CursoDTO";
import { CourseService } from "../common/service/course.service";
import { AuthService } from "../common/service/auth.service";
import { FileService } from '../common/service/file.service';
import { UserService } from '../common/service/user.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-preview-curso',
  templateUrl: './preview-curso.component.html',
  styleUrls: ['./preview-curso.component.css'],
})
export class PreviewCursoComponent implements OnInit {
  course: CursoDTO | null = null;
  isLoggedIn: boolean = false;
  isEnrolled: boolean = false;
  courseImageUrl: string = 'assets/placeholder.png';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private authService: AuthService,
    private fileService: FileService,
    private userService: UserService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.isLoggedIn = !!this.authService.getToken(); // Verifica login
    const courseId = this.route.snapshot.paramMap.get('id');
    if (courseId) {
      this.loadCourseDetails(parseInt(courseId, 10));
      if (this.isLoggedIn) {
        this.checkEnrollment(parseInt(courseId, 10));
      }
    }
  }

  checkEnrollment(courseId: number): void {
    const userId = Number(localStorage.getItem('userId'));
    if (userId) {
      this.userService.getUserCourses(userId).subscribe({
        next: (courses) => {
          this.isEnrolled = courses.some(course => course.id === courseId);
        },
        error: (err) => {
          // Silently fail - user may not have courses
        }
      });
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
        this.toastr.error('Erro ao carregar detalhes do curso.', 'Erro');
      }
    );
  }

  loadCourseImage(courseId: number): void {
    this.fileService.getCourseImage(courseId).subscribe({
      next: (response) => {
        this.courseImageUrl = response.imageUrl;
      },
      error: (err) => {
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
      this.toastr.error('Curso não encontrado.', 'Erro');
      return;
    }

    if (this.isEnrolled) {
      this.navigateToCurso();
      return;
    }

    this.courseService.subscribeToCourse(this.course.id).subscribe({
      next: () => {
        this.toastr.success('Inscrição realizada com sucesso!', 'Sucesso');
        this.isEnrolled = true;
        this.navigateToCurso();
      },
      error: (error) => {
        if (error.message === 'Usuário não está logado.') {
          this.toastr.warning('Você precisa estar logado para se inscrever no curso.', 'Atenção');
          this.router.navigate(['/login']);
        } else {
          this.toastr.info('Você já está inscrito neste curso.', 'Informação');
          this.isEnrolled = true;
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

  navigateToLogo() {
    if (this.isLoggedIn) {
      this.router.navigate(['/cursos']);
    } else {
      this.router.navigate(['/inicial']);
    }
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
