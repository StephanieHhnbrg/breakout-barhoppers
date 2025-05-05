import { Component } from '@angular/core';
import {MatDialogModule} from '@angular/material/dialog';
import {QRCodeComponent} from 'angularx-qrcode';
import {WalletService} from '../../services/wallet.service';

@Component({
  selector: 'app-redeem-voucher-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    QRCodeComponent,
  ],
  templateUrl: './redeem-voucher-dialog.component.html',
  styleUrl: './redeem-voucher-dialog.component.css'
})
export class RedeemVoucherDialogComponent {
  public qrData = '';

  constructor(private walletService: WalletService) {}
  ngOnInit() {
    this.qrData = JSON.stringify({
      barWallet: this.walletService.getWalletAddress(),
      type: 'voucher-redemption'
    });
  }
}
