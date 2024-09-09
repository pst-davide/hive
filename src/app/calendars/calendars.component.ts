import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, Signal, signal, ViewChild, ViewEncapsulation } from '@angular/core';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, DatesSetArg, EventApi, EventClickArg, EventDropArg, EventInput, ViewApi } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import momentPlugin from '@fullcalendar/moment';
import interactionPlugin, { DateClickArg, EventResizeDoneArg } from '@fullcalendar/interaction';
import itLocale from '@fullcalendar/core/locales/it';
import { getEaster, HOLIDAYS } from 'app/core/functions/holidays.functions';
import moment from 'moment';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-calendars',
  standalone: true,
  imports: [FullCalendarModule, CommonModule],
  templateUrl: './calendars.component.html',
  styleUrl: './calendars.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class CalendarsComponent implements AfterViewInit, OnDestroy {

  /* holidays */
  private holidays: string[] = HOLIDAYS;
  protected holidayEvents: EventInput[] = [];
  private easter: Date | null = null;

  /* resize */
  @ViewChild('calendarContainer', { static: true }) calendarContainer!: ElementRef;
  private resizeObserver!: ResizeObserver;

  /* calendar */
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  public calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    aspectRatio: 2.5,
    locale: itLocale,
    weekNumbers: true,
    nowIndicator: true,
    slotLabelFormat: {hour: '2-digit', minute: '2-digit'},
    headerToolbar: {
      right: 'today,prev,next dayGridMonth,timeGridWeek,timeGridDay'
    },
    datesSet: (arg: DatesSetArg) => this.handleCalendarDate(arg),
    dateClick: (arg) => this.handleDateClick(arg),
    eventClick: (arg) => this.handleEventClick(arg),
    eventResize: (arg) => this.handleEventResize.bind(arg),
    eventDrop: (arg) => this.handleEventDrop.bind(arg),
    windowResize: (arg) => this.handleWindowResize(arg.view),
    eventsSet: this.handleEvents.bind(this),
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, momentPlugin]
  };

  private start: Date | null = null;
  private end: Date | null = null;

  public currentEvents: Signal<EventApi[]> = signal<EventApi[]>([]);

  constructor(private changeDetector: ChangeDetectorRef) {
  }

  ngAfterViewInit() {
    this.resizeObserver = new ResizeObserver(() => {
      this.handleResize();
    });

    if (this.calendarContainer && this.calendarContainer.nativeElement) {
      this.resizeObserver.observe(this.calendarContainer.nativeElement);
    }
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  /********************************************************************************************
   * CALENDAR
   * -------
   * getHoliday() -> called by loadCalendar()
   * loadCalendar() -> called by onInit() and when a new date is selected
   *******************************************************************************************/
  // check if the day is sunday or holiday
  private getHoliday(date: Date, saturdayHoliday: boolean = true): boolean {
    const monthDay: string = (date.getMonth() + 1) + '-' + date.getDate();
    const isEaster = moment(this.easter).isSame(moment(date));
    const isSaturday = moment(date).isoWeekday() === 6;
    const isSunday = moment(date).isoWeekday() === 7;
    return this.holidays.indexOf(monthDay) > -1 || isEaster || isSunday || (isSaturday && saturdayHoliday);
  }

  // CHANGE DATA
  // call load calendar only if the new range is not included in the old range
  public async handleCalendarDate(info: DatesSetArg): Promise<void> {
    console.log('call Handle Calendar Date');
    const included = moment(info.start).isBetween(moment(this.start), moment(this.end), undefined, '[]')
      && moment(info.end).isBetween(moment(this.start), moment(this.end), undefined, '[]');
    if (!included) {
      Promise.resolve().then(() => {
        const int = setInterval(() => {
          if (this.calendarComponent) {
            clearInterval(int);
            this.loadCalendar();
          }
        }, 50);
      });
    }
  }
  
  private loadCalendar(): void {
    // --------------------------------
    // show loader, remove old events, calc holidays and load new events
    // call on Init and date change
    // --------------------------------
    const calendarApi = this.calendarComponent.getApi();
    calendarApi.unselect();
    calendarApi.removeAllEvents();

    // --------------------------------
    // date and holidays
    // --------------------------------
    const calendarRange = calendarApi.getCurrentData().dateProfile.renderRange;
    this.easter = getEaster(calendarRange.start.getFullYear());
    const calendarStart = moment(calendarRange.start).startOf('day').toDate();
    const calendarEnd = moment(calendarRange.end).endOf('day').subtract(1, 'days').toDate();
    const calendarDiff = moment(calendarEnd).diff(moment(calendarStart), 'days');

    this.holidayEvents = [];
    for (let i = 0; i <= calendarDiff; i++) {
      const day = moment(calendarStart).startOf('day').add(i, 'days').toDate();
      if (this.getHoliday(day)) {
        this.holidayEvents.push({
          start: moment(day).format('YYYY-MM-DD'),
          end: moment(day).endOf('day').format('YYYY-MM-DD'),
          display: 'background',
          overlap: false,
        });
      }
    }
    this.createEvents();
  }

  /********************************************************************************************
   * 
   * Window Resize
   * 
   *******************************************************************************************/

  private handleResize(): void {
    let calendarApi = this.calendarComponent.getApi();
    calendarApi.render();
    console.log('Il calendario è stato ridimensionato.');
  }

  public handleWindowResize(arg: ViewApi): void {
    let calendarApi = this.calendarComponent.getApi();
    calendarApi.render();
    console.log('The calendar has adjusted to a window resize. Current view: ' + arg.type);
  }

  /********************************************************************************************
   * 
   * Date Click
   * 
   *******************************************************************************************/

  public handleDateClick(arg: DateClickArg): void {
    console.log('date click! ' + arg.dateStr)
  }

  /********************************************************************************************
   * 
   * Event Click
   * 
   *******************************************************************************************/

  public handleEventClick(clickInfo: EventClickArg): void {}

  /********************************************************************************************
   * 
   * Event Resize
   * 
   *******************************************************************************************/

  public async handleEventResize(resizeInfo: EventResizeDoneArg): Promise<void> {}

  /********************************************************************************************
   * 
   * Event Drop
   * 
   *******************************************************************************************/

  public async handleEventDrop(dropInfo: EventDropArg): Promise<void> {}

  /********************************************************************************************
   * 
   * Create Events
   * 
   *******************************************************************************************/

  private createEvent(): EventInput {
    const event: EventInput = {
      title: 'Important Meeting',
      description: 'Toto lorem ipsum dolor sit incid idunt ut',
      start: new Date(),
      duration: 60 * 60 * 1000,
      allDay: false,
      editable: true,
      startEditable: true,
      durationEditable: true,
    };

    return event;
  }

  /********************************************************************************************
   * 
   * Render Events
   * 
   *******************************************************************************************/

  private createEvents(): void {
    let events: EventInput[] = [this.createEvent(), this.createEvent(), this.createEvent(), this.createEvent()];
    events = [...events, ...this.holidayEvents];
    this.renderEvents(events);
  }

  // remove all events from calendar and add new event source
  private renderEvents(events: EventInput[]): void {
    const calendarApi = this.calendarComponent.getApi();
    calendarApi.removeAllEvents();
    calendarApi.addEventSource(events);
    calendarApi.render();

    this.changeDetector.detectChanges(); 
  }

  handleEvents(events: EventApi[]) {
    // this.currentEvents.set(events);
    this.changeDetector.detectChanges(); // workaround for pressionChangedAfterItHasBeenCheckedError
  }
  
}
