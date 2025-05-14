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
import {getOpeningHoursString} from '../../utils/hours-formatting.utils';
import {RedeemVoucherDialogComponent} from '../../dialogs/redeem-voucher-dialog/redeem-voucher-dialog.component';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {findActiveQuestIndex} from '../../utils/quest.utils';

@Component({
  selector: 'app-barkeeper-admin',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    ToolbarComponent,
    QRCodeComponent,
    MatCheckboxModule,
  ],
  templateUrl: './barkeeper-admin.component.html',
  styleUrl: './barkeeper-admin.component.css'
})
export class BarkeeperAdminComponent implements OnInit, OnDestroy {

  public bar: Bar | undefined;
  public currentQuestIndex: number = -1;
  public qrData = '';
  public statistics: BarStatistics = { checkins: 0, questFulfilled: 0 , guests: 0 };
  private subscriptions: Subscription[] = [];

  constructor(private userService: UserService,
              private barService: BarService,
              private dialog: MatDialog) {}

  public ngOnInit() {
    let barId = this.userService.getCurrentUser()!.barId!;
    this.subscriptions.push(this.barService.getBarById(barId).subscribe(bar => {
      let quests = bar.quests.map(q => {
        let dates = q.dates ? q.dates.map(d => new Date(d)) : [];
        return  { ...q, dates};
      });
      this.bar = { ...bar, id: barId, quests };
      this.initCurrentQuest();
      this.initQrCode(this.bar);

      this.subscriptions.push(this.barService.getQuestAddedObservable().subscribe(quest => {
        let index = this.bar!.quests.findIndex((q: Quest) => q.id == quest.id);
        if (index >= 0) {
          this.bar!.quests.splice(index, 1);
        }
        this.bar!.quests.push(quest);
        this.initCurrentQuest();
        this.initQrCode(this.bar!);
      }))
    }));


    this.subscriptions.push(this.barService.getBarStatistics(barId).subscribe(stats => { this.statistics = stats}));
  }

  private initCurrentQuest() {
    if (this.bar) {
      this.currentQuestIndex = findActiveQuestIndex(this.bar!);
    }
  }

  private initQrCode(bar: Bar, addQuest: boolean = false) {
    let currentQuest = addQuest && this.currentQuestIndex >= 0 ? this.bar?.quests[this.currentQuestIndex] : undefined;
    this.qrData = JSON.stringify({
      type: 'bar-checkin',
      barId: bar.id,
      barName: bar.name,
      questId: currentQuest ? currentQuest.id : undefined,
      questName: currentQuest ? currentQuest.name : undefined,
    });
  }

  public updateQrCode(questFullfilled: boolean) {
    this.initQrCode(this.bar!, questFullfilled);
  }


  public openEditBarHoursDialog(kind: string) {
    this.dialog.open(EditBarHoursDialogComponent, {
      data: {bar: this.bar, kind},
      autoFocus: false
    });
  }

  public openAddQuestDialog() {
    this.dialog.open(AddQuestDialogComponent, {
      data: { bar: this.bar },
      autoFocus: false
    });
  }

  public openEditQuestDialog(quest: Quest) {
    this.dialog.open(AddQuestDialogComponent, {
      data: { bar: this.bar, quest },
      autoFocus: false
    });
  }

  public openRedeemVoucherDialog() {
    this.dialog.open(RedeemVoucherDialogComponent, {
      autoFocus: false
    });
  }

  public getHoursString(hours: {day: number, start: number, end: number}[]): string {
   return getOpeningHoursString(hours); // util function
  }

  public ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
