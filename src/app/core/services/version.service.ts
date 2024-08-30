import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';

export interface VersionModel {
  version: string;
  commit: string;
  date: string;
}

@Injectable({
  providedIn: 'root'
})
export class VersionService {

  constructor(private http: HttpClient) { }

  getVersion(): Observable<VersionModel> {
    return this.http.get<VersionModel>('/assets/version.json');
  }
}
