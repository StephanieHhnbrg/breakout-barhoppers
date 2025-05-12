import {Component, Inject, OnInit} from '@angular/core';
import {Bar} from '../../data/bar.data';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {CommonModule} from '@angular/common';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {Quest} from '../../data/quest.data';
import {BarService} from '../../services/bar.service';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, FormControl} from '@angular/forms';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatDatepickerInputEvent, MatDatepickerModule} from '@angular/material/datepicker';
import {MatChipsModule} from '@angular/material/chips';
import {MatSelectModule} from '@angular/material/select';
import {getDayString} from '../../utils/hours-formatting.utils';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-add-quest-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    FormsModule,
    MatDatepickerModule,
    MatChipsModule,
    MatSelectModule,
  ],
  templateUrl: './add-quest-dialog.component.html',
  styleUrl: './add-quest-dialog.component.css'
})
export class AddQuestDialogComponent implements OnInit {

  public bar: Bar | undefined;
  public quest: Quest | undefined;
  public form: FormGroup;
  readonly singleDateForm = new FormControl(new Date());
  public multipleDates: Date[] = [];
  readonly regularDateForm = new FormControl();
  readonly startTimeForm = new FormControl();
  readonly endTimeForm = new FormControl();

  public dateView: "single" | "multiple" | "regular" = "single";

  public state: "view" | "create" | "edit" = "create";
  public timeOptions: {value: number, text: string}[] = [];
  public weekDayOptions: {value: number, text: string}[] = [];

  constructor(public dialogRef: MatDialogRef<AddQuestDialogComponent>,
              private barService: BarService,
              private fb: FormBuilder,

              @Inject(MAT_DIALOG_DATA) public data: { bar: Bar, quest: Quest }) {
  this.form = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required]
  });
}

  ngOnInit() {
    this.bar = this.data.bar;
    if (this.data.quest) {
      this.state = "view";
      this.quest = this.data.quest;
    }

    this.timeOptions = this.getTimeOptions();
    this.weekDayOptions = this.getWeekdayOptions();
  }

  public changeToEditView() {
    if (this.quest) {
      this.state = "edit";
      this.form = this.fb.group({
        name: [this.quest.name, Validators.required],
        description: [this.quest.description, Validators.required]
      });
      this.dateView = (this.quest.regularDays && this.quest.regularDays.length > 0) ? 'regular' :
        ((this.quest.dates && this.quest.dates.length == 1) ? 'single' : 'multiple');
      if (this.dateView == 'single') {
        this.singleDateForm.setValue(this.multipleDates![0]);
      } else if (this.dateView == 'multiple') {
        this.multipleDates = this.quest.dates!;
      }    if (this.dateView == 'regular') {
        this.regularDateForm.setValue(this.quest.regularDays!);
      }
      this.startTimeForm.setValue(this.quest.startHour);
      this.endTimeForm.setValue(this.quest.endHour);
    }
  }

  public onSubmit() {
    if (this.isValidForm()) {
      let id = this.quest ? this.quest.id : `quest_${uuidv4()}`;
      let barId = this.bar!.id;
      let name: string = this.form.get('name')!.value;
      let description: string = this.form.get('description')!.value;
      let regularDays: number[] = this.dateView == 'regular' ? this.regularDateForm.value : [];
      let dates: Date[] = this.dateView != 'regular' ? (this.dateView == 'single' ? [this.singleDateForm.value!] : this.multipleDates): [];
      let startHour: number = this.startTimeForm.value;
      let endHour: number = this.endTimeForm.value;
      let quest: Quest = { id, barId, name, description, regularDays, dates, startHour, endHour};
      this.addQuest(quest);
    } else {
      this.form.markAllAsTouched();
    }
  }

  public isValidForm(): boolean {
    let hasDatesSelected = (this.dateView == 'single' && this.singleDateForm.value)
      || (this.dateView == 'multiple' && this.multipleDates.length > 0)
      || (this.dateView == 'regular' && this.regularDateForm.value);
    let hasTimeSelected = this.startTimeForm.value && this.endTimeForm.value;
    return this.form.valid && hasDatesSelected && hasTimeSelected;
  }

  public addDate(event: MatDatepickerInputEvent<Date>) {
    if (event.value && !this.multipleDates.includes(event.value)){
      this.multipleDates.push(event.value);
    }
  }

  public getDateString(date: Date): string {
    return `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`;
  }

  public getRegularDaysString(days: number[]) : string {
    return days.map(d => { return getDayString(d); })
      .reduce((prev, next) => {
      return `${prev}, ${next}`
    });

  }

  public removeDate(index: number) {
    this.multipleDates.splice(index, 1);
  }

  private getTimeOptions(): {value: number, text: string}[] {
    if (!this.bar) {
      return [];
    }
    // TODO if date is selected, take openingHours of selected week day
    // TODO get EndtimeOptions, dependent on selected start time

    let start = this.bar!.openingHours.reduce((earliest, current) => {
      return current.start < earliest.start ? current : earliest;
    }).start;
    let end = this.bar!.openingHours.reduce((latest, current) => {
      const normalize = (h: number) => h < 6 ? h + 24 : h;  // 2 AM → 26
      return normalize(current.end) > normalize(latest.end) ? current : latest;
    }).end;

    let hours = [];
    if (end < start) {
      for (let h = start; h < 24; h++) {
        hours.push(h);
      }
      for (let h = 0; h <= end; h++) {
        hours.push(h);
      }
    } else {
      for (let h = start; h <= end; h++) {
        hours.push(h);
      }
    }

    return hours.map(h => ({
      value: h,
      text: this.formatHour(h)
    }));
  }

  public formatHour(h: number): string {
    const suffix = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12} ${suffix}`;
  };

  private getWeekdayOptions(): {value: number, text: string}[]  {
    if (!this.bar) {
      return [];
    }
    return this.bar!.openingHours.map(h => {
      return {value: h.day, text: getDayString(h.day) };
    });
  }

  private addQuest(quest: Quest) {
    this.barService.addQuest(quest);
    this.dialogRef.close();
  }

  public onClose() {
    this.dialogRef.close();
  }

}
