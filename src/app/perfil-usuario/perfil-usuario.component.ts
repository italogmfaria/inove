import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../common/service/auth.service';
import { UserService } from '../common/service/user.service';
import { UserDTO } from '../common/dto/UserDTO';
import { CourseService } from '../common/service/course.service';
import { UserRole } from '../common/dto/UserRole';

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

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    const userId = Number(localStorage.getItem('userId'));
    if (!userId || userId === 0) {
      console.error("Erro: Usuário não autenticado.");
      this.router.navigate(['/login']); 
      return;
    }
    
    this.userService.getUserById(userId).subscribe({
      next: (user) => (this.user = user),
      error: (err) => console.error("Erro ao buscar usuário:", err)
    });
  
    this.userService.getUserCourses(userId).subscribe({
      next: (courses) => (this.userCourses = courses),
      error: (err) => console.error("Erro ao buscar cursos:", err)
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
        console.log(`Curso com ID ${courseId} removido com sucesso.`);
      },
      error: (err) => {
        console.error("Erro ao remover curso:", err);
        alert("Não foi possível remover o curso. Tente novamente.");
      }
    });
  }
  

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']); 
  }
}
