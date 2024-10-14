import { Injectable } from '@angular/core';
import {CanActivate, Router} from '@angular/router';
import {AuthService} from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(private authService: AuthService, private router: Router) { }

  public canActivate(): boolean {
    const token: string | null = this.authService.getToken();
    if (token) {
      return true;
    }
    this.router.navigate(['/login']).then(() => {});
    return false;
  }
}
