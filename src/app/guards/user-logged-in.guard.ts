import {CanActivate, Router} from '@angular/router';
import {Injectable} from '@angular/core';
import {UserService} from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class UserLoggedInGuard implements CanActivate {
  constructor(private userService: UserService, private router: Router) {}
  canActivate(): boolean {
    if (this.userService.isUserDefined()) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
