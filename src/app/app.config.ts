import { ApplicationConfig, importProvidersFrom, LOCALE_ID, provideZoneChangeDetection, isDevMode } from '@angular/core';
import {provideRouter, RouteReuseStrategy} from '@angular/router';

import { routes } from './app.routes';
import {HTTP_INTERCEPTORS, provideHttpClient, withInterceptors} from '@angular/common/http';

import { provideAnimations } from '@angular/platform-browser/animations';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { registerLocaleData } from '@angular/common';
import localeIt from '@angular/common/locales/it';
import {provideServiceWorker} from '@angular/service-worker';

import { MatPaginatorIntl } from '@angular/material/paginator';
import {ItPaginator} from "./core/functions/it-paginator";
import {provideEnvironmentNgxMask} from "ngx-mask";
import {provideHotToastConfig} from "@ngxpert/hot-toast";
import {LoaderService} from "./core/services/loader.service";
import {NavigationService} from "./core/services/navigation.service";
import {LoaderInterceptor} from "./core/functions/loader.interceptor";
import {CustomReuseStrategy} from './core/functions/custom-reuse-strategy';

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
    provideHotToastConfig({
      dismissible: true,
      autoClose: true,
      position: 'top-right',
    }),
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
    LoaderService,
    NavigationService,
    LoaderInterceptor,
    { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true },
    { provide: RouteReuseStrategy, useClass: CustomReuseStrategy },
  ]
};

