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
    return this.http.get<FeedBackDTO[]>(`${this.apiUrl}/course/${courseId}`);
  }

  addFeedback(userId: number, courseId: number, comment: string): Observable<FeedBackDTO> {
    return this.http.post<FeedBackDTO>(`${this.apiUrl}?userId=${userId}&courseId=${courseId}`, comment, {
      headers: {
        'Content-Type': 'text/plain'
      }
    });
  }

  updateFeedback(feedbackId: number, userId: number, newComment: string): Observable<FeedBackDTO> {
    return this.http.put<FeedBackDTO>(`${this.apiUrl}/${feedbackId}?userId=${userId}`, newComment, {
      headers: {
        'Content-Type': 'text/plain'
      }
    });
  }

  deleteFeedback(feedbackId: number, userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${feedbackId}?userId=${userId}`);
  }

  deleteFeedbackByUserAndCourse(userId: number, courseId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/by-user-and-course?userId=${userId}&courseId=${courseId}`);
  }
}
