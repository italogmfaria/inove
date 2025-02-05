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
    return this.http.get<ContentDTO[]>(`${this.baseUrl}/${courseId}/secoes/${sectionId}/conteudos`, { headers: this.getHeaders() });
  }
  

  getContentById(courseId: number, sectionId: number, contentId: number): Observable<ContentDTO> {
    return this.http.get<ContentDTO>(`${this.baseUrl}/${courseId}/secoes/${sectionId}/conteudos/${contentId}`, { headers: this.getHeaders() });
  }

  updateContent(courseId: number, sectionId: number, contentId: number, content: ContentDTO): Observable<ContentDTO> {
    return this.http.put<ContentDTO>(
      `${this.baseUrl}/${courseId}/secoes/${sectionId}/conteudos/${contentId}`,
      content,
      { headers: this.getHeaders() }
    );
  }
  
  getFileType(fileName: string): Observable<{ contentType: string }> {
    return this.http.get<{ contentType: string }>(
      `${environment.apiBaseUrl}/cursos/secoes/conteudos/type/${fileName}`,
      { headers: this.getHeaders() }
    );
  }
  

  deleteContent(courseId: number, sectionId: number, contentId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/${courseId}/secoes/${sectionId}/conteudos/${contentId}`,
      { headers: this.getHeaders() }
    );
  }
  
  uploadContent(courseId: number, sectionId: number, file: File, contentData: ContentDTO): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', contentData.title);
    formData.append('description', contentData.description);
    formData.append('contentType', contentData.contentType);
  
    return this.http.post(
      `${this.baseUrl}/${courseId}/secoes/${sectionId}/conteudos/upload`,
      formData,
      { headers: this.getAuthHeaders(), responseType: 'text' } 
    );
  }
  

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken'); 
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken'); 
    return new HttpHeaders({
      'Authorization': `Bearer ${token}` 
    });
  }
}
