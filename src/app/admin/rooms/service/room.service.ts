import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {firstValueFrom} from 'rxjs';
import {ROOM_TYPE, RoomModel} from '../model/room.model';
import {Room} from '../../../../server/entity/room.entity';
import axios, {AxiosResponse} from 'axios';
import {DEFAULT_LOCATION_COLOR} from '../../../core/functions/environments';

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
  room.color = model.color ?? DEFAULT_LOCATION_COLOR;
  room.enabled = model.enabled;
  room.locationId = model.locationId ?? '';
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
    model.color = entity.color ?? DEFAULT_LOCATION_COLOR;
    model.capacity = entity.capacity;
    model.owners = entity.owners;
    model.floor = entity.floor;
    model.enabled = entity.enabled;
    model.locationId = entity.locationId;
    model.crud = {
      createAt: entity.createdAt,
      createBy: entity.createdBy,
      modifiedAt: entity.modifiedAt,
      modifiedBy: entity.modifiedBy,
    };

    model.VIEW_LOCATION_NAME = entity.locationName ?? null;
    model.VIEW_COLOR = entity.locationColor ?? null;

    return model;
  }

  public async getDocs(id: string | null): Promise<ROOM_TYPE[]> {
    try {
      const param: string | null = id && id !== '' ? id : null;
      const response: AxiosResponse<any, any> = await axios.get(`${this.apiUrl}${(param ? '?locationId=' + param : '')}`);
      return response.data.map((entity: any) => this.toModel(entity));
    } catch (error) {
      console.error('Errore durante il fetch dei documenti:', error);
      throw error;
    }
  }

  public async createDoc(doc: ROOM_TYPE): Promise<ROOM_TYPE> {
    const entity: Room = this.toRoomEntity(doc);

    try {
      const response: AxiosResponse<any, any> = await axios.post(`${this.apiUrl}`, entity);
      return this.toModel(response.data);
    } catch (error) {
      console.log(error)
      throw error;
    }
  }

  public async updateDoc(id: string, doc: ROOM_TYPE): Promise<ROOM_TYPE> {
    const entity: Room = this.toRoomEntity(doc);

    try {
      const response: AxiosResponse<any, any> = await axios.put(`${this.apiUrl}/${id}`, entity);
      return this.toModel(response.data);
    } catch (error) {
      throw error;
    }
  }

  public async deleteDoc(id: string): Promise<any> {
    try {
      const response: ROOM_TYPE = await firstValueFrom(
        this.http.delete<ROOM_TYPE>(`${this.apiUrl}/delete/${id}`)
      );
      console.log('Delete successful:', response);
      return response;
    } catch (error) {
      console.error('Delete failed:', error);
      throw error;
    }
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
