import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GLoginButtonComponent } from './glogin-button.component';

describe('GLoginButtonComponent', () => {
  let component: GLoginButtonComponent;
  let fixture: ComponentFixture<GLoginButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GLoginButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GLoginButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
