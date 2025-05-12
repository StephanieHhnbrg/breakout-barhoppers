import { Injectable } from '@angular/core';
import {HttpsService} from './https.service';
import {environment} from '../../environments/environment';
import {Observable, Subject} from 'rxjs';
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

  public updateBarHours(bar: Bar) {
    let endpoint = environment.endpoints.postUpdateBar;
    this.http.callGCloudRunPostRequest(endpoint, bar);
  }

  public addQuest(quest: Quest) {
    this.newQuestAdded$.next(quest);
    let endpoint = environment.endpoints.postCreateQuest;
    this.http.callGCloudRunPostRequest(endpoint, quest);
  }

  public getQuestAddedObservable(): Observable<Quest> {
    return this.newQuestAdded$.asObservable();
  }
}
