import { CommonModule } from '@angular/common';
import {Component, OnInit} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {CursoDTO} from "../common/dto/CursoDTO";
import {CourseService} from "../common/service/course.service";

@Component({
  selector: 'app-preview-curso',
  templateUrl: './preview-curso.component.html',
  styleUrls: ['./preview-curso.component.css'],
})
export class PreviewCursoComponent implements OnInit {
  course: CursoDTO | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService
  ) {}

  ngOnInit() {
    const courseId = this.route.snapshot.paramMap.get('id');
    if (courseId) {
      this.loadCourseDetails(parseInt(courseId, 10));
    }
  }

  loadCourseDetails(courseId: number) {
    this.courseService.getCourseById(courseId).subscribe(
      (course) => {
        this.course = course;
      },
      (error) => {
        console.error('Erro ao carregar detalhes do curso:', error);
      }
    );
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  navigateToCurso(path: string): void {
    if (this.course) {
      this.router.navigate([`${path}/${this.course.id}`]);
    } else {
      console.error('Nenhum curso carregado para navegar.');
    }
  }  
}
