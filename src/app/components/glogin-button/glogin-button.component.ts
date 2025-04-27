import {Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import { Output, EventEmitter } from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {AuthenticationService} from '../../services/authentication.service';
import {SocialLoginModule} from 'angularx-social-login';
import {WalletService} from '../../services/wallet.service';
import {Router} from '@angular/router';
import {environment} from '../../../environments/environment';
import {Subscription} from 'rxjs';
declare const google: any;

@Component({
  selector: 'app-g-login-button',
  standalone: true,
  imports: [
    MatButtonModule,
    SocialLoginModule,
  ],
  templateUrl: './glogin-button.component.html',
  styleUrl: './glogin-button.component.css'
})
export class GLoginButtonComponent implements OnInit, OnDestroy {

  @Output() loggedIn = new EventEmitter<boolean>();
  private subscriptions: Subscription[] = [];

  constructor(private auth: AuthenticationService,
              private walletService: WalletService,
              private router: Router,
              private ngZone: NgZone,
  ) {}

  ngOnInit() {
    this.initGoogleAuthScript();
    this.auth.getLoginStatusObservable().subscribe((loggedIn) => {
      if (loggedIn) {
        this.loggedIn.next(true);
      }
    });
  }

  private initGoogleAuthScript() {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      google.accounts.id.initialize({
        client_id: environment.googleLoginProviderId,
        callback: this.handleCredentialResponse.bind(this),
        auto_select: false,
        cancel_on_tap_outside: true
      });
    };
  }

  private handleCredentialResponse(response: any) {
    this.ngZone.run(() => {
      this.auth.verifyGoogleToken(response.credential);
    });
  }

  public login() {
    google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        this.auth.startGoogleOAuthFlow();
      }
    });
  }

  public ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }


}
