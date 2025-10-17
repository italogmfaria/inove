import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RecoveryCodeDTO {
  email: string;
  code: string;
}

export interface PasswordResetDTO {
  email: string;
  code: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class PasswordRecoveryService {

  private baseUrl = `${environment.apiBaseUrl}/auth`;

  constructor(private http: HttpClient) {}

  requestRecoveryCode(email: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/forgot-password/${email}`, null);
  }

  verifyRecoveryCode(email: string, code: string): Observable<void> {
    const body: RecoveryCodeDTO = { email, code };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post<void>(`${this.baseUrl}/verify-code`, body, { headers });
  }

  resetPassword(email: string, code: string, password: string): Observable<any> {
    const body: PasswordResetDTO = { email, code, password };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post<any>(`${this.baseUrl}/reset-password`, body, { headers });
  }
}

