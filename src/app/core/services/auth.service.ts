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

  // Metodo per fare login
  public async login(credentials: any): Promise<AxiosResponse<any, any>> {
    try {
      const response: AxiosResponse<any, any> = await axios.post(`${this.apiUrl}/login`, credentials);
      const token = response.data.accessToken;
      localStorage.setItem('accessToken', token);

      this.isAuthenticatedSubject.next(true);
      return response;
    } catch (error) {
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
    this.isAuthenticatedSubject.next(false);
  }

}
