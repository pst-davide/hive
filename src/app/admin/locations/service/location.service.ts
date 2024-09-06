import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LocationModel } from '../model/location.model';
import { Location } from '../../../../server/entity/location.entity';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  private apiUrl: string = 'http://localhost:3000/api/locations';

  constructor(private http: HttpClient) { }

  private toEntity(model: LocationModel): Location {
  const doc: Location = new Location();
  doc.id = model.id ?? '';
  doc.code = model.code ?? '';
  doc.name = model.name ?? '';
  doc.color = model.color ?? '';
  doc.description = model.description ?? null;
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

  public getDocs(): Observable<LocationModel[]> {
    return this.http.get<LocationModel[]>(this.apiUrl);
  }

  public getById(id: string): Observable<LocationModel> {
    return this.http.get<LocationModel>(`${this.apiUrl}/${id}`);
  }

  public createDoc(doc: LocationModel): Observable<LocationModel> {
    const entity: Location = this.toEntity(doc);
    return this.http.post<LocationModel>(this.apiUrl, entity);
  }

  public updateDoc(id: string, doc: LocationModel): Observable<LocationModel> {
    return this.http.put<LocationModel>(`${this.apiUrl}/${id}`, doc);
  }

  public deleteDoc(id: string): Observable<LocationModel> {
    return this.http.delete<LocationModel>(`${this.apiUrl}/${id}`);
  }
}
