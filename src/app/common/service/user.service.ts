import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { UserDTO } from '../dto/UserDTO';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private baseUrl = `${environment.apiBaseUrl}/usuarios`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private createHeaders(): HttpHeaders {
    const token = this.authService.getToken();

    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }


  getUsers(): Observable<UserDTO[]> {
    const headers = this.createHeaders();
    return this.http.get<UserDTO[]>(this.baseUrl, { headers });
  }

  getInstructors(): Observable<UserDTO[]> {
    const headers = this.createHeaders();
    return this.http.get<UserDTO[]>(`${this.baseUrl}/instrutor`, { headers });
  }

  addUser(user: any): Observable<void> {
    const headers = this.createHeaders();
    let endpoint: string;

    // Determinar o endpoint baseado no role
    if (['ADMINISTRATOR', 'INSTRUCTOR'].includes(user.role)) {
        endpoint = `${this.baseUrl}/admin`;
    } else if (user.role === 'STUDENT') {
        endpoint = `${this.baseUrl}/discente`;
    } else {
        throw new Error('Papel do usuário inválido');
    }

    return this.http.post<void>(endpoint, user, { headers });
  }

  getUserById(userId: number): Observable<UserDTO> {
    const headers = this.createHeaders();
    return this.http.get<UserDTO>(`${this.baseUrl}/${userId}`, { headers });
  }

  getUserCourses(userId: number): Observable<any[]> {
    const headers = this.createHeaders();
    const url = `${this.baseUrl}/${userId}/cursos`;

    return this.http.get<any>(url, { headers }).pipe(
      map(response => {
        if (Array.isArray(response)) {
          return response;
        }
        if (response && typeof response === 'object') {
          if (response.courses) return response.courses;
          if (response.cursos) return response.cursos;
          if (response.data) return response.data;
          const keys = Object.keys(response);
          if (keys.length === 1 && Array.isArray(response[keys[0]])) {
            return response[keys[0]];
          }
        }
        return [];
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  removeUserCourse(userId: number, courseId: number): Observable<void> {
    const headers = this.createHeaders();
    return this.http.delete<void>(`${this.baseUrl}/${userId}/cursos/${courseId}`, { headers });
  }

  getUserSchool(userId: number): Observable<any> {
    const headers = this.createHeaders();
    return this.http.get<any>(`${this.baseUrl}/${userId}/school`, { headers });
  }

  updateUser(user: { id: number; name: string; email: string; cpf: string; school?: { id: number } | null }): Observable<void> {
    const headers = this.createHeaders();
    return this.http.put<void>(`${this.baseUrl}/${user.id}`, user, { headers });
  }

    deleteUser(userId: number): Observable<void> {
      const headers = this.createHeaders();
      return this.http.delete<void>(`${this.baseUrl}/${userId}`, { headers });
    }
  }
