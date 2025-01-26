import { Injectable } from '@angular/core';
import { environment } from "../../../environments/environment";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { CursoDTO } from "../dto/CursoDTO";

@Injectable({
  providedIn: 'root'
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
