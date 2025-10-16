import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { CursoDTO } from '../dto/CursoDTO';

@Injectable({ providedIn: 'root' })
export class CourseService {
  private baseUrl = `${environment.apiBaseUrl}/cursos`;

  constructor(private http: HttpClient) {}

  getCourses(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  getCourseById(courseId: number): Observable<CursoDTO> {
    return this.http.get<CursoDTO>(`${this.baseUrl}/${courseId}`);
  }

  subscribeToCourse(courseId: number): Observable<any> {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      return new Observable((observer) => {
        observer.error(new Error('Usuário não está logado.'));
      });
    }
    return this.http
      .post<any>(`${environment.apiBaseUrl}/usuarios/${userId}/inscreverse/${courseId}`, {})
      .pipe(
        catchError((err) => {
          return throwError(() => new Error('Erro ao se inscrever no curso.'));
        })
      );
  }

  addCourse(course: CursoDTO): Observable<void> {
    const payload = {
      name: course.name,
      description: course.description,
      instructors: course.instructors,
    };
    return this.http.post<void>(this.baseUrl, payload);
  }

  updateCourse(id: number, courseData: any): Observable<void> {
    const payload = {
      name: courseData.name,
      description: courseData.description,
      instructors: courseData.instructors,
    };
    return this.http.put<void>(`${this.baseUrl}/${id}`, payload);
  }

  updateCourseInstructor(id: number, coursePayload: { name: string; description: string; imageUrl?: string }): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, coursePayload);
  }

  getInstructorCourses(instructorId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/instrutor/${instructorId}`);
  }

  deleteCourse(courseId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${courseId}`);
  }
}
