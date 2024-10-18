import {Component, EventEmitter, Output} from '@angular/core';
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import {FaIconComponent, IconDefinition} from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-dialog-close-button',
  standalone: true,
  imports: [
    FaIconComponent
  ],
  templateUrl: './dialog-close-button.component.html',
  styleUrl: './dialog-close-button.component.scss'
})
export class DialogCloseButtonComponent {
  @Output('close') closeToggle: EventEmitter<boolean> = new EventEmitter<boolean>();
  protected readonly faTimes: IconDefinition = faTimes;

  _closeDialog(): void {
    this.closeToggle.emit(true);
  }
}
