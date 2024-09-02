import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RoomModel } from '../model/room.model';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private apiUrl = 'http://localhost:3000/api/rooms';

  constructor(private http: HttpClient) { }

  public getRooms(): Observable<RoomModel[]> {
    return this.http.get<RoomModel[]>(this.apiUrl);
  }

  public getRoomById(id: string): Observable<RoomModel> {
    return this.http.get<RoomModel>(`${this.apiUrl}/${id}`);
  }

  public createRoom(room: RoomModel): Observable<RoomModel> {
    return this.http.post<RoomModel>(this.apiUrl, room);
  }

  public updateRoom(id: string, room: RoomModel): Observable<RoomModel> {
    return this.http.put<RoomModel>(`${this.apiUrl}/${id}`, room);
  }

  public deleteRoom(id: string): Observable<RoomModel> {
    return this.http.delete<RoomModel>(`${this.apiUrl}/${id}`);
  }
}
