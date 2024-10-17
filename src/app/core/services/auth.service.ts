import { Injectable } from '@angular/core';
import axios, {AxiosResponse} from 'axios';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl: string = 'http://localhost:3000/api/users';
  private isAuthenticatedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject.asObservable();

  constructor() { }

  public async refreshToken(): Promise<AxiosResponse<any, any>> {
    try {
      const refreshToken: string | null = localStorage.getItem('refreshToken');
      const response: AxiosResponse<any, any> = await axios.post(`${this.apiUrl}/refresh`, refreshToken);

      const { accessToken, refreshToken: newRefreshToken } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', newRefreshToken);

      this.isAuthenticatedSubject.next(true);
      return response;
    } catch (error: any) {
      console.error('Errore durante il refresh del token:', error);
      throw error;
    }
  }

  // Metodo per fare login
  public async login(credentials: any): Promise<AxiosResponse<any, any>> {
    try {
      const response: AxiosResponse<any, any> = await axios.post(`${this.apiUrl}/login`, credentials);

      const { accessToken, refreshToken, user } = response.data; // Includi il refreshToken

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('userId', user.id);
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('userName', user.name);
      localStorage.setItem('userLastname', user.lastname);

      this.isAuthenticatedSubject.next(true);
      return response;
    } catch (error: any) {
      if (error.response) {
        // La richiesta è stata fatta e il server ha risposto con uno stato di errore
        console.error('Error Response:', {
          status: error.response.status,
          data: error.response.data,
        });
      } else if (error.request) {
        // La richiesta è stata fatta ma non c'è risposta
        console.error('Error Request:', error.request);
      } else {
        // Qualcosa è andato storto nel configurare la richiesta
        console.error('Error Message:', error.message);
      }

      console.error('Login failed:', error);
      this.isAuthenticatedSubject.next(false);
      throw error;
    }
  }

  // Metodo per salvare il token in localStorage
  public saveToken(token: string): void {
    localStorage.setItem('accessToken', token);
  }

  // Controlla se esiste il token nel localStorage
  private hasToken(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  // Metodo per ottenere il token dal localStorage
  public getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  // Metodo per eliminare il token (logout)
  public logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userLastname');
    this.isAuthenticatedSubject.next(false);
  }

}
