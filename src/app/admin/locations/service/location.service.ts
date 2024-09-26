import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {LocationModel} from '../model/location.model';
import {Location} from '../../../../server/entity/location.entity';
import {firstValueFrom, Observable} from 'rxjs';
import axios, {AxiosResponse} from 'axios';
import {PRESS_CATEGORY_TYPE} from '../../press/model/press-category.model';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  private apiUrl: string = 'http://localhost:3000/api/locations';

  constructor(private http: HttpClient) {
  }

  private toEntity(model: LocationModel): Location {
    const doc: Location = new Location();
    doc.id = model.id ?? '';
    doc.code = model.code ?? '';
    doc.name = model.name ?? '';
    doc.color = model.color ?? '';
    doc.description = model.description ?? null;
    doc.phone = model.phone ?? '';
    doc.email = model.email ?? '';
    doc.enabled = model.enabled;
    doc.street = model.address?.street ?? null;
    doc.city = model.address?.city ?? null;
    doc.province = model.address?.province ?? null;
    doc.zip = model.address?.zip ?? null;
    doc.latitude = model.address?.latitude ?? 0;
    doc.longitude = model.address?.longitude ?? 0;
    doc.createdAt = model.crud.createAt ?? new Date();
    doc.createdBy = model.crud.createBy ?? null;
    doc.modifiedAt = model.crud.modifiedAt ?? new Date();
    doc.modifiedBy = model.crud.modifiedBy ?? null;

    return doc;
  }

  private toModel(entity: Location): LocationModel {
    const model: LocationModel = {} as LocationModel;

    model.id = entity.id;
    model.code = entity.code;
    model.name = entity.name;
    model.color = entity.color;
    model.description = entity.description;
    model.enabled = entity.enabled;
    model.phone = entity.phone;
    model.email = entity.email;

    model.address = {
      latitude: entity.latitude,
      longitude: entity.longitude,
      street: entity.street,
      city: entity.city,
      province: entity.province,
      zip: entity.zip
    };

    model.crud = {
      createAt: entity.createdAt,
      createBy: entity.createdBy,
      modifiedAt: entity.modifiedAt,
      modifiedBy: entity.modifiedBy,
    };

    return model;
  }

  public async getDocs(): Promise<LocationModel[]> {
    try {
      const response: AxiosResponse<any, any> = await axios.get<PRESS_CATEGORY_TYPE[]>(this.apiUrl);
      return response.data.map((entity: any) => this.toModel(entity));
    } catch (error) {
      console.error('Errore durante il fetch dei documenti:', error);
      throw error;
    }
  }

  public getById(id: string): Observable<LocationModel> {
    return this.http.get<LocationModel>(`${this.apiUrl}/${id}`);
  }

  public async createDoc(doc: LocationModel): Promise<LocationModel> {
    const entity: Location = this.toEntity(doc);
    try {
      const response: AxiosResponse<any, any> = await axios.post(this.apiUrl, entity)
      return this.toModel(response.data);
    } catch (error) {
      throw error;
    }
  }

  public async updateDoc(id: string, doc: LocationModel): Promise<LocationModel> {
    const entity: Location = this.toEntity(doc);
    try {
      const response: AxiosResponse<any, any> = await axios.put(`${this.apiUrl}/${id}`, entity);
      return this.toModel(response.data);
    } catch (error) {
      throw error;
    }
  }

  public async deleteDoc(id: string): Promise<any> {
    try {
      const response: LocationModel = await firstValueFrom(
        this.http.delete<LocationModel>(`${this.apiUrl}/delete/${id}`)
      );
      console.log('Delete successful:', response);
      return response;
    } catch (error) {
      console.error('Delete failed:', error);
      throw error;
    }
  }
}
