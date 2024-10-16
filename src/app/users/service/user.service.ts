import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CrudService} from '../../core/services/crud.service';
import axios, {AxiosResponse} from 'axios';
import {firstValueFrom} from 'rxjs';
import {User} from '../../../server/entity/user.entity';
import {UserModel} from '../model/user.model';
import moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl: string = 'http://localhost:3000/api/users';

  constructor(private http: HttpClient, private crud: CrudService) {
  }

  private toEntity(model: UserModel): User {
    const formattedDate: Date | null = model.birthDate ? moment(model.birthDate).toDate() : null;

    let doc: User = new User();
    doc.id = model.id ?? '';
    doc.email = model.email ?? '';
    doc.name = model.name ?? '';
    doc.lastname = model.lastname ?? '';
    doc.password = model.password ?? '';
    doc.role = model.role;
    doc.enabled = model.enabled ?? false;
    doc.cf = model.cf ?? '';
    doc.phone = model.phone ?? null;
    doc.birthDate = formattedDate;
    doc.birthCity = model.birthCity ?? '';
    doc.birthProvince = model.birthProvince ?? '';
    doc.currentToken = model.currentToken ?? null;
    doc.refreshToken = model.refreshToken ?? null;
    doc = this.crud.setCrudEntity(model, doc);

    return doc;
  }

  private toModel(entity: User): UserModel {
    const model: UserModel = {} as UserModel;

    model.id = entity.id;
    model.lastname = entity.lastname;
    model.name = entity.name;
    model.email = entity.email;
    model.password = entity.password;
    model.phone = entity.phone;
    model.role = entity.role;
    model.enabled = entity.enabled ?? false;
    model.currentToken = entity.currentToken ?? null;
    model.refreshToken = entity.refreshToken ?? null;
    model.cf = entity.cf ?? null;
    model.birthDate = entity.birthDate ?? null;
    model.birthCity = entity.birthCity ?? null;
    model.birthProvince = entity.birthProvince ?? null;

    model.crud = {
      createAt: entity.createdAt,
      createBy: entity.createdBy,
      modifiedAt: entity.modifiedAt,
      modifiedBy: entity.modifiedBy,
    };

    return model;
  }

  public async getDocs(): Promise<UserModel[]> {
    try {
      const response: AxiosResponse<any, any> = await axios.get<UserModel[]>(this.apiUrl);
      return response.data.map((entity: any) => this.toModel(entity));
    } catch (error) {
      console.error('Errore durante il fetch dei documenti:', error);
      throw error;
    }
  }

  public async createDoc(doc: UserModel): Promise<UserModel> {
    const entity: User = this.toEntity(doc);
    try {
      console.log(entity);
      const response: AxiosResponse<any, any> = await axios.post(this.apiUrl, entity)
      return this.toModel(response.data);
    } catch (error) {
      throw error;
    }
  }

  public async updateDoc(id: string, doc: UserModel): Promise<UserModel> {
    const entity: User = this.toEntity(doc);
    try {
      const response: AxiosResponse<any, any> = await axios.put(`${this.apiUrl}/${id}`, entity);
      return this.toModel(response.data);
    } catch (error) {
      throw error;
    }
  }

  public async deleteDoc(id: string): Promise<any> {
    try {
      const response: UserModel = await firstValueFrom(
        this.http.delete<UserModel>(`${this.apiUrl}/delete/${id}`)
      );
      console.log('Delete successful:', response);
      return response;
    } catch (error) {
      console.error('Delete failed:', error);
      throw error;
    }
  }

  public async getDoc(id: string): Promise<UserModel> {
    try {
      const response: AxiosResponse<any, any> = await axios.get<UserModel>(`${this.apiUrl}/${id}`);
      console.log(response.data)
      return this.toModel(response.data);
    } catch (error) {
      console.error('Errore durante il fetch dei documenti:', error);
      throw error;
    }
  }
}
