import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../../environments/environment";
import {LoginResponseDTO} from "../dto/LoginResponseDTO";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = `${environment.apiBaseUrl}/auth/login`;

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponseDTO> {
    return this.http.post<LoginResponseDTO>(this.baseUrl, { email, password });
  }

  saveTokens(token: string, refreshToken: string) {
    localStorage.setItem('authToken', token);
    localStorage.setItem('refreshToken', refreshToken);
  }

  saveUserId(userId: number | undefined) {
    if (userId !== undefined && userId !== null) {
      localStorage.setItem('userId', userId.toString());
    } else {
      console.error('Erro: userId está indefinido ou nulo.');
    }
  }
  
  getUserId(): number | null {
    const userId = localStorage.getItem('userId');
    return userId ? parseInt(userId, 10) : null;
  }
  

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
  }

  getRole(): string | null {
    const token = this.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1])); 
        return payload.role; 
      } catch (e) {
        console.error('Erro ao decodificar o token:', e);
        return null;
      }
    }
    return null;
  }
  
}
