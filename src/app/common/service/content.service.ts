import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ContentDTO } from '../dto/ContentDTO';

@Injectable({
  providedIn: 'root'
})
export class ContentService {

  private baseUrl = `${environment.apiBaseUrl}/cursos`;

  constructor(private http: HttpClient) {}

  getContents(courseId: number, sectionId: number): Observable<ContentDTO[]> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<ContentDTO[]>(`${this.baseUrl}/${courseId}/secoes/${sectionId}/conteudos`, { headers });
  }

  getContentById(courseId: number, sectionId: number, contentId: number): Observable<ContentDTO> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<ContentDTO>(`${this.baseUrl}/${courseId}/secoes/${sectionId}/conteudos/${contentId}`, { headers });
  }

  updateContent(courseId: number, sectionId: number, contentId: number, content: ContentDTO): Observable<ContentDTO> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.put<ContentDTO>(`${this.baseUrl}/${courseId}/secoes/${sectionId}/conteudos/${contentId}`, content, { headers });
  }

  deleteContent(courseId: number, sectionId: number, contentId: number): Observable<void> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.delete<void>(`${this.baseUrl}/${courseId}/secoes/${sectionId}/conteudos/${contentId}`, { headers });
  }
}
