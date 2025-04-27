import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarQrCodeScannerDialogComponent } from './bar-qr-code-scanner-dialog.component';

describe('BarQrCodeScannerDialogComponent', () => {
  let component: BarQrCodeScannerDialogComponent;
  let fixture: ComponentFixture<BarQrCodeScannerDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarQrCodeScannerDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BarQrCodeScannerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
