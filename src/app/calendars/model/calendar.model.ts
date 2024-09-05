import { EventInput } from "@fullcalendar/core";

export interface CalendarModel {
    id: string | null;
    name: string | null;
}

export type CALENDAR = EventInput & {

};
