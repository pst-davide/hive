import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {ROOM_TYPE, RoomModel} from '../model/room.model';
import {Room} from '../../../../server/entity/room.entity';
import axios, {AxiosResponse} from 'axios';

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
  room.createdAt = model.crud.createAt ?? new Date();
  room.createdBy = model.crud.createBy ?? null;
  room.modifiedAt = model.crud.modifiedAt ?? new Date();
  room.modifiedBy = model.crud.modifiedBy ?? null;

  return room;
}

  private toModel(entity: any): ROOM_TYPE {
    const model: ROOM_TYPE = {} as ROOM_TYPE;
    model.id = entity.id;
    model.code = entity.code;
    model.name = entity.name;
    model.description = entity.description;
    model.capacity = entity.capacity;
    model.owners = entity.owners;
    model.floor = entity.floor;
    model.enabled = entity.enabled;
    model.crud = {
      createAt: entity.createdAt,
      createBy: entity.createdBy,
      modifiedAt: entity.modifiedAt,
      modifiedBy: entity.modifiedBy,
    };

    return model;
  }

  public async getDocs(id: string | null): Promise<ROOM_TYPE[]> {
    try {
      const response: AxiosResponse<any, any> = await axios.get(`${this.apiUrl}${(id ? '?locationId=' + id : '')}`);
      return response.data.map((entity: any) => this.toModel(entity));
    } catch (error) {
      console.error('Errore durante il fetch dei documenti:', error);
      throw error;
    }
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

  public async hasRoom(locationId: string): Promise<boolean> {
    try {
      const response: AxiosResponse<any, any> = await axios.get(`${this.apiUrl}/location/${locationId}`);
      return response.data.length > 0;
    } catch (error) {
      console.error('Errore durante il controllo delle room associate:', error);
      throw error;
    }
  }
}
