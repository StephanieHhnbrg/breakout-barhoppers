import {Component, OnInit, OnDestroy} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {AuthenticationService} from './services/authentication.service';
import {CommonModule} from '@angular/common';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import {Subscription} from 'rxjs';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {

  public isMobile = false;
  private subscriptions: Subscription[] = [];
  constructor(private auth: AuthenticationService,
              private breakpointObserver: BreakpointObserver) {}



  public ngOnInit() {
    this.subscriptions.push(this.breakpointObserver.observe([Breakpoints.Handset])
      .subscribe(result => {
        this.isMobile = result.matches;
      }));
  }

  public ngOnDestroy() {
    this.auth.logOut();
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
