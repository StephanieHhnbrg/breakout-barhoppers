import { Injectable } from '@angular/core';
import {User} from '../data/user.data';
import {Observable, Subject, Subscription} from 'rxjs';
import {UserService} from './user.service';
import {HttpsService} from './https.service';
import {environment} from '../../environments/environment';
declare const google: any;

interface SignupResponse {
  name: string;
  mail: string;
  barId: string;
  accessToken: string;
  walletAddress: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private loginStatusChanged$ = new Subject<boolean>();
  constructor(private userService: UserService,
            private http: HttpsService) { }

  public verifyGoogleToken(token: string): Subscription {
    console.log('verify token');
    console.log(token);
    let endpoint = environment.endpoints.postSignUp;
    let obs = this.http.callGCloudRunPostRequest(endpoint, { token });
    return this.handleSuccessfulLogin(obs);
  }

  public startGoogleOAuthFlow() {
    console.log('start google auth flow');
    const googleAuthClient = google.accounts.oauth2.initCodeClient({
      client_id: environment.googleLoginProviderId,
      scope: 'email profile',
      ux_mode: 'popup',
      callback: (response: any) => {
        if (response.code) {
          this.exchangeAuthCodeForTokens(response.code);
        }
      }
    });

    googleAuthClient.requestCode();
  }

  private exchangeAuthCodeForTokens(code: string) {
    console.log('exchange code for token');
    console.log(code);

    let endpoint = environment.endpoints.postSignUp;
    let obs = this.http.callGCloudRunPostRequest(endpoint, { code });
    this.handleSuccessfulLogin(obs);
  }

  private handleSuccessfulLogin(obs: Observable<SignupResponse>): Subscription {
    return obs.subscribe({
        next: (response: SignupResponse) => {
          console.log(response);
          localStorage.setItem('userId', response.mail);
          localStorage.setItem('walletAddress', response.walletAddress);
          localStorage.setItem('token', response.accessToken);
          let user: User = {mail: response.mail, name: response.name, barId: response.barId};
          this.userService.setUser(user);
          this.loginStatusChanged$.next(true);
        },
        error: (error) => {
          console.error('Auth code exchange error:', error);
        }
      });
  }


  logOut() {
    this.userService.setUser(undefined);
    this.loginStatusChanged$.next(false);
  }

  public getLoginStatusObservable(): Observable<boolean> {
    return this.loginStatusChanged$.asObservable();
  }

  isLoggedIn(): boolean {
    return this.userService.isUserDefined();
  }

}
