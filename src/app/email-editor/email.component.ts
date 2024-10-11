import {Component, OnInit, ViewEncapsulation} from '@angular/core';

import grapesjs from 'grapesjs';
import plugin from '.';
import itTranslation from './utils/it';

@Component({
  selector: 'app-email-editor',
  standalone: true,
  imports: [],
  templateUrl: './email.component.html',
  styleUrl: './email.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class EmailComponent implements OnInit {
  private editor: any;

  ngOnInit(): void {
    this.initializeGrapesJS();
  }

  private initializeGrapesJS() {
    this.editor = grapesjs.init({
      container: '#gjs',
      height: '100vh',
      width: 'auto',
      plugins: [plugin, 'grapesjs-template-manager'],
      i18n: {
        locale: 'it',
        detectLocale: true,
        messages: {
          it: itTranslation,
        },
      },
      storageManager: {
        id: 'gjs', // Id per la gestione dello storage
        type: 'local', // Local storage
        autosave: true, // Salvataggio automatico
        autoload: true, // Carica i dati all'inizio
      },
    });
  }

}
