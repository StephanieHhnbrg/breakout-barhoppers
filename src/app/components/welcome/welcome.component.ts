import {Component, OnDestroy, OnInit} from '@angular/core';
import {ToolbarComponent} from '../toolbar/toolbar.component';
import {MatIconModule} from '@angular/material/icon';
import {Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {WalletService} from '../../services/wallet.service';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    ToolbarComponent
  ],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css'
})
export class WelcomeComponent implements OnInit, OnDestroy {

  public tokens: number = 0;

  public readonly VOUCHER_TOKENS = 50;
  public nfts = [
    { url: 'https://raw.githubusercontent.com/StephanieHhnbrg/breakout-barhoppers/refs/heads/main/src/assets/nft_bars.png'},
    { url: 'https://raw.githubusercontent.com/StephanieHhnbrg/breakout-barhoppers/refs/heads/main/src/assets/nft_friends.png'},
    { url: 'https://raw.githubusercontent.com/StephanieHhnbrg/breakout-barhoppers/refs/heads/main/src/assets/nft_quests.png'},
  ]
  private subscriptions: Subscription[] = [];


  constructor(private router: Router,
              private walletService: WalletService) {}

  public ngOnInit() {
    this.subscriptions.push(this.walletService.getTokensUpdatedObservable().subscribe(t => {this.tokens = t}));
    this.subscriptions.push(this.walletService.getWalletConnectedObservable().subscribe(connected => {
      if (connected) {
        this.walletService.fetchNFTsByOwner().then(nfts => {
          console.log(nfts); // TODO:
        })
        this.walletService.fetchTokenAccountsByOwner();
      }
    }));
  }

  public routeTo(url: string) {
    this.router.navigate([url], {});
  }

  public ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

}
