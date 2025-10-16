import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { map, Observable, catchError, throwError } from 'rxjs';
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

    return this.http.post<any>(`${this.baseUrl}/${courseId}/upload-imagem-curso`, formData, { headers })
      .pipe(
        map(response => {
          if (!response || !response.imageUrl) {
            throw new Error('URL da imagem não recebida do servidor');
          }
          return response.imageUrl;
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Erro detalhado do upload:', error);
          let errorMessage = 'Erro ao fazer upload da imagem';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  getStreamUrl(fileName: string): string {
    return `${environment.apiBaseUrl}/cursos/secoes/conteudos/stream/${fileName}`;
  }

  getCourseImage(courseId: number): Observable<{ imageUrl: string }> {
    const headers = new HttpHeaders({
      'ngrok-skip-browser-warning': 'true'
    });
    return this.http.get<{ imageUrl: string }>(`${this.baseUrl}/${courseId}/preview-imagem`, { headers })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Erro ao obter imagem do curso:', error);
          return throwError(() => new Error('Não foi possível carregar a imagem do curso'));
        })
      );
  }
}
