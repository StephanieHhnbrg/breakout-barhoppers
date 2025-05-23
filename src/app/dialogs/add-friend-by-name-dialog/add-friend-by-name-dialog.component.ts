import {Component, OnInit} from '@angular/core';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {User} from '../../data/user.data';
import {UserService} from '../../services/user.service';
import {Router} from '@angular/router';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-add-friend-by-name-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './add-friend-by-name-dialog.component.html',
  styleUrl: './add-friend-by-name-dialog.component.css'
})
export class AddFriendByNameDialogComponent implements OnInit {

  public currentUser: User | undefined;

  constructor(public dialogRef: MatDialogRef<AddFriendByNameDialogComponent>,
              private userService: UserService,
              private router: Router) {}

  ngOnInit() {
    this.currentUser = this.userService.getCurrentUser();
    if (this.currentUser == undefined) {
      this.router.navigate(['/'], {});
      this.dialogRef.close();
    }
  }

  public addFriend(name: string) {
    if (name.length > 0) {
      let data = {name, mail: ''};
      this.userService.addFriend(data);
      this.dialogRef.close();
    }
  }

}
