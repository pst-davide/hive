import { ApplicationConfig, importProvidersFrom, LOCALE_ID, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';

import { provideAnimations } from '@angular/platform-browser/animations';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { registerLocaleData } from '@angular/common';
import localeIt from '@angular/common/locales/it';
import {provideServiceWorker} from '@angular/service-worker';

import { MatPaginatorIntl } from '@angular/material/paginator';
import {ItPaginator} from "./core/functions/it-paginator";
import {provideEnvironmentNgxMask} from "ngx-mask";

registerLocaleData(localeIt);

export const IT_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideAnimationsAsync(),
    provideAnimations(),
    provideEnvironmentNgxMask(),
    { provide: LOCALE_ID, useValue: 'it' },
    { provide: MAT_DATE_LOCALE, useValue: 'it' },
    { provide: MatPaginatorIntl, useClass: ItPaginator },
    importProvidersFrom(MatNativeDateModule), provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          }), provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          }),
  ]
};

