import {Component, OnDestroy, OnInit} from '@angular/core';
import {Bar} from '../../data/bar.data';
import {UserService} from '../../services/user.service';
import {BarService} from '../../services/bar.service';
import {Subscription} from 'rxjs';
import {MatIconModule} from '@angular/material/icon';
import {CommonModule} from '@angular/common';
import {ToolbarComponent} from '../toolbar/toolbar.component';
import {BarStatistics} from '../../data/bar-statistics.data';
import { QRCodeComponent } from 'angularx-qrcode';
import {Quest} from '../../data/quest.data';
import {MatDialog} from '@angular/material/dialog';
import {EditBarHoursDialogComponent} from '../../dialogs/edit-bar-hours-dialog/edit-bar-hours-dialog.component';
import {AddQuestDialogComponent} from '../../dialogs/add-quest-dialog/add-quest-dialog.component';
import {getHoursString} from '../../utils/hours-formatting.utils';

@Component({
  selector: 'app-barkeeper-admin',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    ToolbarComponent,
    QRCodeComponent,
  ],
  templateUrl: './barkeeper-admin.component.html',
  styleUrl: './barkeeper-admin.component.css'
})
export class BarkeeperAdminComponent implements OnInit, OnDestroy {

  public bar: Bar | undefined;
  public currentQuest: Quest | undefined;
  public qrData = '';
  public statistics: BarStatistics = { checkins: 0, questFulfilled: 0 , guests: 0 };
  private subscriptions: Subscription[] = [];

  constructor(private userService: UserService,
              private barService: BarService,
              private dialog: MatDialog) {}

  public ngOnInit() {
    let barId = this.userService.getCurrentUser()!.barId!;
    this.subscriptions.push(this.barService.getBarById(barId).subscribe(bar => {
      this.bar = bar;
      this.initQrCode(this.bar);
      this.initCurrentQuest();
    }));

    this.subscriptions.push(this.barService.getBarStatistics(barId).subscribe(stats => { this.statistics = stats}));
  }

  private initCurrentQuest() {
    if (this.bar) {
      let date = new Date();
      let day = date.getDay() == 0 ? 7 : date.getDay();
      let hour = date.getHours();
      this.currentQuest = this.bar!.quests.find(q => {
        (q.regularDays && q.regularDays.length > 0 && q.regularDays?.includes(day) && this.isInTime(q, date, hour)) ||
        ((!q.regularDays || q.regularDays.length == 0) && this.isInTime(q, date, hour));
      });
    }
  }

  private initQrCode(bar: Bar) {
    this.qrData = JSON.stringify({
      type: 'bar-checkin',
      barId: bar.id,
      barName: bar.name,
      questId: this.currentQuest ? this.currentQuest.id : undefined,
      questName: this.currentQuest ? this.currentQuest.name : undefined,
    });
  }

  private isInTime(q: Quest, date: Date, hour: number) {
    let isWithinDates = q.startDate < date && date < q.endDate;

    let sameDayValid = q.startHour < q.endHour && q.startHour < hour && hour < q.endHour;
    let diffDayValid = q.startHour > q.endHour && (q.startHour < hour || hour < q.endHour);
    return isWithinDates && (sameDayValid || diffDayValid);
  }

  public openEditBarHoursDialog(kind: string) {
    this.dialog.open(EditBarHoursDialogComponent, {
      data: {bar: this.bar, kind},
      autoFocus: false
    });
  }

  public openAddQuestDialog() {
    this.dialog.open(AddQuestDialogComponent, {
      data: this.bar,
      autoFocus: false
    });
  }

  public getHoursString(hours: {day: number, start: number, end: number}[]): string {
   return getHoursString(hours); // util function
  }

  public ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
