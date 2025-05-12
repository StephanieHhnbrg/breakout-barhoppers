import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GodModeComponent } from './god-mode.component';

describe('GodModeComponent', () => {
  let component: GodModeComponent;
  let fixture: ComponentFixture<GodModeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GodModeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GodModeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
