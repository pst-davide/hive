import { Component, OnInit } from '@angular/core';
import { RoomService } from './service/room.service';
import { RoomModel } from './model/room.model';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [],
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.scss'
})
export class RoomsComponent implements OnInit {

  public rooms: RoomModel[] = [];

  constructor(private roomService: RoomService) {}

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
}
