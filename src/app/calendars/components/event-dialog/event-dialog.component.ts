import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CALENDAR} from '../../model/calendar.model';
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import {AsyncPipe} from '@angular/common';
import {
  CityAutocompleteComponent
} from '../../../core/shared/autocomplete/city-autocomplete/city-autocomplete.component';
import {FaIconComponent, IconDefinition} from '@fortawesome/angular-fontawesome';
import {MatError, MatFormField, MatLabel, MatSuffix} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {NgxColorsModule, validColorValidator} from 'ngx-colors';
import {
  ProvinceAutocompleteComponent
} from '../../../core/shared/autocomplete/province-autocomplete/province-autocomplete.component';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-event-dialog',
  standalone: true,
  imports: [
    AsyncPipe,
    CityAutocompleteComponent,
    FaIconComponent,
    MatError,
    MatFormField,
    MatInput,
    MatLabel,
    MatSlideToggle,
    MatSuffix,
    NgxColorsModule,
    ProvinceAutocompleteComponent,
    ReactiveFormsModule
  ],
  templateUrl: './event-dialog.component.html',
  styleUrl: './event-dialog.component.scss'
})
export class EventDialogComponent implements OnInit {

  /* loading */
  public isLoading$!: Observable<boolean>;

  /* form */
  public form: FormGroup = new FormGroup({});
  public eventColor: FormControl = new FormControl(null);

  constructor(public dialogRef: MatDialogRef<EventDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: {event: CALENDAR}, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.createForm();
  }

  protected readonly faTimes: IconDefinition = faTimes;

   public closeDialog(): void {
    this.dialogRef.close();
  }

  /************************************************
   *
   * Form
   *
   ***********************************************/

  private createForm(): void {
    this.form = this.fb.group({
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

    this.form.controls['picker'].valueChanges.subscribe((color: any) =>
      this.color.setValue(color, {
        emitEvent: false,
      })
    );
  }

  public onSubmit(): void {}

  /************************************************
   *
   * Color
   *
   ***********************************************/

  public _onColorChange(event: any): void {
    console.log(event);
  }


  /************************************************
   *
   * Controls
   *
   ***********************************************/

  get color(): AbstractControl {
    return this.form.get('color') as AbstractControl;
  }
}
