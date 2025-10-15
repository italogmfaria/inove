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

    const headers = new HttpHeaders({
      'ngrok-skip-browser-warning': 'true'
    });

    return this.http.post<{ imageUrl: string }>(`${this.baseUrl}/${courseId}/upload-imagem-curso`, formData, { headers })
      .pipe(map(response => response.imageUrl));
  }

  getStreamUrl(fileName: string): string {
    return `${environment.apiBaseUrl}/cursos/secoes/conteudos/stream/${fileName}`;
  }

  getCourseImage(courseId: number): Observable<{ imageUrl: string }> {
    const headers = new HttpHeaders({
      'ngrok-skip-browser-warning': 'true'
    });
    return this.http.get<{ imageUrl: string }>(`${this.baseUrl}/${courseId}/preview-imagem`, { headers });
  }
}
