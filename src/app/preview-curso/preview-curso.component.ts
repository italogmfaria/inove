import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CursoDTO } from "../common/dto/CursoDTO";
import { CourseService } from "../common/service/course.service";
import { AuthService } from "../common/service/auth.service";

@Component({
  selector: 'app-preview-curso',
  templateUrl: './preview-curso.component.html',
  styleUrls: ['./preview-curso.component.css'],
})
export class PreviewCursoComponent implements OnInit {
  course: CursoDTO | null = null;
  isLoggedIn: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private authService: AuthService
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
          // Verifica se os instrutores e feedbacks contêm objetos esperados
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
        }
      },
      (error) => {
        console.error('Erro ao carregar detalhes do curso:', error);
      }
    );
  }
  

  subscribeAndNavigate(): void {
    if (!this.isLoggedIn) {
      alert('Você precisa estar logado para se inscrever no curso.');
      this.router.navigate(['/login']);
      return;
    }
  
    if (!this.course) {
      console.error('Curso não encontrado.');
      alert('Curso não encontrado.');
      return;
    }
  
    this.courseService.subscribeToCourse(this.course.id).subscribe({
      next: () => {
        alert('Inscrição realizada com sucesso!');
        this.navigateToCurso(); 
      },
      error: (error) => {
        console.error('Erro ao se inscrever no curso:', error);
        if (error.message === 'Usuário não está logado.') {
          alert('Você precisa estar logado para se inscrever no curso.');
          this.router.navigate(['/login']);
        } else {
          alert('Você já está inscrito neste curso.');
          this.router.navigate([`/painel-curso/${this.course?.id}`]);
        }
      },
    });
  }  
  
  navigateToCurso() {
    if (this.isLoggedIn) {
      this.router.navigate([`/painel-curso/${this.course?.id}`]);
    } else {
      alert('Você precisa estar logado para se inscrever no curso.');
      this.router.navigate(['/login']);
    }
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
