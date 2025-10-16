import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CursoDTO } from "../common/dto/CursoDTO";
import { CourseService } from "../common/service/course.service";
import { FileService } from '../common/service/file.service';
import { AuthService } from '../common/service/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cursos',
  templateUrl: './cursos.component.html',
  styleUrls: ['./cursos.component.css']
})
export class CursosComponent implements OnInit {
  cursos: CursoDTO[] = [];
  filteredCursos: CursoDTO[] = [];
  searchQuery: string = '';
  errorMessage: string = '';
  isLoggedIn: boolean = false;


  constructor(
    private router: Router,
    private courseService: CourseService,
    private fileService: FileService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadCourses();
    this.isLoggedIn = !!this.authService.getToken();
  }

  loadCourses(): void {
    this.courseService.getCourses().subscribe(
      (data: CursoDTO[]) => {
        if (data && data.length > 0) {
          this.cursos = data;
          this.filteredCursos = data;
          // Chamar método para carregar imagens de cada curso
          this.loadCourseImages();
        } else {
          this.errorMessage = 'Nenhum curso disponível no momento.';
        }
      },
      (error) => {
        console.error('Erro ao buscar cursos:', error);
        this.errorMessage =
          'Erro ao carregar os cursos. Tente novamente mais tarde.';
      }
    );
  }

  private loadCourseImages(): void {
    this.cursos.forEach((curso, index) => {
      this.fileService.getCourseImage(curso.id).subscribe({
        next: (response) => {
          this.cursos[index].imageUrl = response.imageUrl;
        },
        error: (err) => {
          console.error(
            'Erro ao carregar a imagem do curso com ID: ' + curso.id,
            err
          );

        },
      });
    });
  }


  filterCourses() {
    const query = this.searchQuery.toLowerCase();
    this.filteredCursos = this.cursos.filter(curso =>
      curso.name.toLowerCase().includes(query)
    );
  }

  navigateToPerfil() {
    if (this.isLoggedIn) {
      this.router.navigate([`/perfil-usuario`]);
    } else {
      this.toastr.warning('Você precisa estar logado para ver seu perfil.', 'Atenção');
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

  navigateToPreview(cursoId: number) {
    this.router.navigate(['/preview-curso', cursoId]);
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
