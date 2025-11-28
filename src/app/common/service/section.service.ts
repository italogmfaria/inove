import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { SectionDTO } from '../dto/SectionDTO';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SectionService {

  private baseUrl = `${environment.apiBaseUrl}/cursos`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getSections(courseId: number): Observable<SectionDTO[]> {
    return this.http.get<SectionDTO[]>(`${this.baseUrl}/${courseId}/secoes`, { headers: this.getHeaders() });
  }

  getSectionById(courseId: number, sectionId: number): Observable<SectionDTO> {
    return this.http.get<SectionDTO>(`${this.baseUrl}/${courseId}/secoes/${sectionId}`, { headers: this.getHeaders() });
  }

  createSection(courseId: number, section: SectionDTO): Observable<SectionDTO> {
    return this.http.post<SectionDTO>(`${this.baseUrl}/${courseId}/secoes`, section, { headers: this.getHeaders() });
  }

  updateSection(courseId: number, sectionId: number, section: SectionDTO): Observable<SectionDTO> {
    return this.http.put<SectionDTO>(`${this.baseUrl}/${courseId}/secoes/${sectionId}`, section, { headers: this.getHeaders() });
  }

  deleteSection(courseId: number, sectionId: number): Observable<void> {
    const token = this.authService.getToken();

    if (!token) {
      console.error('Token não encontrado! O usuário pode estar deslogado.');
      return throwError(() => new Error('Usuário não autenticado.'));
    }

    return this.http.delete<void>(`${this.baseUrl}/${courseId}/secoes/${sectionId}`, { headers: this.getHeaders() });
  }

}
