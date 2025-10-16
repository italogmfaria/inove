import { Injectable } from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class InstructorService {

  private baseUrl = `${environment.apiBaseUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  createInstructor(instructorData: any): Observable<string> {
    const url = `${this.baseUrl}/instrutor`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post(url, instructorData, { headers, responseType: 'text' });
  }

}
