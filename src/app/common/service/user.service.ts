import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserDTO } from '../dto/UserDTO';
import { environment } from '../../../environments/environment';
import { UserRole } from '../dto/UserRole';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private baseUrl = `${environment.apiBaseUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  private createHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error("Erro: Token de autenticação não encontrado.");
    }

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

  addUser(user: UserDTO): Observable<void> {
    const headers = this.createHeaders();
    let endpoint: string;

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
    return this.http.get<any[]>(`${this.baseUrl}/${userId}/cursos`, { headers });
  }

  removeUserCourse(userId: number, courseId: number): Observable<void> {
    const headers = this.createHeaders();
    return this.http.delete<void>(`${this.baseUrl}/${userId}/cursos/${courseId}`, { headers });
  }

  updateUser(user: { id: number; name: string; email: string; cpf: string }): Observable<void> {
    const headers = this.createHeaders();
    return this.http.put<void>(`${this.baseUrl}/${user.id}`, user, { headers });
  }

    deleteUser(userId: number): Observable<void> {
      const headers = this.createHeaders();
      return this.http.delete<void>(`${this.baseUrl}/${userId}`, { headers });
    }
  }
