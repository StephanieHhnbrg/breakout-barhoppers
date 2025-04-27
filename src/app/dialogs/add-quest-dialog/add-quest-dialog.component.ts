import {Component, Inject, OnInit} from '@angular/core';
import {Bar} from '../../data/bar.data';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {CommonModule} from '@angular/common';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {Quest} from '../../data/quest.data';

@Component({
  selector: 'app-add-quest-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './add-quest-dialog.component.html',
  styleUrl: './add-quest-dialog.component.css'
})
export class AddQuestDialogComponent implements OnInit {

  public bar: Bar | undefined;
  public quest: Quest | undefined;

  constructor(public dialogRef: MatDialogRef<AddQuestDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: { bar: Bar }) {}

  ngOnInit() {
    this.bar = this.data.bar;
  }

  public addQuest() {

    // call BarService
    this.dialogRef.close();
  }

}
