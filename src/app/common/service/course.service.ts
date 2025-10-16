import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { CursoDTO } from '../dto/CursoDTO';

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  private baseUrl = `${environment.apiBaseUrl}/cursos`;


  constructor(private http: HttpClient) {}

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


  addCourse(course: CursoDTO): Observable<void> {
    const headers = this.createHeaders();
    const payload = {
      name: course.name,
      description: course.description,
      instructors: course.instructors
    };
    return this.http.post<void>(this.baseUrl, payload, { headers });
  }

  updateCourse(id: number, courseData: any): Observable<void> {
    const headers = this.createHeaders();
    const payload = {
      name: courseData.name,
      description: courseData.description,
      instructors: courseData.instructors
    };
    return this.http.put<void>(`${this.baseUrl}/${id}`, payload, { headers });
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

  private createHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }
}
