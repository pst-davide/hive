import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [],
  templateUrl: './notification-center.component.html',
  styleUrl: './notification-center.component.scss'
})
export class NotificationCenterComponent {
  @Input() isVisible: boolean = false;
}
