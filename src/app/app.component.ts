import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import {HeaderComponent} from './layouts/header/header.component';
import { FooterComponent } from "./layouts/footer/footer.component";
import { FontAwesomeModule, IconDefinition } from '@fortawesome/angular-fontawesome';
import { faLocationDot, faFont, faCalendarDays, faTimes } from '@fortawesome/free-solid-svg-icons';
import {NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, HeaderComponent, FooterComponent, FontAwesomeModule, NgOptimizedImage],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'hive-app';

  /* icons */
  public faLocationDot: IconDefinition = faLocationDot;
  public faFont: IconDefinition = faFont;
  public faCalendarDays: IconDefinition = faCalendarDays;
  public faTimes: IconDefinition = faTimes;

  public isSidebarOpen: boolean = true;
  public isSidebarMinimized: boolean = false;

  public toggleSidebar(): void {
    if (this.isSidebarOpen) {
      this.isSidebarMinimized = !this.isSidebarMinimized;
      this.isSidebarOpen = false;
    } else {
      this.isSidebarOpen = true;
      this.isSidebarMinimized = false;
    }
  }
}
