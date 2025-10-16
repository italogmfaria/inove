import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SectionDTO } from '../dto/SectionDTO';

@Injectable({ providedIn: 'root' })
export class SectionService {
  private baseUrl = `${environment.apiBaseUrl}/cursos`;

  constructor(private http: HttpClient) {}

  getSections(courseId: number): Observable<SectionDTO[]> {
    return this.http.get<SectionDTO[]>(`${this.baseUrl}/${courseId}/secoes`);
  }

  getSectionById(courseId: number, sectionId: number): Observable<SectionDTO> {
    return this.http.get<SectionDTO>(`${this.baseUrl}/${courseId}/secoes/${sectionId}`);
  }

  createSection(courseId: number, section: SectionDTO): Observable<SectionDTO> {
    return this.http.post<SectionDTO>(`${this.baseUrl}/${courseId}/secoes`, section);
  }

  updateSection(courseId: number, sectionId: number, section: SectionDTO): Observable<SectionDTO> {
    return this.http.put<SectionDTO>(`${this.baseUrl}/${courseId}/secoes/${sectionId}`, section);
  }

  deleteSection(courseId: number, sectionId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${courseId}/secoes/${sectionId}`);
  }
}
