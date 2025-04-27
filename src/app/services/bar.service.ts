import { Injectable } from '@angular/core';
import {HttpsService} from './https.service';
import {environment} from '../../environments/environment';
import {Observable, Subscription} from 'rxjs';
import {Bar} from '../data/bar.data';
import {BarStatistics} from '../data/bar-statistics.data';

@Injectable({
  providedIn: 'root'
})
export class BarService {
  constructor(private http: HttpsService) { }

  public getBarById(barId: string): Observable<Bar> {
    let endpoint = `${environment.endpoints.getBarById}?id=${barId}`;
    return this.http.callGCloudRunGetRequest(endpoint);
  }

  public getBarStatistics(barId: string): Observable<BarStatistics> {
    let endpoint = `${environment.endpoints.getBarStatistics}?id=${barId}`;
    return this.http.callGCloudRunGetRequest(endpoint);
  }

  public getBarsByLoc(lat: number, lng: number): Observable<Bar[]> {
    let endpoint = `${environment.endpoints.getBarsByLocation}?lat=${lat}&lng=${lng}`;
    console.log(endpoint);
    return this.http.callGCloudRunGetRequest(endpoint);
  }

  public updateBarHours(bar: Bar): Subscription {
    let endpoint = environment.endpoints.postUpdateBar;
    return this.http.callGCloudRunPostRequest(endpoint, bar).subscribe(() => {});
  }
}
