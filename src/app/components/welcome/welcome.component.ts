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
  public nfts: {name: string, uri: string}[] = []
  private subscriptions: Subscription[] = [];


  constructor(private router: Router,
              private walletService: WalletService) {}

  public ngOnInit() {
    this.subscriptions.push(this.walletService.getTokensUpdatedObservable().subscribe(t => { this.tokens = t; }));
    this.subscriptions.push(this.walletService.getNftAddedObservable().subscribe(nft => { this.nfts.push(nft); }));
    this.subscriptions.push(this.walletService.getWalletConnectedObservable().subscribe(connected => {
      if (connected) {
        this.walletService.fetchNFTsByOwner().then(nfts => {
          this.nfts = nfts;
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
