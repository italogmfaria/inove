import { Injectable } from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class InstructorService {

  private baseUrl = `${environment.apiBaseUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  createInstructor(instructorData: any): Observable<string> {
    const url = `${this.baseUrl}/instrutor`;
    return this.http.post(url, instructorData, { responseType: 'text' });
  }

}
