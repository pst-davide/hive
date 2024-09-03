import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OcrService {
  private apiUrl: string = 'http://localhost:3000/api/';

  constructor(private http: HttpClient) { }

  public async getOcr(): Promise<void> {
    // return this.http.post<string>(this.apiUrl);
  }
}
