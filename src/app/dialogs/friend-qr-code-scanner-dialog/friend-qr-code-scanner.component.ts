import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatButtonModule} from '@angular/material/button';
import {CommonModule} from '@angular/common';
import {UserService} from '../../services/user.service';
import {Router} from '@angular/router';
import { QRCodeComponent } from 'angularx-qrcode';
import {BrowserMultiFormatReader} from '@zxing/library';
import {FormsModule} from '@angular/forms';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {User} from '../../data/user.data';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-friend-qr-code-scanner',
  standalone: true,
  imports: [
    MatDialogModule,
    CommonModule,
    FormsModule,
    MatButtonToggleModule,
    MatButtonModule,
    QRCodeComponent,
  ],
  templateUrl: './friend-qr-code-scanner.component.html',
  styleUrl: './friend-qr-code-scanner.component.css'
})
export class FriendQrCodeScannerComponent implements OnInit, OnDestroy {
  public view: "display" | "scan" = "display";

  public qrData = '';
  public currentUser: User | undefined;

  @ViewChild('videoElement') videoElement!: ElementRef;
  private codeReader = new BrowserMultiFormatReader();
  private isScanning = false;
  private subscriptions: Subscription[] = [];

  constructor(public dialogRef: MatDialogRef<FriendQrCodeScannerComponent>,
              private userService: UserService,
              private router: Router) {}

  ngOnInit() {
    this.currentUser = this.userService.getCurrentUser();
    if (this.currentUser == undefined) {
      this.router.navigate(['/'], {});
      this.dialogRef.close();
    } else {
      this.qrData = JSON.stringify({
        mail: this.currentUser!.mail,
        username: this.currentUser!.name,
        type: 'friend-request'
      });
    }
  }

  async startScanning() {
    await new Promise((resolve) => setTimeout(resolve, 500));
    this.isScanning = true;
    const videoElem = this.videoElement.nativeElement;

    this.codeReader.decodeFromConstraints(
      { video: { facingMode: 'environment' }}, videoElem,
      (result) => {
        if (result) {
          try {
            const userData = JSON.parse(result.getText());
            if (userData.type === 'friend-request') {
              this.addFriend({name: userData.username, mail: userData.mail});
              this.stopScanning();
            }
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

  private addFriend(data: User) {
    if (this.currentUser!.mail != data.mail) {
      this.subscriptions.push(this.userService.addFriend(data));
    }
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.stopScanning();
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
