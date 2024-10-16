import {Routes} from '@angular/router';
import {RoomsComponent} from './admin/rooms/rooms.component';
import {ScanOcrComponent} from './admin/scan-ocr/scan-ocr.component';
import {CalendarsComponent} from './calendars/calendars.component';
import {UsersComponent} from './users/users.component';
import {EmailComponent} from './email-editor/email.component';
import {PressCategoriesComponent} from './admin/press/press-categories/press-categories.component';
import {PressKeywordsComponent} from './admin/press/press-keywords/press-keywords.component';
import {BranchesComponent} from './admin/branches/branches.component';
import {NewsletterChannelsComponent} from './admin/newsletters/newsletter-channels/newsletter-channels.component';
import {ShiftsComponent} from './admin/shifts/shifts.component';
import {LoginComponent} from './layouts/login/login.component';
import {AuthGuardService} from './core/services/auth-guard.service';
import {ProfileComponent} from './users/profile/profile.component';
import {NotFoundComponent} from './layouts/not-found/not-found.component';

export const routes: Routes = [
  { path: 'calendars', component: CalendarsComponent, data: { breadcrumb: 'Calendari', enabled: true }, canActivate: [AuthGuardService] },
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
      { path: 'locations', component: BranchesComponent, data: { breadcrumb: 'Sedi', enabled: true },
        children: [
          { path: 'rooms', component: RoomsComponent, data: { breadcrumb: 'Spazi', enabled: true } }
        ]
      },
      { path: 'newsletter/lists', component: NewsletterChannelsComponent, data: { breadcrumb: 'Liste di Distribuzione', enabled: true } },
      { path: 'shifts', component: ShiftsComponent, data: { breadcrumb: 'Causali', enabled: true } },
      { path: 'users', component: UsersComponent, data: { breadcrumb: 'Utenti', enabled: true } }
    ]
  },
  { path: 'login', component: LoginComponent, data: { breadcrumb: 'Login', enabled: true } },
  { path: 'profile', component: ProfileComponent, data: { breadcrumb: 'Profilo Utente', enabled: true } },
  { path: '**', component: NotFoundComponent }
];

