import {Component, ElementRef, ViewChild} from '@angular/core';
import {NgOptimizedImage} from '@angular/common';
import {AuthService} from '../../core/services/auth.service';
import {AxiosResponse} from 'axios';
import {Router} from '@angular/router';
import {FormControl, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import anime from 'animejs/lib/anime.es.js';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    NgOptimizedImage,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private credentials: {email: string, password: string} = {email: '', password: ''};

  public email: FormControl = new FormControl('', [Validators.required, Validators.email]);
  public password: FormControl = new FormControl('', [Validators.required, Validators.minLength(8)]);

  public passwordFieldType: string = 'password';

  @ViewChild('passwordContainer', { static: false }) passwordContainer!: ElementRef;

  constructor(private authService: AuthService, private router: Router) {}

  public async login(): Promise<void> {
    this.credentials.email = this.email.value;
    this.credentials.password = this.password.value;

    try {
      const res: AxiosResponse<any, any> = await this.authService.login(this.credentials);
      console.log('AccessToken ricevuto:', res.data.accessToken);
      this.authService.saveToken(res.data.accessToken);
      // await this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Errore:', error);
    }
  }

  public togglePasswordVisibility(): void {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }

  private shakePasswordField(): void {
    anime({
      targets: this.passwordContainer.nativeElement,
      translateX: [
        { value: -10, duration: 100 },
        { value: 10, duration: 100 },
        { value: -10, duration: 100 },
        { value: 10, duration: 100 },
        { value: 0, duration: 100 }
      ],
      easing: 'easeInOutQuad'
    });
  }
}
