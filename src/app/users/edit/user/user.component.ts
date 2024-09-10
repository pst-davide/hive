import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTimes, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FormGroup, ReactiveFormsModule, FormsModule, AbstractControl, Validators, FormBuilder, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { Observable } from 'rxjs';
import _ from 'lodash';
import { NgxColorsModule, validColorValidator } from 'ngx-colors';
import { EMPTY_ROOM, RoomModel } from 'app/admin/rooms/model/room.model';
import { RoomService } from 'app/admin/rooms/service/room.service';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, ReactiveFormsModule, MatInputModule, MatFormFieldModule, NgxColorsModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss'
})
export class UserComponent implements OnInit {

  /* loading */
  public isLoading$!: Observable<boolean>;

  /* icons */
  public faTimes: IconDefinition = faTimes;

  /* form */
  public form: FormGroup = new FormGroup({});
  public roomColor: FormControl = new FormControl(null);

  constructor(public dialogRef: MatDialogRef<UserComponent>, @Inject(MAT_DIALOG_DATA) public data: RoomModel, private fb: FormBuilder, private roomService: RoomService) {}

  ngOnInit(): void {
      this.createForm();

      const r = _.cloneDeep(EMPTY_ROOM);
      r.id = 'TST3';
      r.code = 'TST3';
      r.name = 'Test 3';
      // this.roomService.createRoom(r).subscribe(ref => {console.log(ref)});
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
      description: [null],
      color: [null, [Validators['required'], validColorValidator()]],
      picker: [null],
    });

    this.color.valueChanges.subscribe((color) => {
      if (this.form.controls['picker'].valid) {
        this.form.controls['picker'].setValue(color, {
          emitEvent: false,
        });
      }
    });

    this.form.controls['picker'].valueChanges.subscribe((color) =>
      this.color.setValue(color, {
        emitEvent: false,
      })
    );
  }

  public async onSubmit(): Promise<void> {

    const room: RoomModel = _.cloneDeep(EMPTY_ROOM);
    room.id = this.code.value;
    room.code = this.code.value;
    room.name = this.name.value;

    this.roomService.createDoc(room);
  }

  public closeDialog(): void {
    this.dialogRef.close();
  }

  public _onColorChange(event: any): void {
    console.log(event);
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

  get color(): AbstractControl {
    return this.form.get('color') as AbstractControl;
  }
}
