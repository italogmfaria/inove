import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserDTO } from '../dto/UserDTO';
import { environment } from '../../../environments/environment';
import { UserRole } from '../dto/UserRole';

@Injectable({ providedIn: 'root' })
export class UserService {
  private baseUrl = `${environment.apiBaseUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  getUsers(): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(this.baseUrl);
  }

  getInstructors(): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(`${this.baseUrl}/instrutor`);
  }

  addUser(user: UserDTO): Observable<void> {
    let endpoint: string;

    if (['ADMINISTRATOR', 'INSTRUCTOR'].includes(user.role)) {
      endpoint = `${this.baseUrl}/admin`;
    } else if (user.role === 'STUDENT') {
      endpoint = `${this.baseUrl}/discente`;
    } else {
      throw new Error('Papel do usuário inválido');
    }

    return this.http.post<void>(endpoint, user);
  }

  getUserById(userId: number): Observable<UserDTO> {
    return this.http.get<UserDTO>(`${this.baseUrl}/${userId}`);
  }

  getUserCourses(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${userId}/cursos`);
  }

  removeUserCourse(userId: number, courseId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${userId}/cursos/${courseId}`);
  }

  updateUser(user: { id: number; name: string; email: string; cpf: string }): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${user.id}`, user);
  }

  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${userId}`);
  }
}
