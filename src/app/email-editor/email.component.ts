import {Component, ViewChild} from '@angular/core';
import {EmailEditorComponent, EmailEditorModule} from 'angular-email-editor';

@Component({
  selector: 'app-email-editor',
  standalone: true,
  imports: [
    EmailEditorModule
  ],
  templateUrl: './email.component.html',
  styleUrl: './email.component.scss'
})
export class EmailComponent {
  @ViewChild(EmailEditorComponent)
  private emailEditor!: EmailEditorComponent;

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
