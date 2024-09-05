import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EMPTY_LOCATION, LocationModel } from './model/location.model';
import _ from 'lodash';
import { RoomComponent } from '../rooms/edit/room/room.component';
import { LocationService } from './service/location.service';
import { LocationComponent } from './edit/location/location.component';

@Component({
  selector: 'app-locations',
  standalone: true,
  imports: [],
  templateUrl: './locations.component.html',
  styleUrl: './locations.component.scss'
})
export class LocationsComponent implements OnInit {

  public docs: LocationModel[] = [];

  constructor(private crudService: LocationService, public dialog: MatDialog) {}

  ngOnInit(): void {
      this.getDocs();
      const r = _.cloneDeep(EMPTY_LOCATION);
      r.id = 'TST2';
      r.code = 'TST2';
      r.name = 'Test 2';
      // this.roomService.createRoom(r).subscribe(ref => {console.log(ref)});
  }

  getDocs(): void {
    this.crudService.getDocs().subscribe({
      next: (data: LocationModel[]) => {
        this.docs = data;
        console.log(data);
      },
      error: (error) => {
        console.error('Errore durante il recupero dei documenti:', error);
      },
      complete: () => {
        console.log('Recupero documenti completato');
      }
    });
  }

  public openDialog(): void {
    this.dialog.open(LocationComponent, {
      width: '100%',
      height: '100%',
      data: {doc: {}}
    });
  }

}
