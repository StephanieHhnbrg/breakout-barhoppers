import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFriendByNameDialogComponent } from './add-friend-by-name-dialog.component';

describe('AddFriendByNameDialogComponent', () => {
  let component: AddFriendByNameDialogComponent;
  let fixture: ComponentFixture<AddFriendByNameDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddFriendByNameDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddFriendByNameDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
