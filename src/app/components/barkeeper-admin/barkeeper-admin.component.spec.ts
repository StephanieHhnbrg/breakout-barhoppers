import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarkeeperAdminComponent } from './barkeeper-admin.component';

describe('BarkeeperAdminComponent', () => {
  let component: BarkeeperAdminComponent;
  let fixture: ComponentFixture<BarkeeperAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarkeeperAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BarkeeperAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
