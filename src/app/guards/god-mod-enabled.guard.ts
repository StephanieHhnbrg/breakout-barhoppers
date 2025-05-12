import {CanActivate, Router} from '@angular/router';
import {Injectable} from '@angular/core';
import {UserService} from '../services/user.service';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GodModeEnabledGuard implements CanActivate {
  constructor(private userService: UserService, private router: Router) {}
  canActivate(): boolean {
    if (environment.isGodModeEnabled && this.userService.isUserDefined()) {
      return true;
    }

    let route = this.userService.isUserDefined() ? '/welcome' : '/login';
    this.router.navigate([route]);
    return false;
  }
}
