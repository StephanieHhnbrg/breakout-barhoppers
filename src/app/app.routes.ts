import { Routes } from '@angular/router';
import {LoginComponent} from './components/login/login.component';
import {BarkeeperAdminComponent} from './components/barkeeper-admin/barkeeper-admin.component';
import {MapComponent} from './components/map/map.component';
import {WelcomeComponent} from './components/welcome/welcome.component';
import {FriendsListComponent} from './components/friends-list/friends-list.component';
import {UserLoggedInGuard} from './guards/user-logged-in.guard';
import {BarkeeperGuard} from './guards/barkeeper.guard';
import {GodModeComponent} from './components/god-mode/god-mode.component';
import {GodModeEnabledGuard} from './guards/god-mod-enabled.guard';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  { path: 'welcome', component: WelcomeComponent, canActivate: [UserLoggedInGuard] },
  { path: 'friends', component: FriendsListComponent, canActivate: [UserLoggedInGuard] },
  { path: 'map', component: MapComponent },
  { path: 'bar', component: BarkeeperAdminComponent, canActivate: [BarkeeperGuard]},
  { path: 'god', component: GodModeComponent, canActivate: [GodModeEnabledGuard]},
];
