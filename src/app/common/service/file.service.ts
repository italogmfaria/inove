import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

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
      .pipe(
        map(response => response.imageUrl) 
      );
  }
  
  getCourseImage(courseId: number): Observable<{ imageUrl: string }> {
    return this.http.get<{ imageUrl: string }>(`${this.baseUrl}/${courseId}/preview-imagem`);
  }  
}
