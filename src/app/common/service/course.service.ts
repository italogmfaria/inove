import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CursoDTO } from '../dto/CursoDTO';

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  private baseUrl = `${environment.apiBaseUrl}/cursos`;

  constructor(private http: HttpClient) {}

  getCourses(): Observable<CursoDTO[]> {
    const headers = this.createHeaders();
    return this.http.get<CursoDTO[]>(this.baseUrl, { headers });
  }
  
  getCourseById(courseId: number): Observable<CursoDTO> {
    const headers = this.createHeaders();
    return this.http.get<CursoDTO>(`${this.baseUrl}/${courseId}`, { headers });
  }


  subscribeToCourse(courseId: number): Observable<void> {
    const userId = localStorage.getItem('userId'); 
    return this.http.post<void>(`api/inove/usuarios/${userId}/inscreverse/${courseId}`, {});
  }

  addCourse(course: CursoDTO): Observable<void> {
    const headers = this.createHeaders();
    return this.http.post<void>(this.baseUrl, course, { headers });
  }

  updateCourse(id: number, coursePayload: { name: string; description: string }): Observable<void> {
    const headers = this.createHeaders();
    return this.http.put<void>(`${this.baseUrl}/${id}`, coursePayload, { headers });
  }
  
  
  deleteCourse(courseId: number): Observable<void> {
    const headers = this.createHeaders();
    return this.http.delete<void>(`${this.baseUrl}/${courseId}`, { headers });
  }

  private createHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }
}
