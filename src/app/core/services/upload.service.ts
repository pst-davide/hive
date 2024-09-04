import { HttpClient, HttpEventType, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  private apiUrl: string = 'http://localhost:3000/api/';

  constructor(private http: HttpClient) { }

  public uploadFile(formData: FormData): Observable<number> {
    const req = new HttpRequest('POST', `${this.apiUrl}upload`, formData, {
      reportProgress: true
    });
  
    return this.http.request(req).pipe(
      map(event => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            return Math.round((100 * event.loaded) / (event.total || 1));
          case HttpEventType.Response:
            return 100;
          default:
            return 0;
        }
      })
    );
  }
}
