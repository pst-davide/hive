import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BranchModel} from '../model/branchModel';
import {Branch} from '../../../../server/entity/location.entity';
import {firstValueFrom} from 'rxjs';
import axios, {AxiosResponse} from 'axios';
import {CrudService} from '../../../core/services/crud.service';

@Injectable({
  providedIn: 'root'
})
export class BranchService {

  private apiUrl: string = 'http://localhost:3000/api/locations';

  constructor(private http: HttpClient, private crud: CrudService) {
  }

  private getHeaders():  {Authorization: string} {
    const token: string | null = localStorage.getItem('accessToken');
    return {
      'Authorization': `Bearer ${token}`
    };
  }

  private toEntity(model: BranchModel): Branch {
    let doc: Branch = new Branch();
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
    doc = this.crud.setCrudEntity(model, doc);

    return doc;
  }

  private toModel(entity: Branch): BranchModel {
    const model: BranchModel = {} as BranchModel;

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

  public async getDocs(): Promise<BranchModel[]> {
    try {
      const headers: {Authorization: string} = this.getHeaders();

      const response: AxiosResponse<any, any> = await axios.get<BranchModel[]>(this.apiUrl, { headers });
      return response.data.map((entity: any) => this.toModel(entity));
    } catch (error) {
      console.error('Errore durante il fetch dei documenti:', error);
      throw error;
    }
  }

  public async createDoc(doc: BranchModel): Promise<BranchModel> {
    const entity: Branch = this.toEntity(doc);
    try {
      const headers: {Authorization: string} = this.getHeaders();

      const response: AxiosResponse<any, any> = await axios.post(this.apiUrl, entity, { headers })
      return this.toModel(response.data);
    } catch (error) {
      throw error;
    }
  }

  public async updateDoc(id: string, doc: BranchModel): Promise<BranchModel> {
    const entity: Branch = this.toEntity(doc);
    try {
      const headers: {Authorization: string} = this.getHeaders();

      const response: AxiosResponse<any, any> = await axios.put(`${this.apiUrl}/${id}`, entity, { headers });
      return this.toModel(response.data);
    } catch (error) {
      throw error;
    }
  }

  public async deleteDoc(id: string): Promise<any> {
    try {
      const headers: {Authorization: string} = this.getHeaders();

      const response: BranchModel = await firstValueFrom(
        this.http.delete<BranchModel>(`${this.apiUrl}/delete/${id}`, { headers })
      );
      console.log('Delete successful:', response);
      return response;
    } catch (error) {
      console.error('Delete failed:', error);
      throw error;
    }
  }

  public async getDoc(id: string): Promise<BranchModel> {
    try {
      const headers: {Authorization: string} = this.getHeaders();

      const response: AxiosResponse<any, any> = await axios.get<BranchModel>(`${this.apiUrl}/${id}`, { headers });
      console.log(response.data)
      return this.toModel(response.data);
    } catch (error) {
      console.error('Errore durante il fetch dei documenti:', error);
      throw error;
    }
  }
}
