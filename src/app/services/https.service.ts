import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';

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

  public callGCloudRunPostRequest(endpoint: string, payload: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
      })
    };
    return this.http.post<any>(endpoint, JSON.stringify(payload), httpOptions);
  }

}
