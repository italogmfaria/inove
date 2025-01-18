import { CommonModule } from '@angular/common';
import {Component, OnInit} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {CursoDTO} from "../common/dto/CursoDTO";
import {CourseService} from "../common/service/course.service";

@Component({
  selector: 'app-cursos',
  templateUrl: './cursos.component.html',
  styleUrl: './cursos.component.css'
})
export class CursosComponent implements OnInit {
  cursos: CursoDTO[] = [];

  constructor(private router: Router, private courseService: CourseService) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses() {
    this.courseService.getCourses().subscribe(
      (data: CursoDTO[]) => {
        this.cursos = data;
      },
      (error) => {
        console.error('Erro ao buscar cursos:', error);
      }
    );
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  navigateToPreview(cursoId: number) {
    this.router.navigate(['/preview-curso', cursoId]);
  }
}
