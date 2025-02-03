import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ContentDTO } from '../dto/ContentDTO';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private baseUrl = `${environment.apiBaseUrl}/cursos`;

  constructor(private http: HttpClient) {}

  uploadCourseImage(courseId: number, file: File): Observable<string> {
    const formData = new FormData();
    formData.append('imagem', file);
  
    return this.http.post<{ imageUrl: string }>(`${this.baseUrl}/${courseId}/upload-imagem-curso`, formData)
      .pipe(map(response => response.imageUrl));
  }
  
  uploadContent(courseId: number, sectionId: number, contentDTO: ContentDTO, file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', new Blob([JSON.stringify(contentDTO)], { type: 'application/json' })); 
  
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}` 
    });
  
    return this.http.post(`${this.baseUrl}/${courseId}/secoes/${sectionId}/conteudos/upload`, formData, {
      headers,
      responseType: 'text'
    });
  }
  
  getStreamUrl(fileName: string): string {
    return `${environment.apiBaseUrl}/cursos/secoes/conteudos/stream/${fileName}`;
  }
  
  getCourseImage(courseId: number): Observable<{ imageUrl: string }> {
    return this.http.get<{ imageUrl: string }>(`${this.baseUrl}/${courseId}/preview-imagem`);
  }  
}
