import {Component, OnDestroy} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {AuthenticationService} from './services/authentication.service';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnDestroy {

  constructor(private auth: AuthenticationService) {}

  public isBigScreen() {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.innerWidth >= 420;
  }

  public ngOnDestroy() {
    this.auth.logOut();
  }
}
