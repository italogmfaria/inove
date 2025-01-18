import { Injectable } from '@angular/core';
import {environment} from "../../../environments/environment";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {CursoDTO} from "../dto/CursoDTO";


@Injectable({
  providedIn: 'root'
})
export class CourseService {

  private baseUrl = `${environment.apiBaseUrl}/cursos`;

  constructor(private http: HttpClient) {}

  getCourses(): Observable<CursoDTO[]> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<CursoDTO[]>(this.baseUrl, { headers });
  }

  getCourseById(courseId: number): Observable<CursoDTO> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<CursoDTO>(`${this.baseUrl}/${courseId}`, { headers });
  }
}
