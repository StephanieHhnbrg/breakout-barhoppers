import { Injectable } from '@angular/core';
import {Observable, Subject, Subscription} from 'rxjs';
import {UserService} from './user.service';
import {HttpsService} from './https.service';
import {environment} from '../../environments/environment';
import {WalletService} from './wallet.service';
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
            private walletService: WalletService,
            private http: HttpsService) { }

  public verifyGoogleToken(token: string): Subscription {
    let endpoint = environment.endpoints.postSignUp;
    let obs = this.http.callGCloudRunPostRequest(endpoint, { token });
    return this.handleSuccessfulLogin(obs);
  }

  public startGoogleOAuthFlow() {
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
    let endpoint = environment.endpoints.postSignUp;
    let obs = this.http.callGCloudRunPostRequest(endpoint, { code });
    this.handleSuccessfulLogin(obs);
  }

  private handleSuccessfulLogin(obs: Observable<SignupResponse>): Subscription {
    return obs.subscribe({
        next: (response: SignupResponse) => {
          localStorage.setItem('userId', response.mail);
          localStorage.setItem('walletAddress', response.walletAddress);
          localStorage.setItem('token', response.accessToken);
          this.userService.setUser({mail: response.mail, name: response.name, barId: response.barId});
          this.walletService.connectWallet(response.walletAddress);
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
    this.walletService.disconnectWallet();
  }

  public getLoginStatusObservable(): Observable<boolean> {
    return this.loginStatusChanged$.asObservable();
  }

  isLoggedIn(): boolean {
    return this.userService.isUserDefined();
  }

}
