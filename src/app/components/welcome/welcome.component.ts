import {Component, OnDestroy, OnInit} from '@angular/core';
import {ToolbarComponent} from '../toolbar/toolbar.component';
import {MatIconModule} from '@angular/material/icon';
import {Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {WalletService} from '../../services/wallet.service';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [
    MatIconModule,
    ToolbarComponent
  ],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css'
})
export class WelcomeComponent implements OnInit, OnDestroy {

  public tokens: number = 0;
  private subscriptions: Subscription[] = [];


  constructor(private router: Router,
              private walletService: WalletService) {}

  public ngOnInit() {
    this.subscriptions.push(this.walletService.getTokensUpdatedObservable().subscribe(t => {this.tokens = t}));
    this.subscriptions.push(this.walletService.getNumberOfTokens().subscribe(t => {this.tokens = t}));
  }

  public routeTo(url: string) {
    this.router.navigate([url], {});
  }

  public ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

}
