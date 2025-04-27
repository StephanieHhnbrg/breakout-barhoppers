import {Component, OnDestroy, OnInit} from '@angular/core';
import {latLng, LatLng, MapOptions, tileLayer} from "leaflet";
import {icon, Marker, marker, circleMarker, CircleMarker} from "leaflet";
import {LeafletModule} from '@asymmetrik/ngx-leaflet';
import {ToolbarComponent} from '../toolbar/toolbar.component';
import {BarService} from '../../services/bar.service';
import {Subscription} from 'rxjs';
import {Bar} from '../../data/bar.data';

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
  constructor(private barService: BarService) {}
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
    let result = marker(latLng(bar.lat, bar.lng), {
      icon: icon({
        iconSize: [25, 25],
        iconAnchor: [12, 12],
        tooltipAnchor: [20, 0],
        iconUrl: 'assets/liquor_black.png',
      })
    });
    result.bindTooltip(`<b>${bar.name}</b><br />`); // TODO: Opening Hour, Happy Hour, Quests
    return result;
  }

  public ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

}
