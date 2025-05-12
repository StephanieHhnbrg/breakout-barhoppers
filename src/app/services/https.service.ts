import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SignupResponse} from '../data/signup-response.data';

@Injectable({
  providedIn: 'root'
})
export class HttpsService {

  constructor(private http: HttpClient) { }

  public callGCloudRunGetRequest(endpoint: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
      })
    };
    return this.http.get<any>(endpoint, httpOptions);
  }

  public callGCloudRunPostRequest(endpoint: string, payload: any) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
      })
    };
    this.http.post<JSON>(endpoint, payload, httpOptions).subscribe({
      next: () => {},
      error: (error) => { console.error('POST request error:', error);}
    });
  }

  public callGCloudRunPostRequestSignupResponse(endpoint: string, payload: any): Observable<SignupResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
      })
    };
    return this.http.post<SignupResponse>(endpoint, payload, httpOptions);
  }

}
