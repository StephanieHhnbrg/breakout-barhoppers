import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditBarHoursDialogComponent } from './edit-bar-hours-dialog.component';

describe('EditBarHoursDialogComponent', () => {
  let component: EditBarHoursDialogComponent;
  let fixture: ComponentFixture<EditBarHoursDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditBarHoursDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditBarHoursDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
