import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EMPTY_ROOM, RoomModel } from '../../model/room.model';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTimes, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FormGroup, ReactiveFormsModule, FormsModule, AbstractControl, Validators, FormBuilder } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { Observable } from 'rxjs';
import _ from 'lodash';
import { RoomService } from '../../service/room.service';

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, ReactiveFormsModule, MatInputModule, MatFormFieldModule],
  templateUrl: './room.component.html',
  styleUrl: './room.component.scss'
})
export class RoomComponent implements OnInit {

  /* loading */
  public isLoading$!: Observable<boolean>;

  /* icons */
  public faTimes: IconDefinition = faTimes;

  /* form */
  public form: FormGroup = new FormGroup({});

  constructor(public dialogRef: MatDialogRef<RoomComponent>, @Inject(MAT_DIALOG_DATA) public data: RoomModel, private fb: FormBuilder, private roomService: RoomService) {}

  ngOnInit(): void {
      this.createForm();
  }

  /*************************************************
   *
   * Form
   *
   ************************************************/

  private createForm(): void {
    this.form = this.fb.group({
      code: ['', Validators['required']],
      name: ['', Validators['required']],
      capacity: [null],
      floor: [null],
      enabled: [false],
      description: [null]
    });
  }

  public async onSubmit(): Promise<void> {

    const room = _.cloneDeep(EMPTY_ROOM);
    room.id = this.code.value;
    room.code = this.code.value;
    room.name = this.name.value;

    this.roomService.createRoom(room);
  }

  public closeDialog(): void {
    this.dialogRef.close();
  }


  /************************************************
   *
   * Controls
   *
   ***********************************************/

  get code(): AbstractControl {
    return this.form.get('code') as AbstractControl;
  }

  get name(): AbstractControl {
    return this.form.get('name') as AbstractControl;
  }
}
