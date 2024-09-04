import {Component, ElementRef, ViewChild, ViewEncapsulation} from '@angular/core';
import {RouterModule, RouterOutlet} from '@angular/router';
import {HeaderComponent} from './layouts/header/header.component';
import {FooterComponent} from './layouts/footer/footer.component';
import {FontAwesomeModule, IconDefinition} from '@fortawesome/angular-fontawesome';
import {faLocationDot, faFont, faCalendarDays, faTimes} from '@fortawesome/free-solid-svg-icons';
import {NgOptimizedImage} from '@angular/common';
import {animate, state, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, HeaderComponent, FooterComponent, FontAwesomeModule, NgOptimizedImage],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('toggleSidebar',
      [

        transition('open => closed', [
          animate('400ms ease-in-out')
        ]),
        transition('closed => open', [
          animate('400ms ease-in-out')
        ])
      ])
  ]
})
export class AppComponent {
  title = 'hive-app';

  @ViewChild('sidebarIcon') sidebarIcon!: ElementRef;

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

    const icon = this.sidebarIcon.nativeElement;
    icon.classList.toggle('animate-icon');
    const path = icon.querySelector('path');
    path.setAttribute('d', this.isSidebarOpen ? 'M4 6h16M4 12h16M4 18h16' : 'M6 18L18 6M6 6l12 12');
  }
}
