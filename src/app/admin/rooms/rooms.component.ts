import { Component, OnInit } from '@angular/core';
import { RoomService } from './service/room.service';
import { RoomModel } from './model/room.model';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RoomComponent } from './edit/room/room.component';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [
    MatDialogModule
  ],
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.scss'
})
export class RoomsComponent implements OnInit {

  public rooms: RoomModel[] = [];

  constructor(private roomService: RoomService, public dialog: MatDialog) {}

  ngOnInit(): void {
      this.getRooms();
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
