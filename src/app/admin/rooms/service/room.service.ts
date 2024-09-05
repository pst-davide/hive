import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RoomModel } from '../model/room.model';
import {Room} from '../../../../server/entity/room.entity';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private apiUrl: string = 'http://localhost:3000/api/rooms';

  constructor(private http: HttpClient) { }

  private toRoomEntity(model: RoomModel): Room {
  const room: Room = new Room();
  room.id = model.id ?? '';
  room.code = model.code ?? '';
  room.name = model.name ?? '';
  room.description = model.description ?? null;
  room.capacity = model.capacity;
  room.owners = model.owners;
  room.floor = model.floor;
  room.enabled = model.enabled;
  room.street = model.address?.street ?? null;
  room.city = model.address?.city ?? null;
  room.province = model.address?.province ?? null;
  room.zip = model.address?.zip ?? null;
  room.latitude = model.address?.latitude ?? 0;
  room.longitude = model.address?.longitude ?? 0;
  room.createdAt = model.crud.createAt ?? new Date();
  room.createdBy = model.crud.createBy ?? null;
  room.modifiedAt = model.crud.modifiedAt ?? new Date();
  room.modifiedBy = model.crud.modifiedBy ?? null;

  return room;
}

  public getDocs(): Observable<RoomModel[]> {
    return this.http.get<RoomModel[]>(this.apiUrl);
  }

  public getById(id: string): Observable<RoomModel> {
    return this.http.get<RoomModel>(`${this.apiUrl}/${id}`);
  }

  public createDoc(doc: RoomModel): Observable<RoomModel> {
    const entity: Room = this.toRoomEntity(doc);
    return this.http.post<RoomModel>(this.apiUrl, entity);
  }

  public updateDoc(id: string, doc: RoomModel): Observable<RoomModel> {
    return this.http.put<RoomModel>(`${this.apiUrl}/${id}`, doc);
  }

  public deleteDoc(id: string): Observable<RoomModel> {
    return this.http.delete<RoomModel>(`${this.apiUrl}/${id}`);
  }
}
