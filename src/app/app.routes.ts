import {Routes} from '@angular/router';
import {RoomsComponent} from './admin/rooms/rooms.component';
import {ScanOcrComponent} from './admin/scan-ocr/scan-ocr.component';
import {CalendarsComponent} from './calendars/calendars.component';
import {LocationsComponent} from './admin/locations/locations.component';
import {UsersComponent} from './users/users.component';
import {EmailComponent} from './email-editor/email.component';
import {PressCategoriesComponent} from './admin/press/press-categories/press-categories.component';
import {PressKeywordsComponent} from './admin/press/press-keywords/press-keywords.component';

export const routes: Routes = [
  { path: 'calendars', component: CalendarsComponent, data: { breadcrumb: 'Calendari', enabled: true } },
  { path: 'email-editor', component: EmailComponent, data: { breadcrumb: 'Email Editor', enabled: true } },
  {
    path: 'admin', component: undefined, data: { breadcrumb: 'Amministrazione', enabled: false },
    children: [
      { path: 'ocr', component: ScanOcrComponent, data: { breadcrumb: 'OCR', enabled: true } },
      {
        path: 'press/categories', component: PressCategoriesComponent, data: { breadcrumb: 'Argomenti di Interesse', enabled: true },
        children: [
          { path: 'keywords', component: PressKeywordsComponent, data: { breadcrumb: 'Parole Chiave', enabled: true } }
        ]
      },
      { path: 'locations', component: LocationsComponent, data: { breadcrumb: 'Sedi', enabled: true },
        children: [
          { path: 'rooms', component: RoomsComponent, data: { breadcrumb: 'Stanze', enabled: true } }
        ]
      },
      { path: 'users', component: UsersComponent, data: { breadcrumb: 'Utenti', enabled: true } }
    ]
  },
];

