import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SchoolDTO } from '../dto/SchoolDTO';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SchoolService {
  private baseUrl = `${environment.apiBaseUrl}/escolas`;

  constructor(private http: HttpClient) {}

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

  getSchools(): Observable<SchoolDTO[]> {
    const headers = this.createHeaders();
    return this.http.get<SchoolDTO[]>(this.baseUrl, { headers });
  }

  addSchool(school: SchoolDTO): Observable<void> {
    const headers = this.createHeaders();
    return this.http.post<void>(this.baseUrl, school, { headers });
  }

  updateSchool(school: SchoolDTO): Observable<void> {
    const headers = this.createHeaders();
    return this.http.put<void>(`${this.baseUrl}/${school.id}`, school, { headers });
  }

  deleteSchool(schoolId: number): Observable<void> {
    const headers = this.createHeaders();
    return this.http.delete<void>(`${this.baseUrl}/${schoolId}`, { headers });
  }
}
