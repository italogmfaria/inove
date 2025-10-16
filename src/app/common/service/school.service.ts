import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SchoolDTO } from '../dto/SchoolDTO';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SchoolService {
  private baseUrl = `${environment.apiBaseUrl}/escolas`;

  constructor(private http: HttpClient) {}

  getSchools(): Observable<SchoolDTO[]> {
    return this.http.get<SchoolDTO[]>(this.baseUrl);
  }

  addSchool(school: SchoolDTO): Observable<void> {
    return this.http.post<void>(this.baseUrl, school);
  }

  updateSchool(school: SchoolDTO): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${school.id}`, school);
  }

  deleteSchool(schoolId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${schoolId}`);
  }
}
