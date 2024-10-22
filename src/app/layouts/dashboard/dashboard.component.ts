import {Component, model, ModelSignal} from '@angular/core';
import {RoomChipComponent} from '../../core/shared/chips/room-chip/room-chip.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RoomChipComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  public doc$: ModelSignal<string[]> = model<string[]>([]);

  constructor() {
    this.doc$.subscribe((docs: string[]) => {
      console.log('Modifiche a doc$:', docs);
      // Puoi eseguire altre azioni qui
    });
  }

}
