import {AfterViewInit, Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';
import {BrowserMultiFormatReader} from '@zxing/library';
import {Subscription} from 'rxjs';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {UserService} from '../../services/user.service';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {QRCodeComponent} from 'angularx-qrcode';
import {WalletService} from '../../services/wallet.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {NftRuleService} from '../../services/nft-rule.service';
import {PublicKey} from '@solana/web3.js';

@Component({
  selector: 'app-bar-qr-code-scanner-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    CommonModule,
    FormsModule,
    MatButtonModule,
    QRCodeComponent,
  ],
  templateUrl: './bar-qr-code-scanner-dialog.component.html',
  styleUrl: './bar-qr-code-scanner-dialog.component.css'
})
export class BarQrCodeScannerDialogComponent  implements AfterViewInit, OnDestroy {

  @ViewChild('videoElement') videoElement!: ElementRef;
  private codeReader = new BrowserMultiFormatReader();
  private isScanning = false;
  private subscriptions: Subscription[] = [];

  constructor(public dialogRef: MatDialogRef<BarQrCodeScannerDialogComponent>,
              private userService: UserService,
              private nftRuleService: NftRuleService,
              private walletService: WalletService,
              public snackbar: MatSnackBar) {
  }

  ngAfterViewInit() {
    this.startScanning();
  }

  async startScanning() {
    this.isScanning = true;
    const videoElem = this.videoElement.nativeElement;

    this.codeReader.decodeFromConstraints(
      {video: {facingMode: 'environment'}}, videoElem,
      (result) => {
        if (result) {
          try {
            const data = JSON.parse(result.getText());
            if (data.type === 'friend-request') {
              let friend = {name: data.username, mail: data.mail};
              this.subscriptions.push(this.userService.addFriend(friend));
            } else if (data.type === 'bar-checkin') {
              // TODO: geolocation service verifying location!

              let bar = {name: data.barName, id: data.barId };
              if (this.nftRuleService.isEligibleForBarNft()) {
                this.walletService.createBarNft();
                this.snackbar.open("Congrats! You earned the Pub Pioneer NFT!", undefined,
                  { duration: 3000});
              }

              let hasQuestData = Object.hasOwn(data, 'questName') && Object.hasOwn(data, 'questId');
              let quest = undefined;
              if (hasQuestData) {
                quest = {name: data.questName, id: data.questId};
                if (this.nftRuleService.isEligibleForQuestNft()) {
                  this.walletService.createQuestNft();
                  this.snackbar.open("Congrats! You earned the Quest Explorer NFT!", undefined,
                    { duration: 3000});
                }
              }

              this.subscriptions.push(this.userService.checkInToBarQuest(bar, quest).subscribe(() => {}));
              this.walletService.addTokens(hasQuestData ? 15: 10);
            } else if (data.type == 'voucher-redemption') {
              try {
                let barWallet = new PublicKey(data.barWallet);
                this.walletService.transferTokens(barWallet);
                // TODO: track in firestore somehow?
                this.snackbar.open("Redemption successful. Enjoy your drink!", undefined, { duration: 10000 });
              } catch (error) {
                this.snackbar.open("Oops! Something did not work. Try again.", undefined, { duration: 10000 });
                console.error(error);
              }
            }
            this.stopScanning();
            this.dialogRef.close();
          } catch (e) {
            console.error('Invalid QR code format:', e);
          }
        }
      }
    );
  }

  stopScanning() {
    if (this.isScanning) {
      this.codeReader.reset();
      this.isScanning = false;
    }
  }

  ngOnDestroy() {
    this.stopScanning();
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
