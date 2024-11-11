import {
  Component,
  inject,
  Inject,
  model,
  ModelSignal,
  OnInit,
  signal,
  ViewEncapsulation,
  WritableSignal
} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {FormGroup, ReactiveFormsModule, FormsModule, AbstractControl} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {Observable} from 'rxjs';
import _, {padStart} from 'lodash';
import {CALENDAR, EMPTY_CALENDAR} from 'app/calendars/model/calendar.model';
import {RxFormBuilder, RxReactiveFormsModule} from '@rxweb/reactive-form-validators';
import {CalendarValidator} from 'app/calendars/validators/event.validator';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import {IT_DATE_FORMATS} from 'app/app.config';
import {MatDatepickerIntl, MatDatepickerModule} from '@angular/material/datepicker';
import {provideMomentDateAdapter} from '@angular/material-moment-adapter';
import moment, {Moment} from 'moment';
import 'moment/locale/it';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {TypeSelectComponent} from '../../../core/shared/select/type-select/type-select.component';
import {DialogCloseButtonComponent} from '../../../layouts/dialog-close-button/dialog-close-button.component';
import {EditLogoComponent} from '../../../layouts/edit-logo/edit-logo.component';
import {MatSlideToggle, MatSlideToggleChange} from '@angular/material/slide-toggle';
import {RoomChipComponent} from '../../../core/shared/chips/room-chip/room-chip.component';
import {ShiftModel} from '../../../admin/shifts/model/shift.model';
import {CalendarService} from '../../service/calendar.service';

