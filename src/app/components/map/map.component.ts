import {Component, OnDestroy, OnInit} from '@angular/core';
import {DivIcon, divIcon, latLng, LatLng, MapOptions, tileLayer} from "leaflet";
import {icon, Marker, marker, circleMarker, CircleMarker} from "leaflet";
import {LeafletModule} from '@asymmetrik/ngx-leaflet';
import {ToolbarComponent} from '../toolbar/toolbar.component';
import {BarService} from '../../services/bar.service';
import {Subscription} from 'rxjs';
import {Bar} from '../../data/bar.data';
import {getHoursString} from '../../utils/hours-formatting.utils';
import {UserService} from '../../services/user.service';
import {AuthenticationService} from '../../services/authentication.service';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [
    LeafletModule,
    ToolbarComponent,
  ],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent implements OnInit, OnDestroy {

  private tileLayer =
    tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {});

  public layers: any[] = [];
  public mapOptions: MapOptions = {};
  public isLayerInitLoading: boolean = true;
  public currentPos: LatLng = latLng(51.51494000, 7.4660000); // Dortmund, Germany

  private subscriptions: Subscription[] = [];
  constructor(private barService: BarService,
              private auth: AuthenticationService,
              private userService: UserService) {}
  ngOnInit() {
    this.requestUsersPosition();
  }

  private initMap(latLng: LatLng) {
    this.mapOptions = {
      layers: [],
      zoom: 11,
      center: latLng
    };
  }

  private requestUsersPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        // this.currentPos = new LatLng(position.coords.latitude, position.coords.longitude);
        this.initMap(this.currentPos);
        this.drawMapLayers();
      });
    } else {
      this.initMap(this.currentPos);
      this.drawMapLayers();
    }
  }

  private drawMapLayers() {
    this.layers = [];
    this.layers.push(this.tileLayer);
    if (this.currentPos) {
      this.layers.push(this.createLocationMarker(this.currentPos));
      this.subscriptions.push(
        this.barService.getBarsByLoc(this.currentPos.lat, this.currentPos.lng).subscribe(bars => {
          bars.forEach(b => this.layers.push(this.createBarMarker(b)));
      }));

      this.subscriptions.push(
          this.auth.getLoginStatusObservable().subscribe(isLoggedIn => {
          if (isLoggedIn) {
            this.subscriptions.push(
              this.userService.getFriendsLocations().subscribe(friends => {
                friends.forEach(f => this.layers.push(this.createAvatarMarker(f.picture, f.lat, f.lng, f.name)));
              }));
          }
      }));

    }

    this.isLayerInitLoading = false;
  }

  private createLocationMarker(latLng: LatLng): CircleMarker {
    let result = circleMarker(latLng,
      {
        radius: 5,
        color: "blue",
        weight: 1,
        fill: true,
        fillColor: "blue",
        fillOpacity: 1,
      });
    result.bindTooltip("<b> You are here.</b>");
    return result;
  }

  private createBarMarker(bar: Bar): Marker {
    let iconUrl = bar.status == 'crawled' ? 'assets/liquor_orange.png' : 'assets/liquor_purple.png';
    let result = marker(latLng(bar.lat, bar.lng), {
      icon: icon({
        iconSize: [25, 25],
        iconAnchor: [12, 12],
        tooltipAnchor: [20, 0],
        iconUrl: iconUrl
      })
    });
    let tooltip = `<b>${bar.name}</b><br />`;
    tooltip += `Opening Hours <br /> `+getHoursString(bar.openingHours)+'<br /> ';
    tooltip += `Happy Hours <br />`+getHoursString(bar.happyHours);
    // TODO: quests
    result.bindTooltip(tooltip);
    return result;
  }

  private createAvatarMarker(url: string, lat: number, lng: number, tooltip: string): Marker {
    const html = `<div style="
      width: 20px;
      height: 20px;
      background-image: url('${url}');
      background-size: cover;
      border: 1px solid black;
      border-radius: 50%;
    "></div>`;

    let avatarIcon: DivIcon = divIcon({
      html,
      className: '',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      tooltipAnchor: [20, 0]
    });
    let offset = 0.0001; // TODO: improve offset, for several friends at one bar
    let result = marker(latLng(lat + offset, lng + offset), { icon: avatarIcon });
    result.bindTooltip(tooltip);
    return result;
  }



  public ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

}
