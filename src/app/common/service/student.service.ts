import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserDTO } from '../dto/UserDTO';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private baseUrl = `${environment.apiBaseUrl}/usuarios/discente`;

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

  registerStudent(studentData: any): Observable<any> {
    const headers = this.createHeaders();
    const transformedData = {
      name: studentData.name,
      email: studentData.email,
      cpf: studentData.cpf,
      password: studentData.password,
      school: {
        id: studentData.schoolId
      },
      role: 'STUDENT'
    };
    return this.http.post(this.baseUrl, transformedData, { headers });
  }

}
