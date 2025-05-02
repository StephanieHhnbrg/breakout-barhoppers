import { Injectable } from '@angular/core';
import {HttpsService} from './https.service';
import {environment} from '../../environments/environment';
import {User} from '../data/user.data';

@Injectable({
  providedIn: 'root'
})
export class NftRuleService {

  private stats = {
    friendsAdded: 0,
    barsVisited: 0,
    questFulfilled: 0,
  }
  constructor(private http: HttpsService) {}

  public fetchUserStats(user: User) {
    let endpoint = `${environment.endpoints.getUserStats}?mail=${user.mail}`;
    return this.http.callGCloudRunGetRequest(endpoint).subscribe(stats => {
      this.stats = stats;
    });
  }

  public isEligibleForFriendsNft(newFriendsAdded = 1) {
    this.stats.friendsAdded += newFriendsAdded;
    return this.stats.friendsAdded == 5;
  }

  public isEligibleForQuestNft(newQuestFulfilled = 1) {
    this.stats.questFulfilled += newQuestFulfilled;
    return this.stats.questFulfilled == 3;
  }

  public isEligibleForBarNft(newBarsVisited = 1) {
    this.stats.barsVisited += newBarsVisited;
    return this.stats.barsVisited == 15;
  }
}
