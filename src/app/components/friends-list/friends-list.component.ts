import {Component, OnDestroy, OnInit} from '@angular/core';
import {ToolbarComponent} from "../toolbar/toolbar.component";
import {Subscription} from 'rxjs';
import {UserService} from '../../services/user.service';
import {Friend} from '../../data/user.data';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatSnackBar} from '@angular/material/snack-bar';
import {FriendQrCodeScannerComponent} from '../../dialogs/friend-qr-code-scanner-dialog/friend-qr-code-scanner.component';
import {MatDialog} from '@angular/material/dialog';
import {
  AddFriendByNameDialogComponent
} from '../../dialogs/add-friend-by-name-dialog/add-friend-by-name-dialog.component';

@Component({
  selector: 'app-friends-list',
  standalone: true,
    imports: [
        CommonModule,
        MatIconModule,
        MatButtonModule,
        ToolbarComponent,
        FriendQrCodeScannerComponent,
        AddFriendByNameDialogComponent
    ],
  templateUrl: './friends-list.component.html',
  styleUrl: './friends-list.component.css'
})
export class FriendsListComponent implements OnInit, OnDestroy {

  public friends: Friend[] = [];
  private subscriptions: Subscription[] = [];

  constructor(private userService: UserService,
              private dialog: MatDialog,
              public snackbar: MatSnackBar) {}
  public ngOnInit() {
    this.subscriptions.push(this.userService.getFriendsOfUserObservable().subscribe(
        friends => { this.friends = friends; }));
    this.subscriptions.push(this.userService.triggerFriendsOfUserRequest());
    this.handleFriendRequests();
  }

  public shareInvitationLink() {
    const shareText = "Let's go on a barhopping journey!";
    const shareLink = 'https://stephaniehhnbrg.github.io/breakout-barhoppers/join?ref=invite';
    const fullShareContent = `${shareText} ${shareLink}`;

    navigator.clipboard.writeText(fullShareContent)
      .then(() => {
        if (navigator.share) {
          navigator.share({
            title: 'Invitation',
            text: shareText,
            url: shareLink
          })
            .then(() => {})
            .catch(error => {
              console.error('Error sharing:', error);
              this.snackbar.open("Invitation link copied! You can share it with your friends");
            });
        } else {
          this.snackbar.open("Invitation link copied! You can share it with your friends");

        }
      })
      .catch(error => {
        console.error('Failed to copy:', error);
      });
  }

  public openQrCodeModal() {
    this.dialog.open(FriendQrCodeScannerComponent, {
      autoFocus: false
    });
  }

  public openAddFriendByUsernameModal() {
    this.dialog.open(AddFriendByNameDialogComponent, {
      autoFocus: false
    });
  }

  private handleFriendRequests() {
    this.subscriptions.push(this.userService.getFriendRequestObservable()
      .subscribe((newFriend: Friend) => {
        if (newFriend && (newFriend.mail.length == 0 || !this.friends.find(f => f.mail == newFriend.mail))) {
          this.friends.push(newFriend);
        }
    }));
  }

  public acceptFriend(friendIndex: number, accepted: boolean) {
    this.userService.acceptFriend(this.friends[friendIndex], accepted);
    if (accepted) {
      this.friends[friendIndex].status = '';
    } else {
      this.friends.splice(friendIndex, 1);
    }

  }
  public ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
