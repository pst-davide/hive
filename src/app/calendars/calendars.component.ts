import { Component, ViewEncapsulation } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';

@Component({
  selector: 'app-calendars',
  standalone: true,
  imports: [FullCalendarModule],
  templateUrl: './calendars.component.html',
  styleUrl: './calendars.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class CalendarsComponent {
  public calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    aspectRatio: 2.5,
    dateClick: (arg) => this.handleDateClick(arg),
    plugins: [dayGridPlugin, interactionPlugin]
  };

  public handleDateClick(arg: DateClickArg): void {
    console.log('date click! ' + arg.dateStr)
  }
}
