import {Component, OnInit, ViewChild} from '@angular/core';
import {EmailEditorComponent, EmailEditorModule} from 'angular-email-editor';
import grapesjs from 'grapesjs';

@Component({
  selector: 'app-email-editor',
  standalone: true,
  imports: [
    EmailEditorModule
  ],
  templateUrl: './email.component.html',
  styleUrl: './email.component.scss'
})
export class EmailComponent implements OnInit {
  @ViewChild(EmailEditorComponent)
  private emailEditor!: EmailEditorComponent;

  private editor: any;

  ngOnInit(): void {
    this.initializeGrapesJS();
  }

  private initializeGrapesJS() {
    this.editor = grapesjs.init({
      container: '#editor',
      height: '100vh',
      width: 'auto',
      plugins: ['gjs-blocks-basic', 'gjs-plugin-quill'],
      pluginsOpts: {
        'gjs-plugin-ckeditor': {
          editor: {
            toolbar: [
              { name: 'basicstyles', items: ['Bold', 'Italic'] },
              { name: 'paragraph', items: ['NumberedList', 'BulletedList'] },
              { name: 'insert', items: ['Image', 'Table'] },
            ],
          },
        },
      },
      storageManager: {
        id: 'gjs', // Id per la gestione dello storage
        type: 'local', // Local storage
        autosave: true, // Salvataggio automatico
        autoload: true, // Carica i dati all'inizio
      },
    });

    this.editor.BlockManager.add('text-block', {
      label: 'Text',
      content: '<div data-gjs-type="text">Insert your text here</div>',
      category: 'Basic',
    });

    this.editor.BlockManager.add('image-block', {
      label: 'Image',
      content: '<img src="https://via.placeholder.com/150" alt="Placeholder" />',
      category: 'Basic',
    });

    this.editor.BlockManager.add('button-block', {
      label: 'Button',
      content: '<button class="btn">Click Me!</button>',
      category: 'Basic',
    });
  }

  public editorLoaded($event: any): void {
    console.log('editorLoaded');
    // load the design json here
    // this.emailEditor.editor.loadDesign({});
  }

  // called when the editor has finished loading
  public editorReady($event: any): void {
    console.log('editorReady');
  }

  public exportHtml(): void {
    this.emailEditor.editor.exportHtml((data) =>
      console.log('exportHtml', data)
    );
  }
}
