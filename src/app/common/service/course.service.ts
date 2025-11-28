import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { CursoDTO } from '../dto/CursoDTO';
import { CompletedContentResponseDTO } from '../dto/CompletedContentDTO';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  private baseUrl = `${environment.apiBaseUrl}/cursos`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getCourses(): Observable<any[]> {
    const headers = this.createHeaders();
    return this.http.get<any[]>(this.baseUrl, { headers });
  }

  getCourseById(courseId: number): Observable<CursoDTO> {
    const headers = this.createHeaders();
    return this.http.get<CursoDTO>(`${this.baseUrl}/${courseId}`, { headers });
  }

  subscribeToCourse(courseId: number): Observable<any> {
    const userId = localStorage.getItem('userId');

    if (!userId) {
      return new Observable((observer) => {
        observer.error(new Error('Usuário não está logado.'));
      });
    }
      return this.http.post<any>(`${environment.apiBaseUrl}/usuarios/${userId}/inscreverse/${courseId}`, {})
      .pipe(
        catchError((err) => {
          console.error('Erro ao se inscrever no curso:', err);
          return throwError(() => new Error('Erro ao se inscrever no curso.'));
        })
      );
  }


  addCourse(course: any): Observable<void> {
    const headers = this.createHeaders();
    return this.http.post<void>(this.baseUrl, course, { headers });
  }

  updateCourse(id: number, courseData: any): Observable<void> {
    const headers = this.createHeaders();
    return this.http.put<void>(`${this.baseUrl}/${id}`, courseData, { headers });
  }

  updateCourseInstructor(id: number, coursePayload: { name: string; description: string; imageUrl?: string }): Observable<void> {
    const headers = this.createHeaders();
    return this.http.put<void>(`${this.baseUrl}/${id}`, coursePayload, { headers });
  }

  getInstructorCourses(instructorId: number): Observable<any[]> {
    const headers = this.createHeaders();
    return this.http.get<any[]>(`${this.baseUrl}/instrutor/${instructorId}`, { headers });
  }


  deleteCourse(courseId: number): Observable<void> {
    const headers = this.createHeaders();
    return this.http.delete<void>(`${this.baseUrl}/${courseId}`, { headers });
  }

  getStudentProgress(courseId: number, userId: number): Observable<CompletedContentResponseDTO> {
    const headers = this.createHeaders();
    return this.http.get<CompletedContentResponseDTO>(
      `${this.baseUrl}/${courseId}/discente/${userId}/progresso`,
      { headers }
    );
  }

  getCurrentUserProgress(courseId: number): Observable<CompletedContentResponseDTO> {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      return throwError(() => new Error('Usuário não está logado.'));
    }
    return this.getStudentProgress(courseId, parseInt(userId, 10));
  }

  private createHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }
}
