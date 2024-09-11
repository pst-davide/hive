import {Component, ElementRef, model, ModelSignal, QueryList, ViewChild, ViewChildren, ViewEncapsulation} from '@angular/core';
import {RouterModule, RouterOutlet} from '@angular/router';
import {HeaderComponent} from './layouts/header/header.component';
import {FooterComponent} from './layouts/footer/footer.component';
import {FontAwesomeModule, IconDefinition} from '@fortawesome/angular-fontawesome';
import {faLocationDot, faFont, faCalendarDays, faUser} from '@fortawesome/free-solid-svg-icons';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {animate, transition, trigger} from '@angular/animations';
import anime from 'animejs/lib/anime.es.js';
import {NotificationCenterComponent} from './layouts/notification-center/notification-center.component';
import moment from 'moment';
import { SwPush } from '@angular/service-worker';
import {HttpClient} from "@angular/common/http";

interface MenuItem {
  label: string;
  link: string;
  icon: IconDefinition;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, HeaderComponent, FooterComponent, FontAwesomeModule, NgOptimizedImage, CommonModule, NotificationCenterComponent],
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

  @ViewChild('iconPath') iconPath!: ElementRef;
  @ViewChildren('menuText') menuTextElements!: QueryList<ElementRef>;
  @ViewChildren('menuLink') menuLinkElements!: QueryList<ElementRef>;

  /* sidebar state */
  public isSidebarOpen: boolean = true;
  public isSidebarMinimized: boolean = false;

  /* notification panel */
  public showNotificationPanel: ModelSignal<boolean> = model<boolean>(false);

  readonly VAPID_PUBLIC_KEY: string = 'BFGQimvmI8cHZDwbhBp1NxDfXAkzX00juGwr1v4TL72CKsBTNacANfkvhZeKrDCuZzQSSZDjvm1ItWI-wbDVyT0';

  /* menu */
  public menuItems: MenuItem[] = [
    {label: 'Agende', link: 'calendars', icon: faCalendarDays},
    {label: 'Sedi', link: 'admin/locations', icon: faLocationDot},
    {label: 'Stanze', link: 'admin/rooms', icon: faLocationDot},
    {label: 'Scansione OCR', link: 'admin/ocr', icon: faFont},
    {label: 'Utenti', link: 'admin/users', icon: faUser},
  ];

  constructor(private swPush: SwPush, private http: HttpClient) {
    moment.locale('it');
    this.subscribeToNotifications();
  }

  public toggleSidebar(): void {
    if (this.isSidebarOpen) {
      this.isSidebarMinimized = !this.isSidebarMinimized;
      this.isSidebarOpen = false;
    } else {
      this.isSidebarOpen = true;
      this.isSidebarMinimized = false;
    }

    this.animateSidebarText();
    this.animateSidebarIcon();

  }

  private animateSidebarText(): void {
    if (!this.isSidebarOpen) {
      anime({
        targets: this.menuTextElements.toArray().map(el => el.nativeElement),
        translateX: [0, -100], // Sposta da 0 a -100 (fuori dalla vista)
        opacity: [1, 0],       // Riduce l'opacità da 1 a 0
        easing: 'easeInOutQuad',
        duration: 200,
        delay: anime.stagger(50)
      });

      this.menuLinkElements.forEach(link => {
        link.nativeElement.classList.add('translate-4');
        link.nativeElement.classList.remove('translate-1');
      });

      anime({
        targets: this.menuLinkElements.toArray().map(el => el.nativeElement),
        translateX: [0, -12], // Transla da 0 a -12px (compensazione del margine)
        easing: 'easeInOutQuad',
        duration: 300,
        complete: () => {
          // Rimuovi la classe di trasformazione finale
          this.menuLinkElements.forEach(link => {
            link.nativeElement.classList.remove('translate-4');
            link.nativeElement.classList.add('translate-1');
          });
        }
      });

    } else {
      anime({
        targets: this.menuTextElements.toArray().map(el => el.nativeElement),
        translateX: [-100, 0], // Sposta da -100 a 0 (di nuovo visibile)
        opacity: [0, 1],       // Aumenta l'opacità da 0 a 1
        easing: 'easeInOutQuad',
        duration: 200,
        delay: anime.stagger(50)
      });

      this.menuLinkElements.forEach(link => {
        link.nativeElement.classList.add('translate-1');
        link.nativeElement.classList.remove('translate-4');
      });

      anime({
        targets: this.menuLinkElements.toArray().map(el => el.nativeElement),
        translateX: [-12, 0], // Transla da -12px a 0 (compensazione del margine)
        easing: 'easeInOutQuad',
        duration: 300,
        complete: () => {
          // Rimuovi la classe di trasformazione finale
          this.menuLinkElements.forEach(link => {
            link.nativeElement.classList.remove('translate-1');
            link.nativeElement.classList.add('translate-4');
          });
        }
      });

    }
  }

  private animateSidebarIcon(): void {
    const path = this.iconPath.nativeElement;

    const startD = this.isSidebarOpen
      ? "M6 18L18 6M6 6l12 12"
      : "M4 6h16M4 12h16M4 18h16";
    const endD = this.isSidebarOpen
      ? "M4 6h16M4 12h16M4 18h16"
      : "M6 18L18 6M6 6l12 12";

    anime({
      targets: path,
      d: [
        { value: startD },
        { value: endD }
      ],
      easing: 'easeInOutQuad',
      duration: 300,
    });
  }

  private subscribeToNotifications(): void {
    this.swPush.requestSubscription({
      serverPublicKey: this.VAPID_PUBLIC_KEY
    })
      .then(sub => this.http.post('/push/subscribe', sub).subscribe())
      .catch(err => console.error('Could not subscribe to notifications', err));
  }
}
