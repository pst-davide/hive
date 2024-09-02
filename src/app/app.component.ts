import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import {HeaderComponent} from './layouts/header/header.component';
import { FooterComponent } from "./layouts/footer/footer.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'hive-app';
}
