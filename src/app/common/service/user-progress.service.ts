import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import {CompletedContentMinDTO, CompletedContentResponseDTO} from '../dto/CompletedContentDTO';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserProgressService {

  private baseUrl = `${environment.apiBaseUrl}/cursos`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  markContentAsCompleted(
    courseId: number,
    sectionId: number,
    contentId: number,
    userId: number
  ): Observable<CompletedContentMinDTO> {
    const url = `${this.baseUrl}/${courseId}/secoes/${sectionId}/conteudos/${contentId}/discente/${userId}/progresso`;
    return this.http.post<CompletedContentMinDTO>(url, {}, { headers: this.getHeaders() });
  }

  getUserProgress(courseId: number, userId: number): Observable<CompletedContentResponseDTO> {
    const url = `${this.baseUrl}/${courseId}/discente/${userId}/progresso`;
    return this.http.get<CompletedContentResponseDTO>(url, { headers: this.getHeaders() });
  }

  getCurrentUserProgress(courseId: number): Observable<CompletedContentResponseDTO> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      throw new Error('Usuário não está logado');
    }
    return this.getUserProgress(courseId, userId);
  }

  markContentAsCompletedForCurrentUser(
    courseId: number,
    sectionId: number,
    contentId: number
  ): Observable<CompletedContentMinDTO> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      throw new Error('Usuário não está logado');
    }
    return this.markContentAsCompleted(courseId, sectionId, contentId, userId);
  }

  async isContentCompleted(courseId: number, contentId: number): Promise<boolean> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      return false;
    }

    try {
      const progress = await this.getUserProgress(courseId, userId).toPromise();
      return progress?.completedContents.some(c => c.contentId === contentId) || false;
    } catch (error) {
      console.error('Erro ao verificar conteúdo concluído:', error);
      return false;
    }
  }

  getPercentageAsNumber(progress: CompletedContentResponseDTO): number {
    return Math.round(progress.completePercentage * 100);
  }

  getFormattedPercentage(progress: CompletedContentResponseDTO): string {
    return `${this.getPercentageAsNumber(progress)}%`;
  }

  private getCurrentUserId(): number | null {
    const userId = localStorage.getItem('userId');
    return userId ? parseInt(userId, 10) : null;
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    const headers: any = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return new HttpHeaders(headers);
  }
}

