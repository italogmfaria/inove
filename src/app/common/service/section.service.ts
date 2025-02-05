import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { SectionDTO } from '../dto/SectionDTO';

@Injectable({
  providedIn: 'root'
})
export class SectionService {

  private baseUrl = `${environment.apiBaseUrl}/cursos`;

  constructor(private http: HttpClient) {}

  getSections(courseId: number): Observable<SectionDTO[]> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<SectionDTO[]>(`${this.baseUrl}/${courseId}/secoes`, { headers });
  }

  getSectionById(courseId: number, sectionId: number): Observable<SectionDTO> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<SectionDTO>(`${this.baseUrl}/${courseId}/secoes/${sectionId}`, { headers });
  }

  createSection(courseId: number, section: SectionDTO): Observable<SectionDTO> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<SectionDTO>(`${this.baseUrl}/${courseId}/secoes`, section, { headers });
  }

  updateSection(courseId: number, sectionId: number, section: SectionDTO): Observable<SectionDTO> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.put<SectionDTO>(`${this.baseUrl}/${courseId}/secoes/${sectionId}`, section, { headers });
  }
  deleteSection(courseId: number, sectionId: number): Observable<void> {
    const token = localStorage.getItem('authToken'); 
  
    if (!token) {
      console.error('Token não encontrado! O usuário pode estar deslogado.');
      return throwError(() => new Error('Usuário não autenticado.'));
    }
  
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    });
  
    return this.http.delete<void>(`${this.baseUrl}/${courseId}/secoes/${sectionId}`, { headers });
  }
  
}
