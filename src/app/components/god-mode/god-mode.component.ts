import {Component, OnDestroy, OnInit} from '@angular/core';
import {WalletService} from '../../services/wallet.service';
import {Subscription} from 'rxjs';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {ToolbarComponent} from '../toolbar/toolbar.component';
import {MatButtonModule} from '@angular/material/button';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-god-mode',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    ToolbarComponent,
  ],
  templateUrl: './god-mode.component.html',
  styleUrl: './god-mode.component.css'
})
export class GodModeComponent implements OnInit, OnDestroy {

  public tokens: number = 0;
  public nfts: {name: string, uri: string}[] = [];
  public isWalletConnected = false;
  public balance = 0;

  private subscriptions: Subscription[] = [];

  constructor(private walletService: WalletService,
              public snackbar: MatSnackBar) {}

  public ngOnInit() {
    this.walletService.getPayerAccountBalance().then(b => { this.balance = b; })
    this.subscriptions.push(this.walletService.getTokensUpdatedObservable().subscribe(t => { this.tokens = t;}));
    this.subscriptions.push(this.walletService.getNftAddedObservable().subscribe(nft => { this.nfts.push(nft); }));
    this.subscriptions.push(this.walletService.getWalletConnectedObservable().subscribe(connected => {
      this.isWalletConnected = connected;
      if (connected) {
        this.fetchNfts();
        this.walletService.getPayerAccountBalance().then(b => { this.balance = b; })
        this.walletService.fetchTokenAccountsByOwner();
        // this.walletService.setMintAddress();
      }
    }));
  }

  private fetchNfts() {
    this.walletService.fetchNFTsByOwner().then(nfts => {
      this.nfts = nfts;
    });
  }

  public addTokens() {
    this.walletService.addTokens().then(() => {
      this.walletService.fetchTokenAccountsByOwner();
      this.snackbar.open(`Congrats! You earned 10 tokens!`, '💎',
        { duration: 3000});
    });
  }

  public mintBarNFT() {
    this.walletService.createBarNft().then(() => {
      this.fetchNfts();
      this.snackbar.open("Congrats! You earned the Pub Pioneer NFT!", '🎉',
        { duration: 3000});
    });
  }

  public mintFriendNFT() {
    this.walletService.createFriendsNft().then(() => {
      this.fetchNfts();
      this.snackbar.open("Congrats! You earned the Social Butterfly NFT!", '🦋',
        { duration: 3000});
    });
  }

  public mintQuestNFT() {
    this.walletService.createQuestNft().then(() => {
      this.fetchNfts();
      this.snackbar.open("Congrats! You earned the Quest Explorer NFT!", '🎊',
        { duration: 3000});
    });
  }

  public ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
