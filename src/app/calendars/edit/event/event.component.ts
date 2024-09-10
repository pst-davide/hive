import { Component, inject, Inject, OnInit, signal, ViewEncapsulation, WritableSignal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTimes, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FormGroup, ReactiveFormsModule, FormsModule, AbstractControl, FormBuilder, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { Observable } from 'rxjs';
import _ from 'lodash';
import { NgxColorsModule } from 'ngx-colors';
import { CALENDAR, EMPTY_CALENDAR } from 'app/calendars/model/calendar.model';
import { RxFormBuilder, RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { CalendarValidator } from 'app/calendars/validators/event.validator';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { IT_DATE_FORMATS } from 'app/app.config';
import {MatDatepickerIntl, MatDatepickerModule} from '@angular/material/datepicker';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import moment, { Moment } from 'moment';
import 'moment/locale/it';
import { DEFAULT_CALENDAR_BACKGROUND } from 'app/core/functions/environments';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { TypeSelectComponent } from "../../../core/shared/select/type-select/type-select.component";

@Component({
  selector: 'app-event',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, ReactiveFormsModule, MatInputModule, MatFormFieldModule,
    NgxColorsModule, RxReactiveFormsModule, MatDatepickerModule, MatCheckboxModule, TypeSelectComponent],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'it'},
    {provide: MAT_DATE_FORMATS, useValue: IT_DATE_FORMATS},
    provideMomentDateAdapter()
  ],
  templateUrl: './event.component.html',
  styleUrl: './event.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class EventComponent implements OnInit {

  /* date adapter & locale */
  private readonly _adapter = inject<DateAdapter<unknown, unknown>>(DateAdapter);
  private readonly _intl = inject(MatDatepickerIntl);
  private readonly _locale = signal(inject<unknown>(MAT_DATE_LOCALE));

  /* loading */
  public isLoading$!: Observable<boolean>;

  /* title */
  public formTitle: string = 'Nuovo Evento';

  /* icons */
  public faTimes: IconDefinition = faTimes;

  /* doc */
  public doc: CALENDAR = _.cloneDeep(EMPTY_CALENDAR);

  /* form */
  public form: FormGroup = new FormGroup({});
  public roomColor: FormControl = new FormControl(null);
  public isReadOnly: boolean = false;

  /* duration */
  public duration: WritableSignal<number | null> = signal<number | null>(null);
  public labelDuration: string = '';

  constructor(public dialogRef: MatDialogRef<EventComponent>, @Inject(MAT_DIALOG_DATA) public data: {event: CALENDAR}, private fb: FormBuilder,
  private formBuilder: RxFormBuilder) {
    moment.locale('it');
    this._locale.set('it');
    this._adapter.setLocale(this._locale());
  }

  ngOnInit(): void {
      this._intl.changes.next();
      this.doc = this.data.event;
      this.createForm();
      this.formTitle = this.data.event.title ?? 'Nuovo Evento';
  }

  /*************************************************
   *
   * Form
   *
   ************************************************/

  private patchForm(): void {
    const f = moment(this.doc.start).clone().startOf('day');
    this.form.patchValue({
      title: this.doc.title,
      description: this.doc['description'],
      date: this.doc.start ?  moment(this.doc.start).clone().startOf('day') : null,
      from: this.doc.start ? moment(this.doc.start).clone().format('HH:mm') : null,
      to: this.doc.end ? moment(this.doc.end).clone().format('HH:mm') : null,
      color: this.doc.backgroundColor ?? DEFAULT_CALENDAR_BACKGROUND,
      typeId: this.doc.typeId,
      allDay: this.doc.allDay ?? false,
    });

    this.calculateDuration();
  }

  private createForm(): void {
    this.form = this.formBuilder.formGroup(CalendarValidator);
    
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

    this.patchForm();
  }

  public async onSubmit(): Promise<void> {
  }

  public closeDialog(): void {
    this.dialogRef.close();
  }

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
   * Duration
   *
   ***********************************************/

  public calculateDuration(): void {
    const { from, to, date } = this.form.value;
    
    if (from && to && date) {
      const start = moment(date).clone().hours(moment(from, 'HH:mm').hours()).minutes(moment(from, 'HH:mm').minutes());
      const end = moment(date).clone().hours(moment(to, 'HH:mm').hours()).minutes(moment(to, 'HH:mm').minutes());
  
      if (end.isBefore(start)) {
        end.add(1, 'day');
      }
  
      const duration = end.diff(start, 'minutes');
      this.duration.set(duration > 0 ? parseFloat((duration / 60).toFixed(2)) : 0);
      this.labelDuration = duration <= 60 ? 'ora' : 'ore';
    } else {
      this.duration.set(null);
      this.labelDuration = '';
    }
  }

  public _toggleAllDay(event: MatCheckboxChange): void {
    const date: Moment = this.date.value;

    if (event.checked) {
      const from: Moment = date.clone().startOf('day');
      const to: Moment = date.clone().endOf('day');

      this.from.setValue(from.format('HH:mm'));
      this.to.setValue(to.format('HH:mm'));

      this.isReadOnly = true;
    } else {
      this.isReadOnly = false;
    }
    
    this.calculateDuration();
  }

  /************************************************
   *
   * Controls
   *
   ***********************************************/

  get code(): AbstractControl {
    return this.form.get('code') as AbstractControl;
  }

  get title(): AbstractControl {
    return this.form.get('title') as AbstractControl;
  }

  get typeId(): AbstractControl {
    return this.form.get('typeId') as AbstractControl;
  }

  get status(): AbstractControl {
    return this.form.get('status') as AbstractControl;
  }

  get description(): AbstractControl {
    return this.form.get('description') as AbstractControl;
  }

  get allDay(): AbstractControl {
    return this.form.get('allDay') as AbstractControl;
  }

  get color(): AbstractControl {
    return this.form.get('color') as AbstractControl;
  }

  get date(): AbstractControl {
    return this.form.get('date') as AbstractControl;
  }

  get from(): AbstractControl {
    return this.form.get('from') as AbstractControl;
  }

  get to(): AbstractControl {
    return this.form.get('to') as AbstractControl;
  }
}
