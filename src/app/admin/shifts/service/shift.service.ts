import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CrudService} from '../../../core/services/crud.service';
import axios, {AxiosInstance, AxiosResponse} from 'axios';
import {firstValueFrom} from 'rxjs';
import {ShiftModel} from '../model/shift.model';
import {Shift} from '../../../../server/entity/shift.entity';
import {AuthService} from '../../../core/services/auth.service';
import {AxiosInterceptor} from '../../../core/functions/axios.interceptor';

@Injectable({
  providedIn: 'root'
})
export class ShiftService {

  private apiUrl: string = 'http://localhost:3000/api/shifts';
  private apiClient: AxiosInstance;

  constructor(private http: HttpClient, private crud: CrudService, private authService: AuthService) {
    const axiosInterceptor: AxiosInterceptor = new AxiosInterceptor(this.authService);
    this.apiClient = axiosInterceptor.getApiClient();
  }

  private getHeaders():  {Authorization: string} {
    const token: string | null = localStorage.getItem('accessToken');
    return {
      'Authorization': `Bearer ${token}`
    };
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
      createdAt: entity.createdAt,
      createBy: entity.createdBy,
      updatedAt: entity.modifiedAt,
      modifiedBy: entity.modifiedBy,
    };

    return model;
  }

  public async getDocs(): Promise<ShiftModel[]> {
    try {
      const response: AxiosResponse<any, any> = await this.apiClient.get('/shifts');
      return response.data.map((entity: any) => this.toModel(entity));
    } catch (error: any) {
      console.error('Errore durante il fetch dei documenti:', error);
      throw error;
    }
  }

  public async createDoc(doc: ShiftModel): Promise<ShiftModel> {
    const headers: {Authorization: string} = this.getHeaders();

    const entity: Shift = this.toEntity(doc);
    try {
      const response: AxiosResponse<any, any> = await axios.post(this.apiUrl, entity, { headers })
      return this.toModel(response.data);
    } catch (error) {
      throw error;
    }
  }

  public async updateDoc(id: string, doc: ShiftModel): Promise<ShiftModel> {
    const headers: {Authorization: string} = this.getHeaders();

    const entity: Shift = this.toEntity(doc);
    try {
      const response: AxiosResponse<any, any> = await axios.put(`${this.apiUrl}/${id}`, entity, { headers });
      return this.toModel(response.data);
    } catch (error) {
      throw error;
    }
  }

  public async deleteDoc(id: string): Promise<any> {
    const headers: {Authorization: string} = this.getHeaders();

    try {
      const response: ShiftModel = await firstValueFrom(
        this.http.delete<ShiftModel>(`${this.apiUrl}/delete/${id}`, { headers })
      );
      console.log('Delete successful:', response);
      return response;
    } catch (error) {
      console.error('Delete failed:', error);
      throw error;
    }
  }

  public async getDoc(id: string): Promise<ShiftModel> {
    const headers: {Authorization: string} = this.getHeaders();

    try {
      const response: AxiosResponse<any, any> = await axios.get<ShiftModel>(`${this.apiUrl}/${id}`, { headers });
      console.log(response.data)
      return this.toModel(response.data);
    } catch (error) {
      console.error('Errore durante il fetch dei documenti:', error);
      throw error;
    }
  }
}
