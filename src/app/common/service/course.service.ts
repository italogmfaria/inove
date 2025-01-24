import { Injectable } from '@angular/core';
import {environment} from "../../../environments/environment";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {catchError, Observable, throwError} from "rxjs";
import {CursoDTO} from "../dto/CursoDTO";


@Injectable({
  providedIn: 'root'
})
export class CourseService {

  private baseUrl = `${environment.apiBaseUrl}/cursos`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getCourses(): Observable<CursoDTO[]> {
    return this.http.get<CursoDTO[]>(this.baseUrl, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error('Erro ao buscar cursos:', error);
          return throwError(error);
        })
      );
  }

  getCourseById(courseId: number): Observable<CursoDTO> {
    return this.http.get<CursoDTO>(`${this.baseUrl}/${courseId}`, { headers: this.getHeaders() })
      .pipe(
        catchError(error => {
          console.error(`Erro ao buscar curso com ID ${courseId}:`, error);
          return throwError(error);
        })
      );
  }
}
