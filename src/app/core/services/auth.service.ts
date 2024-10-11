import { Injectable } from '@angular/core';
import axios, {AxiosResponse} from 'axios';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl: string = 'http://localhost:3000/api/users';

  constructor() { }

  // Metodo per registrarsi
  async register(userData: any): Promise<AxiosResponse<any>> {
    return axios.post(`${this.apiUrl}/register`, userData);
  }

  // Metodo per fare login
  async login(credentials: any): Promise<AxiosResponse<any>> {
    return axios.post(`${this.apiUrl}/login`, credentials);
  }

  // Metodo per salvare il token in localStorage
  saveToken(token: string): void {
    localStorage.setItem('accessToken', token);
  }

  // Metodo per ottenere il token dal localStorage
  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  // Metodo per eliminare il token (logout)
  logout(): void {
    localStorage.removeItem('accessToken');
  }

}
