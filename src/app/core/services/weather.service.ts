import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  private apiKey: string = 'b5a8c6ff70e9eeeabbc9ea9d31614e81';
  private apiUrl: string = 'https://api.openweathermap.org/data/2.5/weather';
  private forecastUrl: string = 'https://api.openweathermap.org/data/2.5/forecast';

  constructor(private http: HttpClient) { }

  public getWeather(city: string): Observable<any> {
    return this.http.get(`${this.apiUrl}?q=${city}&appid=${this.apiKey}&lang=it&units=metric`);
  }

  public getForecast(city: string): Observable<any> {
    return this.http.get(`${this.forecastUrl}?q=${city}&appid=${this.apiKey}&lang=it&units=metric`);
  }
}
