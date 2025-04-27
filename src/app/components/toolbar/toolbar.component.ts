import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {AuthenticationService} from '../../services/authentication.service';
import {GLoginButtonComponent} from '../glogin-button/glogin-button.component';
import {CommonModule} from '@angular/common';
import {Subscription} from 'rxjs';
import {MatDialog} from '@angular/material/dialog';
import {
  BarQrCodeScannerDialogComponent
} from '../../dialogs/bar-qr-code-scanner-dialog/bar-qr-code-scanner-dialog.component';
import {UserService} from '../../services/user.service';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    GLoginButtonComponent,
  ],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.css'
})
export class ToolbarComponent implements OnInit, OnDestroy {

  public isLoggedIn = false;
  private subscriptions: Subscription[] = [];

  constructor(private router: Router,
              private userService: UserService,
              private dialog: MatDialog,
              private auth: AuthenticationService) {}

  public ngOnInit() {
    this.isLoggedIn = this.auth.isLoggedIn();
    this.subscriptions.push(this.auth.getLoginStatusObservable().subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
    }))
  }

  public isBarkeeper(): boolean {
    return this.userService.isUserLinkedToBar();
  }

  public routeTo(url: string) {
    this.router.navigate([url], {});
  }

  public openQrCodeScanner() {
    this.routeTo('/welcome');
    this.dialog.open(BarQrCodeScannerDialogComponent, {
      autoFocus: false
    });
  }

  public ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
