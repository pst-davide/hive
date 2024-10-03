import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .then(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/ngsw-worker.js')
        .then(registration => {
          console.log('Service Worker registrato con successo:', registration);
        })
        .catch(err => {
          console.error('Registrazione del Service Worker fallita:', err);
        });
    }
  })
  .catch((err) => console.error(err));
