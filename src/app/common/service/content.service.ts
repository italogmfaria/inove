import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {ContentDTO} from "../dto/ContentDTO";


@Injectable({ providedIn: 'root' })
export class ContentService {
  private baseUrl = `${environment.apiBaseUrl}/cursos`;

  constructor(private http: HttpClient) {}

  getContents(courseId: number, sectionId: number): Observable<ContentDTO[]> {
    return this.http.get<ContentDTO[]>(
      `${this.baseUrl}/${courseId}/secoes/${sectionId}/conteudos`
    );
  }

  getContentById(courseId: number, sectionId: number, contentId: number): Observable<ContentDTO> {
    return this.http.get<ContentDTO>(
      `${this.baseUrl}/${courseId}/secoes/${sectionId}/conteudos/${contentId}`
    );
  }

  updateContent(
    courseId: number,
    sectionId: number,
    contentId: number,
    content: ContentDTO
  ): Observable<ContentDTO> {
    const payload = {
      title: content.title,
      description: content.description,
      contentType: content.contentType,
      fileUrl: content.fileUrl,
      fileName: content.fileName,
    };
    return this.http.put<ContentDTO>(
      `${this.baseUrl}/${courseId}/secoes/${sectionId}/conteudos/${contentId}`,
      payload
    );
  }

  getFileType(fileName: string): Observable<{ contentType: string }> {
    return this.http.get<{ contentType: string }>(
      `${environment.apiBaseUrl}/cursos/secoes/conteudos/type/${fileName}`
    );
  }

  deleteContent(courseId: number, sectionId: number, contentId: number): Observable<void> {
    const url = `${this.baseUrl}/${courseId}/secoes/${sectionId}/conteudos/${contentId}`;
    return this.http.delete<void>(url);
  }

  uploadContent(
    courseId: number,
    sectionId: number,
    file: File,
    contentData: ContentDTO
  ): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', contentData.title);
    formData.append('description', contentData.description);
    formData.append('contentType', contentData.contentType);

    return this.http.post(
      `${this.baseUrl}/${courseId}/secoes/${sectionId}/conteudos/upload`,
      formData,
      { responseType: 'text' }
    );
  }
}
