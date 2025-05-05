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
    var ua = navigator.userAgent;
    return !/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(ua);
  }

  public ngOnDestroy() {
    this.auth.logOut();
  }
}
