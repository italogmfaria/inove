import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { UserDTO } from '../dto/UserDTO';
import { environment } from '../../../environments/environment';

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
    const url = `${this.baseUrl}/${userId}/cursos`;
    console.log('UserService - Chamando endpoint:', url);
    console.log('UserService - UserId:', userId);

    return this.http.get<any>(url, { headers }).pipe(
      tap(response => {
        console.log('UserService - Resposta recebida:', response);
        console.log('UserService - Tipo da resposta:', typeof response);
        console.log('UserService - É array?', Array.isArray(response));
      }),
      map(response => {
        // Se a resposta for um array, retorna diretamente
        if (Array.isArray(response)) {
          return response;
        }
        // Se a resposta for um objeto com propriedade 'courses' ou similar
        if (response && typeof response === 'object') {
          // Tenta encontrar a propriedade que contém os cursos
          if (response.courses) return response.courses;
          if (response.cursos) return response.cursos;
          if (response.data) return response.data;
          // Se tiver apenas uma propriedade, tenta usá-la
          const keys = Object.keys(response);
          if (keys.length === 1 && Array.isArray(response[keys[0]])) {
            return response[keys[0]];
          }
        }
        // Se nenhuma das condições acima, retorna array vazio
        console.warn('UserService - Formato de resposta inesperado, retornando array vazio');
        return [];
      }),
      catchError(error => {
        console.error('UserService - Erro ao buscar cursos:', error);
        console.error('UserService - Status:', error.status);
        console.error('UserService - Mensagem:', error.message);
        console.error('UserService - URL:', url);
        return throwError(() => error);
      })
    );
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
