import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {LoginResponseDTO} from "../dto/LoginResponseDTO";

@Injectable({
  providedIn: 'root',
})
export class LoginService {

  private baseUrl = `${environment.apiBaseUrl}/auth/login`;

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponseDTO> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    const body = { email, password };

    return this.http.post<LoginResponseDTO>(this.baseUrl, body, { headers });
  }
}
