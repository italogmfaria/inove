import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../common/service/auth.service';
import { UserService } from '../common/service/user.service';
import { UserDTO } from '../common/dto/UserDTO';
import { CourseService } from '../common/service/course.service';
import { UserRole } from '../common/dto/UserRole';
import { FileService } from '../common/service/file.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-perfil-usuario',
  templateUrl: './perfil-usuario.component.html',
  styleUrls: ['./perfil-usuario.component.css'],
})
export class PerfilUsuarioComponent implements OnInit {
  activePanel: 'cursos' | 'dados' = 'cursos';
  isEditing: boolean = false;
  user: any = {};
  userCourses: any[] = [];
  courseImages: { [key: number]: string } = {};

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private fileService: FileService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const userId = Number(localStorage.getItem('userId'));
    if (!userId || userId === 0) {
      console.error("Erro: Usuário não autenticado.");
      this.router.navigate(['/login']);
      return;
    }

    // Buscar dados do usuário
    this.userService.getUserById(userId).subscribe({
      next: (user) => (this.user = user),
      error: (err) => console.error("Erro ao buscar usuário:", err),
    });

    // Buscar os cursos do usuário e carregar as imagens
    this.userService.getUserCourses(userId).subscribe({
      next: (courses) => {
        this.userCourses = courses;
        this.userCourses.forEach((course) => {
          this.loadCourseImage(course.id);
        });
      },
      error: (err) => console.error("Erro ao buscar cursos:", err),
    });
  }

  // Método para buscar a imagem do curso e armazená-la no `courseImages`
  loadCourseImage(courseId: number): void {
    this.fileService.getCourseImage(courseId).subscribe({
      next: (response) => {
        this.courseImages[courseId] = response.imageUrl;
      },
      error: (err) => {
        console.error(`Erro ao carregar imagem do curso ${courseId}:`, err);
        this.courseImages[courseId] = 'assets/placeholder.png'; // Imagem padrão caso não consiga carregar
      },
    });
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }


  switchPanel(panel: 'cursos' | 'dados'): void {
    this.activePanel = panel;
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
  }

  saveUserData(): void {
    this.userService.updateUser(this.user).subscribe(() => this.toggleEdit());
  }

  navigateToCourse(courseId: number): void {
    this.router.navigate([`/painel-curso/${courseId}`]);
  }


  removeCourse(courseId: number): void {
    const userId = Number(localStorage.getItem('userId'));

    this.userService.removeUserCourse(userId, courseId).subscribe({
      next: () => {
        this.userCourses = this.userCourses.filter((course) => course.id !== courseId);
        this.toastr.success(`Curso removido com sucesso.`, 'Sucesso');
      },
      error: (err) => {
        console.error("Erro ao remover curso:", err);
        this.toastr.error("Não foi possível remover o curso. Tente novamente.", 'Erro');
      }
    });
  }


  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
