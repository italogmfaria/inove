import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { map, Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FileService {
  private baseUrl = `${environment.apiBaseUrl}/cursos`;

  constructor(private http: HttpClient) {}

  uploadCourseImage(courseId: number, file: File): Observable<string> {
    const formData = new FormData();
    formData.append('imagem', file);

    return this.http.post<any>(`${this.baseUrl}/${courseId}/upload-imagem-curso`, formData).pipe(
      map(response => {
        if (!response || !response.imageUrl) {
          throw new Error('URL da imagem não recebida do servidor');
        }
        return response.imageUrl;
      }),
      catchError((error: HttpErrorResponse) => {
        const message = error.error?.message || 'Erro ao fazer upload da imagem';
        return throwError(() => new Error(message));
      })
    );
  }

  getStreamUrl(fileName: string): string {
    return `${environment.apiBaseUrl}/cursos/secoes/conteudos/stream/${fileName}`;
  }

  getCourseImage(courseId: number): Observable<{ imageUrl: string }> {
    return this.http.get<{ imageUrl: string }>(`${this.baseUrl}/${courseId}/preview-imagem`).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => new Error('Não foi possível carregar a imagem do curso'));
      })
    );
  }
}
