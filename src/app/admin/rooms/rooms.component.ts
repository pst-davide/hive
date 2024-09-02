import { Component, OnInit } from '@angular/core';
import { RoomService } from './service/room.service';
import {EMPTY_ROOM, RoomModel} from './model/room.model';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RoomComponent } from './edit/room/room.component';
import _ from 'lodash';
import {BreadcrumbComponent} from '../../layouts/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [
    MatDialogModule,
    BreadcrumbComponent
  ],
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.scss'
})
export class RoomsComponent implements OnInit {

  public rooms: RoomModel[] = [];

  constructor(private roomService: RoomService, public dialog: MatDialog) {}

  ngOnInit(): void {
      this.getRooms();
      const r = _.cloneDeep(EMPTY_ROOM);
      r.id = 'TST2';
      r.code = 'TST2';
      r.name = 'Test 2';
      // this.roomService.createRoom(r).subscribe(ref => {console.log(ref)});
  }

  getRooms(): void {
    this.roomService.getRooms().subscribe({
      next: (data: RoomModel[]) => {
        this.rooms = data;
        console.log(data);
      },
      error: (error) => {
        console.error('Errore durante il recupero delle stanze:', error);
      },
      complete: () => {
        console.log('Recupero stanze completato');
      }
    });
  }

  public openDialog(): void {
    this.dialog.open(RoomComponent, {
      width: '100%',
      height: '100%'
    });
  }
}
