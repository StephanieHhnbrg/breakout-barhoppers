import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RedeemVoucherDialogComponent } from './redeem-voucher-dialog.component';

describe('RedeemVoucherDialogComponent', () => {
  let component: RedeemVoucherDialogComponent;
  let fixture: ComponentFixture<RedeemVoucherDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RedeemVoucherDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RedeemVoucherDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
