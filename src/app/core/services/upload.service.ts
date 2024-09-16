import {HttpClient, HttpEvent, HttpEventType, HttpRequest} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import {UploadModel} from "../model/upload.model";

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  private apiUrl: string = 'http://localhost:3000/api/';

  constructor(private http: HttpClient) { }

  public uploadFile(formData: FormData, file: File): Observable<UploadModel> {
    const req: HttpRequest<FormData> = new HttpRequest('POST', `${this.apiUrl}upload`, formData, {
      reportProgress: true
    });

    const res: Observable<UploadModel> = this.http.request(req).pipe(
      map((event: HttpEvent<any>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            return {
              progress: Math.round((100 * event.loaded) / (event.total || 1)),
              fileName: '',
              filePath: '',
              fileSize: (file.size / 1024).toFixed(2),
              fileType: file.type,
            };
          case HttpEventType.Response:
            return {
              progress: 100,
              fileName: event.body?.fileName || '',
              filePath: event.body?.filePath || '',
              fileSize: (file.size / 1024).toFixed(2),
              fileType: file.type,
            };
          default:
            return {
              progress: 0,
              fileName: '',
              filePath: '',
              fileSize: (file.size / 1024).toFixed(2),
              fileType: file.type,
            };
        }
      })
    );

    return res;
  }
}
