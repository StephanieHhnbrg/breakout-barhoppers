import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FriendQrCodeScannerComponent } from './friend-qr-code-scanner.component';

describe('FriendQrCodeScannerComponent', () => {
  let component: FriendQrCodeScannerComponent;
  let fixture: ComponentFixture<FriendQrCodeScannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FriendQrCodeScannerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FriendQrCodeScannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
