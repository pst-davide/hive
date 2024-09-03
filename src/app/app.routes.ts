import { Routes } from '@angular/router';
import { RoomsComponent } from './admin/rooms/rooms.component';
import { ScanOcrComponent } from './admin/scan-ocr/scan-ocr.component';
import { CalendarsComponent } from './calendars/calendars.component';

export const routes: Routes = [
    { path: 'calendars', component: CalendarsComponent, data: { breadcrumb: 'Calendari', enalbed: false }},
    { path: 'admin', component: RoomsComponent, data: { breadcrumb: 'Amministrazione', enalbed: false },
    children: [
        { path: 'rooms', component: RoomsComponent, data: { breadcrumb: 'Stanze', enalbed: true } },
        { path: 'ocr', component: ScanOcrComponent, data: { breadcrumb: 'OCR', enalbed: true } }
      ] },
    
];
