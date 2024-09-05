import { Routes } from '@angular/router';
import { RoomsComponent } from './admin/rooms/rooms.component';
import { ScanOcrComponent } from './admin/scan-ocr/scan-ocr.component';
import { CalendarsComponent } from './calendars/calendars.component';
import { LocationsComponent } from './admin/locations/locations.component';

export const routes: Routes = [
    { path: 'calendars', component: CalendarsComponent, data: { breadcrumb: 'Calendari', enabled: false }},
    { path: 'admin', component: undefined, data: { breadcrumb: 'Amministrazione', enabled: false },
    children: [
        { path: 'ocr', component: ScanOcrComponent, data: { breadcrumb: 'OCR', enabled: true } },
        { path: 'locations', component: LocationsComponent, data: { breadcrumb: 'Sedi', enabled: true } },
        { path: 'rooms', component: RoomsComponent, data: { breadcrumb: 'Stanze', enabled: true } }
      ] },
];
