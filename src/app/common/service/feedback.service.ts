import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FeedBackDTO } from '../dto/FeedBackDTO';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private apiUrl = `${environment.apiBaseUrl}/feedbacks`;

  constructor(private http: HttpClient) {}

  getFeedbacksByCourse(courseId: number): Observable<FeedBackDTO[]> {
    const headers = new HttpHeaders({
      'ngrok-skip-browser-warning': 'true'
    });
    return this.http.get<FeedBackDTO[]>(`${this.apiUrl}/course/${courseId}`, { headers });
  }

  addFeedback(userId: number, courseId: number, comment: string): Observable<FeedBackDTO> {
    return this.http.post<FeedBackDTO>(`${this.apiUrl}?userId=${userId}&courseId=${courseId}`, comment, {
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      }
    });
  }

  updateFeedback(feedbackId: number, userId: number, newComment: string): Observable<FeedBackDTO> {
    return this.http.put<FeedBackDTO>(`${this.apiUrl}/${feedbackId}?userId=${userId}`, newComment, {
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      }
    });
  }

  deleteFeedback(feedbackId: number, userId: number): Observable<void> {
    const headers = new HttpHeaders({
      'ngrok-skip-browser-warning': 'true'
    });
    return this.http.delete<void>(`${this.apiUrl}/${feedbackId}?userId=${userId}`, { headers });
  }
}
