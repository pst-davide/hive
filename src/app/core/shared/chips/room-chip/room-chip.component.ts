import {Component, input, InputSignal, model, ModelSignal, OnInit, ViewEncapsulation} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import {MatChipInputEvent, MatChipsModule} from '@angular/material/chips';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import {AsyncPipe, CommonModule} from '@angular/common';
import {MatInputModule} from '@angular/material/input';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';
import {MatTooltip} from '@angular/material/tooltip';
import {ROOM_TYPE} from '../../../../admin/rooms/model/room.model';
import {BranchGroup} from '../../autocomplete/room-autocomplete/room-autocomplete.component';
import {RoomService} from '../../../../admin/rooms/service/room.service';
import _ from 'lodash';

@Component({
  selector: 'app-room-chip',
  standalone: true,
  imports: [
    CommonModule,
    MatInputModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    AsyncPipe,
    ReactiveFormsModule,
    MatIcon,
    MatIconButton,
    MatTooltip,
    MatChipsModule
  ],
  templateUrl: './room-chip.component.html',
  styleUrls: ['./room-chip.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RoomChipComponent implements OnInit {

  public doc$: ModelSignal<string | null> = model<string | null>(null);
  public label: InputSignal<string> = input<string>('Spazio');
  public requiredError: InputSignal<string> = input<string>(`Il campo <strong>spazio</strong> è obbligatorio`);
  public matchError: InputSignal<string> = input<string>(`Seleziona uno <strong>spazio</strong> valido`);
  public isRequired: InputSignal<boolean> = input<boolean>(false);
  public isEnabled: InputSignal<boolean> = input<boolean>(true);

  private rooms: ROOM_TYPE[] = [];
  public roomControl: FormControl = new FormControl([]);

  public branchGroups: BranchGroup[] = [];
  public branchGroupOptions!: Observable<BranchGroup[]>;

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(private crudService: RoomService) { }

  ngOnInit() {
    this.getCollection().then(() => {});
  }

  private async getCollection(id: string | null = null): Promise<void> {
    try {
      this.rooms = await this.crudService.getDocs(id);
      this.branchGroups = this.setGroup(this.rooms);

      this.branchGroupOptions = this.roomControl.valueChanges.pipe(
        startWith(''),
        map(value => this._filterGroup(value || ''))
      );
    } catch (error) {
      console.error('Errore durante il caricamento dei documenti:', error);
    }
  }

  public add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Aggiungi il valore se non è vuoto e non è già presente
    if (value && !this.roomControl.value.includes(value)) {
      this.roomControl.setValue([...this.roomControl.value, value]);
    }

    // Resetta il campo di input
    event.input!.value = '';
  }

  public remove(room: ROOM_TYPE): void {
    const currentRooms = this.roomControl.value.slice();
    const index = currentRooms.indexOf(room.id);

    if (index >= 0) {
      currentRooms.splice(index, 1);
      this.roomControl.setValue(currentRooms);
    }
  }

  private setGroup(rooms: ROOM_TYPE[]): BranchGroup[] {
    const groupedByLocation: _.Dictionary<ROOM_TYPE[]> = _.groupBy(rooms, 'locationId');

    return _.map(groupedByLocation, (rooms, locationId) => {
      const firstRoom: ROOM_TYPE = rooms[0];

      return {
        branchId: locationId || '',
        branchCode: firstRoom.code || '',
        branchName: firstRoom.VIEW_LOCATION_NAME || '',
        rooms: _.map(rooms, room => ({
          id: room.id || '',
          code: room.code || '',
          name: room.name || '',
          color: room.VIEW_COLOR || ''
        }))
      };
    });
  }

  private _filterGroup(value: string): BranchGroup[] {
    const filterValue: string = value.toLowerCase();

    return this.branchGroups
      .map((group: BranchGroup) => ({
        ...group,
        rooms: _.filter(group.rooms, room =>
          room.name.toLowerCase().includes(filterValue)
        )
      }))
      .filter(group => group.rooms.length > 0);
  }

  public displayRoom(code: string): string {
    if (!this.rooms) {
      return '';
    }

    const room: ROOM_TYPE | null = this.rooms.find((room: ROOM_TYPE) => room.code === code) ?? null;
    return room ? `${room.name} | ${room.code}` : '';
  }

}
