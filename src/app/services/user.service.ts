import { Injectable } from '@angular/core';
import {HttpsService} from './https.service';
import {Observable, Subject, Subscription} from 'rxjs';
import {environment} from '../../environments/environment';
import {Friend, User} from '../data/user.data';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private user: User | undefined;
  private friends: Friend[] = [];

  private newFriendRequest$ = new Subject<Friend>();
  private getFriendsOfUser$ = new Subject<Friend[]>();

  constructor(private http: HttpsService) { }

  public setUser(user: User | undefined) {
    this.user = user;
  }

  public getCurrentUser(): User | undefined {
    return this.user;
  }

  public isUserDefined(): boolean {
    return this.user != undefined;
  }

  public isUserLinkedToBar(): boolean {
    return (this.user == undefined) ? false : (this.user!.barId != undefined && this.user!.barId!.length > 0);
  }

  public addFriend(newFriend: User): Subscription {
    let endpoint = environment.endpoints.postCreateFriendRequest;
    let payload = {
      sender: this.user,
      recipient: newFriend,
    }

    if (newFriend && ((newFriend.mail.length == 0 && !this.friends.find(f => f.name == newFriend.name)) || !this.friends.find(f => f.mail == newFriend.mail))) {
      return this.http.callGCloudRunPostRequest(endpoint, payload).subscribe(() => {
        this.newFriendRequest$.next({name: newFriend.name, mail: newFriend.mail, status: "pending"});
      });
    }
    return new Subscription();
  }

  public getFriendRequestObservable(): Observable<Friend> {
    return this.newFriendRequest$.asObservable();
  }

  public checkInToBarQuest(bar: {id: string, name: string }, quest?: {id: string, name: string }): Observable<string> {
    let endpoint = environment.endpoints.postCreateBarCheckInEvent;
    let payload = { user: this.user!.mail, bar: bar.id, quest : quest ? quest!.id : "" }
    return this.http.callGCloudRunPostRequest(endpoint, payload);
  }

  public acceptFriend(newFriend: User, accepted: boolean) {
    let endpoint = environment.endpoints.postUpdateFriendRequest;
    let payload = {
      sender: newFriend,
      recipient: this.user,
      accepted: accepted,
    }
    return this.http.callGCloudRunPostRequest(endpoint, payload);
  }

  public triggerFriendsOfUserRequest(): Subscription {
    if (this.user) {
      let endpoint = `${environment.endpoints.getFriendsOfUser}?user=${this.user!.mail}`;
      return this.http.callGCloudRunGetRequest(endpoint).subscribe(friends => {
        this.friends = friends;
        this.getFriendsOfUser$.next(friends);
      });
    }
    return new Subscription();
  }

  public getFriendsOfUserObservable(): Observable<Friend[]> {
    return this.getFriendsOfUser$.asObservable();
  }
}
