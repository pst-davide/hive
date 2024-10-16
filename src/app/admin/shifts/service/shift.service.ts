import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CrudService} from '../../../core/services/crud.service';
import axios, {AxiosResponse} from 'axios';
import {firstValueFrom} from 'rxjs';
import {ShiftModel} from '../model/shift.model';
import {Shift} from '../../../../server/entity/shift.entity';

@Injectable({
  providedIn: 'root'
})
export class ShiftService {

  private apiUrl: string = 'http://localhost:3000/api/shifts';

  constructor(private http: HttpClient, private crud: CrudService) {
  }

  private toEntity(model: ShiftModel): Shift {
    let doc: Shift = new Shift();
    doc.id = model.id ?? '';
    doc.code = model.code ?? '';
    doc.name = model.name ?? '';
    doc.color = model.color ?? '';
    doc = this.crud.setCrudEntity(model, doc);

    return doc;
  }

  private toModel(entity: Shift): ShiftModel {
    const model: ShiftModel = {} as ShiftModel;

    model.id = entity.id;
    model.code = entity.code;
    model.name = entity.name;
    model.color = entity.color;

    model.crud = {
      createAt: entity.createdAt,
      createBy: entity.createdBy,
      modifiedAt: entity.modifiedAt,
      modifiedBy: entity.modifiedBy,
    };

    return model;
  }

  public async getDocs(): Promise<ShiftModel[]> {
    try {
      const token: string | null = localStorage.getItem('accessToken');
      const headers: {Authorization: string} = {
        'Authorization': `Bearer ${token}`
      };

      const response: AxiosResponse<any, any> = await axios.get<ShiftModel[]>(this.apiUrl, { headers });
      return response.data.map((entity: any) => this.toModel(entity));
    } catch (error) {
      console.error('Errore durante il fetch dei documenti:', error);
      throw error;
    }
  }

  public async createDoc(doc: ShiftModel): Promise<ShiftModel> {
    const entity: Shift = this.toEntity(doc);
    try {
      const response: AxiosResponse<any, any> = await axios.post(this.apiUrl, entity)
      return this.toModel(response.data);
    } catch (error) {
      throw error;
    }
  }

  public async updateDoc(id: string, doc: ShiftModel): Promise<ShiftModel> {
    const entity: Shift = this.toEntity(doc);
    try {
      const response: AxiosResponse<any, any> = await axios.put(`${this.apiUrl}/${id}`, entity);
      return this.toModel(response.data);
    } catch (error) {
      throw error;
    }
  }

  public async deleteDoc(id: string): Promise<any> {
    try {
      const response: ShiftModel = await firstValueFrom(
        this.http.delete<ShiftModel>(`${this.apiUrl}/delete/${id}`)
      );
      console.log('Delete successful:', response);
      return response;
    } catch (error) {
      console.error('Delete failed:', error);
      throw error;
    }
  }

  public async getDoc(id: string): Promise<ShiftModel> {
    try {
      const response: AxiosResponse<any, any> = await axios.get<ShiftModel>(`${this.apiUrl}/${id}`);
      console.log(response.data)
      return this.toModel(response.data);
    } catch (error) {
      console.error('Errore durante il fetch dei documenti:', error);
      throw error;
    }
  }
}
