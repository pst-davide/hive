import { EventInput } from "@fullcalendar/core";
import { DEFAULT_CALENDAR_BACKGROUND } from "app/core/functions/environments";

export interface CalendarModel {
    id: string | null;
    code: string | null;
    shiftId: string | null;
    resourceIds: string[];
    status: number;
    duration: number;
    customerId: string | null;
}

export type CALENDAR = EventInput & CalendarModel & {

};

export const EMPTY_CALENDAR: CALENDAR = {
  id: '',
  code: null,
  title: 'Nuovo Evento',
  description: 'Descrizione evento',
  shiftId: null,
  resourceIds: [],
  customerId: null,
  allDay: false,
  editable: true,
  startEditable: true,
  durationEditable: true,
  status: 1,
  duration: 60,
  backgroundColor: DEFAULT_CALENDAR_BACKGROUND
}
