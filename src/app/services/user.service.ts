import { Injectable } from '@angular/core';
import {HttpsService} from './https.service';
import {BehaviorSubject, Observable, Subject, Subscription} from 'rxjs';
import {environment} from '../../environments/environment';
import {Friend, User} from '../data/user.data';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private user: User | undefined;
  private friends: Friend[] = [];

  private newFriendRequest$ = new Subject<Friend>();
  private getFriendsOfUser$ = new BehaviorSubject<Friend[]>([]);

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

  public addFriend(newFriend: User) {
    let endpoint = environment.endpoints.postCreateFriendRequest;
    let payload = {senderName: this.user!.name, senderMail: this.user!.mail, recipientName: newFriend.name, recipientMail: newFriend.mail};

    if (newFriend && ((newFriend.mail.length == 0 && !this.friends.find(f => f.name == newFriend.name)) || !this.friends.find(f => f.mail == newFriend.mail))) {
      this.http.callGCloudRunPostRequest(endpoint, payload);
      this.newFriendRequest$.next({name: newFriend.name, mail: newFriend.mail, status: "pending"});
    }
  }

  public getFriendRequestObservable(): Observable<Friend> {
    return this.newFriendRequest$.asObservable();
  }

  public checkInToBarQuest(bar: {id: string, name: string }, quest?: {id: string, name: string }) {
    let endpoint = environment.endpoints.postCreateBarCheckInEvent;
    let payload = { user: this.user!.mail, bar: bar.id, quest : quest ? quest!.id : "" }
    this.http.callGCloudRunPostRequest(endpoint, payload);
  }

  public getFriendsLocations(): Observable<{name: string, picture: string, lat: number, lng: number, barId: string}[]> {
    if (this.user) {
      let endpoint = `${environment.endpoints.getFriendsLocations}?user=${this.user!.mail}`;
      return this.http.callGCloudRunGetRequest(endpoint);
    }
    return new Observable();
  }

  public acceptFriend(newFriend: User, accepted: boolean) {
    let endpoint = environment.endpoints.postUpdateFriendRequest;
    let payload = {
      sender: newFriend,
      recipient: this.user,
      accepted: accepted,
    }
    this.http.callGCloudRunPostRequest(endpoint, payload);
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
