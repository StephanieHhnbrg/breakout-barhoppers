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
              private walletService: WalletService) {
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
              let bar = {name: data.barName, id: data.barId };
              let hasQuestData = Object.hasOwn(data, 'questName') && Object.hasOwn(data, 'questId');
              let quest = hasQuestData ? {name: data.questName, id: data.questId } : undefined;

              // TODO: geolocation service verifying location!
              this.subscriptions.push(this.userService.checkInToBarQuest(bar, quest).subscribe(() => {}));
              this.walletService.addTokens(hasQuestData ? 15: 10);
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
