import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface GeoResponse {
 lat: number;
 lon: number;
}

@Injectable({
  providedIn: 'root'
})
export class GeoService {

  constructor(private http: HttpClient) {}

  public getCoordinates(address: string): Observable<any[]> {
    const url: string = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json`;
    return this.http.get<any[]>(url);
  }
}
