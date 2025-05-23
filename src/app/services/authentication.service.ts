import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {UserService} from './user.service';
import {HttpsService} from './https.service';
import {environment} from '../../environments/environment';
import {WalletService} from './wallet.service';
import {NftRuleService} from './nft-rule.service';
import {SignupResponse} from '../data/signup-response.data';
declare const google: any;

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private loginStatusChanged$ = new BehaviorSubject<boolean>(false);
  constructor(private userService: UserService,
            private walletService: WalletService,
            private nftRuleService: NftRuleService,
            private http: HttpsService) { }

  public verifyGoogleToken(token: string): Subscription {
    let endpoint = environment.endpoints.postSignUp;
    let obs = this.http.callGCloudRunPostRequestSignupResponse(endpoint, { token });
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
    let obs = this.http.callGCloudRunPostRequestSignupResponse(endpoint, { code });
    this.handleSuccessfulLogin(obs);
  }

  private handleSuccessfulLogin(obs: Observable<SignupResponse>): Subscription {
    return obs.subscribe({
        next: (response: SignupResponse) => {
          localStorage.setItem('userId', response.mail);
          localStorage.setItem('walletAddress', response.walletAddress);
          localStorage.setItem('token', response.accessToken);
          let user = {mail: response.mail, name: response.name, barId: response.barId};
          this.userService.setUser(user);
          this.nftRuleService.fetchUserStats(user);
          this.walletService.connectWallet(response.walletAddress, response.encryptedPrivateKey, response.firstSignIn);
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
