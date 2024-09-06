import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface ProvinceModel {
  sigla: string;
  provincia: string;
  superficie: string;
  residenti: string;
  num_comuni: string;
  id_regione: string;
  cod_istat: string;
}

export interface CityModel {
  istat: string;
  comune: string;
  regione: string;
  provincia: string;
  prefisso: string;
  cod_fisco: string;
  num_residenti: string;
  superficie: string;
  cf: string;
}

@Injectable({
  providedIn: 'root'
})
export class AddressService {

  constructor(private http: HttpClient) { }

  public getProvincies(): Observable<any> {
    return this.http.get<any>('/assets/provincies.json');
  }

  public getCities(): Observable<any> {
    return this.http.get<any>('/assets/cities.json');
  }

  public getZip(): Observable<any> {
    return this.http.get<any>('/assets/zip.json');
  }
}