@Component({
  selector: 'app-event',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    RxReactiveFormsModule,
    MatDatepickerModule,
    MatCheckboxModule,
    TypeSelectComponent,
    DialogCloseButtonComponent,
    EditLogoComponent,
    MatSlideToggle,
    RoomChipComponent
  ],
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
  private readonly _adapter: DateAdapter<any> = inject<DateAdapter<unknown, unknown>>(DateAdapter);
  private readonly _intl: MatDatepickerIntl = inject(MatDatepickerIntl);
  private readonly _locale: WritableSignal<any> = signal(inject<unknown>(MAT_DATE_LOCALE));

  /* loading */
  public isLoading$!: Observable<boolean>;

  /* title */
  public formTitle: string = 'Nuovo Evento';

  /* doc */
  public doc: CALENDAR = _.cloneDeep(EMPTY_CALENDAR);

  /* form */
  public form: FormGroup = new FormGroup({});
  public isReadOnly: boolean = false;

  /* rooms */
  public rooms$: ModelSignal<string[]> = model<string[]>([]);

  /* shift */
  public shiftId$: ModelSignal<string | null> = model<string | null>(null);
  public shift$: ModelSignal<ShiftModel | null> = model<ShiftModel | null>(null);

  /* duration */
  public duration: WritableSignal<number | null> = signal<number | null>(null);
  public labelDuration: string = '';

  /* overlay */
  public overlayEvents: CALENDAR[] = [];

  constructor(public dialogRef: MatDialogRef<EventComponent>,
              @Inject(MAT_DIALOG_DATA) public data: { event: CALENDAR },
              private formBuilder: RxFormBuilder, private crudService: CalendarService) {
    moment.locale('it');
    this._locale.set('it');
    this._adapter.setLocale(this._locale());

    this.rooms$.subscribe((docs: string[]) => {
      if (this.resourcesCount) {
        this.resourcesCount.setValue(docs.length ?? 0);
        this.checkOverlay().then(() => {
        });
      }
    });

    this.shiftId$.subscribe((doc: string | null) => {
      if (this.typeId) {
        this.typeId.setValue(doc);
      }
    });

    this.shift$.subscribe((doc: ShiftModel | null) => {

    });
  }

  ngOnInit(): void {
    this._intl.changes.next();
    this.doc = this.data.event;
    this.rooms$.set(this.doc.resourceIds);
    this.shiftId$.set(this.doc.shiftId);
    this.createForm();
    this.formTitle = this.data.event.title ?? 'Nuovo Evento';
  }

  /*************************************************
   *
   * Overlay
   *
   ************************************************/

  private async checkOverlay(): Promise<void> {
    const f: Date = this.doc.start ? moment(this.doc.start).toDate() : moment().toDate();
    const t: Date = this.doc.end ? moment(this.doc.end).toDate() : moment().toDate();

    const existingEvents: CALENDAR[] = await this.crudService.getEventsInRange(f, t);
    this.overlayEvents = existingEvents ? existingEvents.filter((e: CALENDAR) => ((this.doc.id && e.id !== this.doc.id)
        || !this.doc.id) && e.resourceIds.some((id: string) => this.rooms$().includes(id))) : [];
  }

  /*************************************************
   *
   * Form
   *
   ************************************************/

  private patchForm(): void {
    this.form.patchValue({
      code: this.doc.code ?? null,
      title: this.doc.title ?? null,
      typeId: this.doc.shiftId,
      status: this.doc.status,
      description: this.doc['description'],
      allDay: this.doc.allDay ?? false,
      resourcesCount: this.doc.resourceIds ? this.doc.resourceIds.length : 0,
      date: this.doc.start ? moment(this.doc.start).clone().startOf('day') : null,
      from: this.doc.start ? moment(this.doc.start).clone().format('HH:mm') : null,
      to: this.doc.end ? moment(this.doc.end).clone().format('HH:mm') : null,
      customerId: this.doc.customerId,
    });

    this.calculateDuration();
  }

  private createForm(): void {
    this.form = this.formBuilder.formGroup(CalendarValidator);
    this.patchForm();
  }

  public async onSubmit(): Promise<void> {
    if (!this.form.valid) {
      return;
    }

    this.doc.shiftId = this.shiftId$();
    this.doc.title = this.title.value;
    this.doc['description'] = this.description.value ?? null;
    this.doc.backgroundColor = this.shift$()?.color as string;
    this.doc.status = 1;
    this.doc.resourceIds = this.rooms$();
    this.doc.customerId = this.customerId.value ?? null;
    this.doc.allDay = this.allDay.value ?? false;

    const day: Moment = this.date.value.startOf('day');

    this.doc.date = day.toDate() ?? null;
    if (day && this.from.value) {
      const [hours, minutes] = this.from.value.split(':').map(Number);
      this.doc.start = day.clone().add(hours, 'hours').add(minutes, 'minutes').toDate();
    } else {
      this.doc.start = moment().toDate();
    }
    if (day && this.to.value) {
      const [hours, minutes] = this.to.value.split(':').map(Number);
      this.doc.end = day.clone().add(hours, 'hours').add(minutes, 'minutes').toDate();
    } else {
      this.doc.end = moment().toDate();
    }
    this.doc.duration = moment(this.doc.end).diff(moment(this.doc.start), 'minutes');

    if (!this.doc.code) {
      const maxSerial: { maxSerial: number } = await this.crudService.getMaxSerial(this.doc.shiftId as string);
      this.doc.year = moment().year();
      this.doc.serial = maxSerial.maxSerial + 1;
      this.doc.code = `${this.doc.shiftId}${this.doc.year.toString().slice(2)}-${padStart(this.doc.serial.toString(), 4, '0')}`;
    }

    try {
      if (!this.doc.id || this.doc.id === '') {
        this.doc.id = this.doc.code;
        await this.crudService.createDoc(this.doc);
      } else {
        await this.crudService.updateDoc(this.doc.id, this.doc);
      }

      this.dialogRef.close(this.doc);
    } catch (error) {
      console.error('Errore durante il salvataggio del documento:', error);
    }

    console.log(this.doc);
  }

  public closeDialog(): void {
    this.dialogRef.close();
  }

  /************************************************
   *
   * Duration
   *
   ***********************************************/

  public calculateDuration(): void {
    const {from, to, date} = this.form.value;

    if (from && to && date) {
      const start: Moment = moment(date).clone().hours(moment(from, 'HH:mm').hours()).minutes(moment(from, 'HH:mm').minutes());
      const end: Moment = moment(date).clone().hours(moment(to, 'HH:mm').hours()).minutes(moment(to, 'HH:mm').minutes()).endOf('minute');

      if (end.isBefore(start)) {
        end.add(1, 'day');
      }

      const duration: number = end.diff(start, 'minutes');

      if (start.format('HH:mm') === '00:00' && end.format('HH:mm') === '23:59') {
        this.duration.set(24);
      } else {
        this.duration.set(duration > 0 ? parseFloat((duration / 60).toFixed(2)) : 0);
      }

      this.labelDuration = duration <= 60 ? 'ora' : 'ore';

      this.checkOverlay().then(() => {});
    } else {
      this.duration.set(null);
      this.labelDuration = '';
    }
  }

  public _toggleAllDay(event: MatSlideToggleChange): void {
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

  get date(): AbstractControl {
    return this.form.get('date') as AbstractControl;
  }

  get from(): AbstractControl {
    return this.form.get('from') as AbstractControl;
  }

  get to(): AbstractControl {
    return this.form.get('to') as AbstractControl;
  }

  get customerId(): AbstractControl {
    return this.form.get('customerId') as AbstractControl;
  }

  get resourcesCount(): AbstractControl {
    return this.form.get('resourcesCount') as AbstractControl;
  }
}
