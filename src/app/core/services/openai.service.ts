import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';

interface Keyword {
  word: string;
  category: string;
  importance: 'high' | 'medium' | 'low';
}

@Injectable({
  providedIn: 'root'
})
export class OpenaiService {

  private apiUrl: string = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  public analyzeText(text: string, keywords: Keyword[]): Observable<any> {
    const body = { text, keywords };
    return this.http.post<any>(`${this.apiUrl}/analyze`, body);
  }

  public sendMessage(prompt: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/chat`, { prompt });
  }

}
