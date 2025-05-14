import {Component, OnDestroy, OnInit} from '@angular/core';
import {DivIcon, divIcon, latLng, LatLng, MapOptions, tileLayer} from "leaflet";
import {Marker, marker, circleMarker, CircleMarker} from "leaflet";
import {LeafletModule} from '@asymmetrik/ngx-leaflet';
import {ToolbarComponent} from '../toolbar/toolbar.component';
import {BarService} from '../../services/bar.service';
import {Subscription} from 'rxjs';
import {Bar} from '../../data/bar.data';
import {getOpeningHoursString} from '../../utils/hours-formatting.utils';
import {UserService} from '../../services/user.service';
import {AuthenticationService} from '../../services/authentication.service';
import {findActiveQuestIndex} from '../../utils/quest.utils';
import {addAMPMsuffixToHour} from '../../utils/hours-formatting.utils';

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
          bars.forEach(b => {
            let quests = b.quests.map(q => {
              let dates = q.dates ? q.dates.map(d => new Date(d)) : [];
              return  { ...q, dates};
            });
            b = { ...b, quests };
            this.layers.push(this.createBarMarkerWithTooltip(b));
          });
      }));

      this.subscriptions.push(
          this.auth.getLoginStatusObservable().subscribe(isLoggedIn => {
          if (isLoggedIn) {
            this.subscriptions.push(
              this.userService.getFriendsLocations().subscribe((locations: {name: string, picture: string, lat: number, lng: number, barId: string}[]) => {
                const grouped = locations.reduce((acc, item) => {
                  if (!acc[item.barId]) {
                    acc[item.barId] = [];
                  }
                  acc[item.barId].push(item);
                  return acc;
                }, {} as Record<string, {name: string, picture: string, lat: number, lng: number}[]>);

                Object.entries(grouped).forEach(([_, friends]) => {
                  let total = friends.length;
                  friends.forEach((f, index) => this.layers.push(this.createAvatarMarker(f.picture, f.lat, f.lng, f.name, index, total)));
                });

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

  private createBarMarkerWithTooltip(bar: Bar): Marker {
    let tooltip = `<b>${bar.name}</b><br />`;
    tooltip += `Opening Hours <br /> `+getOpeningHoursString(bar.openingHours)+'<br /> ';
    tooltip += `Happy Hours <br />`+getOpeningHoursString(bar.happyHours);

    let marker: Marker;
    let activeQuestIndex = findActiveQuestIndex(bar);
    if (activeQuestIndex >= 0) {
      marker = this.getQuestMarker(bar.lat, bar.lng);
      let quest = bar.quests[activeQuestIndex];
      tooltip += "<br />&nbsp;<br />"
      tooltip += `Active Quest<br /> ${quest.name} ${addAMPMsuffixToHour(quest.startHour)} - ${addAMPMsuffixToHour(quest.endHour)} `;
    } else {
      marker = this.getBarMarker(bar);
    }

    marker.bindTooltip(tooltip);
    return marker;
  }

  private getBarMarker(bar: Bar): Marker {
    let url = bar.status == 'crawled' ? 'assets/liquor_orange.png' : 'assets/liquor_purple.png';
    const html = `
      <div style="
        width: 25px;
        height: 25px;
        background-image: url('${url}');
        background-size: cover;
        border: 1px solid white;
        border-radius: 25px;
      "></div>`;

    let barIcon: DivIcon = divIcon({
      html,
      className: '',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      tooltipAnchor: [20, 0]
    });

    return marker(latLng(bar.lat, bar.lng), { icon: barIcon });
  }

  private getQuestMarker(lat: number, lng: number): Marker {
    let url = "assets/liquor_purple.png";
    const html = `
    <div  style="
      background: linear-gradient(90deg, rgba(131, 58, 180, 1) 0%, rgba(253, 29, 29, 1) 50%, rgba(252, 176, 69, 1) 100%);
      width: 28px;
      height: 28px;
      padding: 3px;
      border-radius: 28px;
    ">
      <div style="
        width: 25px;
        height: 25px;
        background-image: url('${url}');
        background-size: cover;
        border: 1px solid white;
        border-radius: 25px;
      "></div>
    </div>`;

    let framedBarIcon: DivIcon = divIcon({
      html,
      className: '',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      tooltipAnchor: [20, 0]
    });

    return marker(latLng(lat, lng), { icon: framedBarIcon });
  }

  private createAvatarMarker(url: string, lat: number, lng: number, tooltip: string, index: number, total: number): Marker {
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

    const radius = 0.0005;
    const angle = (2 * Math.PI / total) * index;
    const latOffset = radius * Math.cos(angle);
    const lngOffset = radius * Math.sin(angle);
    let result = marker(latLng(lat + latOffset, lng + lngOffset), { icon: avatarIcon });
    result.bindTooltip(tooltip);
    return result;
  }



  public ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

}
