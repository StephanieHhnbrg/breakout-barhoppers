import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {Subscription} from 'rxjs';
import {Bar} from '../../data/bar.data';
import {getDayString} from '../../utils/hours-formatting.utils';
import {FormsModule} from '@angular/forms';
import {BarService} from '../../services/bar.service';

@Component({
  selector: 'app-edit-bar-hours-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './edit-bar-hours-dialog.component.html',
  styleUrl: './edit-bar-hours-dialog.component.css'
})
export class EditBarHoursDialogComponent implements OnInit, OnDestroy {

  public bar: Bar | undefined;
  public hours: {day: number, start: number, end: number}[] = [];
  public icon: "schedule" | "local_bar" = "schedule";
  private subscriptions: Subscription[] = [];

  constructor(public dialogRef: MatDialogRef<EditBarHoursDialogComponent>,
              private barService: BarService,
              @Inject(MAT_DIALOG_DATA) public data: {bar: Bar, kind: "Opening" | "Happy" }) {}

  ngOnInit() {
    this.bar = this.data.bar;
    this.icon = this.data.kind == "Opening" ? "schedule" : "local_bar";
    this.initHoursArray();
  }

  private initHoursArray() {
    let toBeCloned: {day: number, start: number, end: number}[]
      = this.data.kind == "Opening" ? this.bar!.openingHours : this.bar!.happyHours;
    let hours: {day: number, start: number, end: number}[] = [];
    toBeCloned.forEach(val => hours.push(Object.assign({}, val)));
    let toBeAdded = [];

    if (hours.length < 7) {
      for (let day = 1; day <= 7; day++) {
        let isDayDefined = hours.find(h => h.day == day);
        if (!isDayDefined) {
          toBeAdded.push({day, start: 0, end: 0});
        }
      }
      hours = hours.concat(toBeAdded);
      hours.sort((h1, h2) => h1.day - h2.day);
    }
    this.hours = hours;
  }

  public getDayString(day: number): string {
    return getDayString(day); // util function
  }

  public updateHours() {
    let result = this.hours.filter(h => h.start != h.end);
    if (this.data.kind == "Opening") {
      this.data.bar.openingHours = result;
    } else {
      this.data.bar.happyHours = result;
    }

    this.subscriptions.push(this.barService.updateBarHours(this.bar!));

    this.dialogRef.close();
  }

  public ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

}
