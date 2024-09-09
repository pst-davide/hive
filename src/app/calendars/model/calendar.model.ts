import { EventInput } from "@fullcalendar/core";

export interface CalendarModel {
    id: string | null;
    name: string | null;
    typeId: string | null;
    locationId: string | null;
    resourceIds: string[];
}

export type CALENDAR = EventInput & CalendarModel & {

};

export const EMPTY_CALENDAR: CALENDAR = {
  id: '',
  name: null,
  title: 'Nuovo Evento',
  description: null,
  typeId: null,
  locationId: null,
  resourceIds: [],
  allDay: false,
  editable: true,
  startEditable: true,
  durationEditable: true,
}
