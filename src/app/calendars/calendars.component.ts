import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, ViewApi } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import itLocale from '@fullcalendar/core/locales/it';

@Component({
  selector: 'app-calendars',
  standalone: true,
  imports: [FullCalendarModule],
  templateUrl: './calendars.component.html',
  styleUrl: './calendars.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class CalendarsComponent {

  @ViewChild('calendar')
  calendarComponent!: FullCalendarComponent;

  public calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    aspectRatio: 2.5,
    locale: itLocale,
    weekNumbers: true,
    headerToolbar: {
      right: 'today,prev,next dayGridMonth,timeGridWeek,timeGridDay'
    },
    dateClick: (arg) => this.handleDateClick(arg),
    windowResize: (arg) => this.handleWindowResize(arg.view),
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin]
  };

  public handleDateClick(arg: DateClickArg): void {
    console.log('date click! ' + arg.dateStr)
  }

  public handleWindowResize(arg: ViewApi): void {
    let calendarApi = this.calendarComponent.getApi();
    console.log('The calendar has adjusted to a window resize. Current view: ' + arg.type);
  }
}
