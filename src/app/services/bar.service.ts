import { Injectable } from '@angular/core';
import {HttpsService} from './https.service';
import {environment} from '../../environments/environment';
import {Observable, Subject, Subscription} from 'rxjs';
import {Bar} from '../data/bar.data';
import {BarStatistics} from '../data/bar-statistics.data';
import {Quest} from '../data/quest.data';

@Injectable({
  providedIn: 'root'
})
export class BarService {

  private newQuestAdded$ = new Subject<Quest>();
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
    return this.http.callGCloudRunGetRequest(endpoint);
  }

  public updateBarHours(bar: Bar): Subscription {
    let endpoint = environment.endpoints.postUpdateBar;
    return this.http.callGCloudRunPostRequest(endpoint, bar).subscribe(() => {});
  }

  public addQuest(quest: Quest): Subscription {
    this.newQuestAdded$.next(quest);
    let endpoint = environment.endpoints.postUpdateBar;
    return this.http.callGCloudRunPostRequest(endpoint, quest).subscribe(() => {});
  }

  public getQuestAddedObservable(): Observable<Quest> {
    return this.newQuestAdded$.asObservable();
  }
}
