import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CursoDTO } from "../common/dto/CursoDTO";
import { CourseService } from "../common/service/course.service";

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

  constructor(
    private router: Router, 
    private courseService: CourseService
  ) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses() {
    this.courseService.getCourses().subscribe(
      (data: CursoDTO[]) => {
        if (data && data.length > 0) {
          this.cursos = data;
          this.filteredCursos = data; 
        } else {
          this.errorMessage = 'Nenhum curso disponível no momento.';
        }
      },
      (error) => {
        console.error('Erro ao buscar cursos:', error);
        this.errorMessage = 'Erro ao carregar os cursos. Tente novamente mais tarde.';
      }
    );
  }

  filterCourses() {
    const query = this.searchQuery.toLowerCase();
    this.filteredCursos = this.cursos.filter(curso =>
      curso.name.toLowerCase().includes(query)
    );
  }

  navigateToPreview(cursoId: number) {
    this.router.navigate(['/preview-curso', cursoId]);
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
