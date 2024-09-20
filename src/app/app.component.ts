import {
  Component,
  ElementRef, HostListener,
  model,
  ModelSignal,
  QueryList,
  ViewChild,
  ViewChildren,
  ViewEncapsulation
} from '@angular/core';
import {RouterModule, RouterOutlet} from '@angular/router';
import {HeaderComponent} from './layouts/header/header.component';
import {FooterComponent} from './layouts/footer/footer.component';
import {FontAwesomeModule, IconDefinition} from '@fortawesome/angular-fontawesome';
import {
  faLocationDot,
  faFont,
  faCalendarDays,
  faUser,
  faEnvelope,
} from '@fortawesome/free-solid-svg-icons';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {animate, transition, trigger} from '@angular/animations';
import anime from 'animejs/lib/anime.es.js';
import {NotificationCenterComponent} from './layouts/notification-center/notification-center.component';
import moment from 'moment';
import {SwPush} from '@angular/service-worker';
import {LoaderService} from './core/services/loader.service';
import {combineLatest, delay, map, Observable, of, startWith, switchMap} from 'rxjs';
import {NavigationService} from './core/services/navigation.service';
import {MatProgressBar} from '@angular/material/progress-bar';

interface MenuItem {
  label: string;
  link: string;
  icon: IconDefinition;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, HeaderComponent, FooterComponent, FontAwesomeModule, NgOptimizedImage,
    CommonModule, NotificationCenterComponent, MatProgressBar],
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

  /* loading */
  public isLoading$!: Observable<boolean>;

  /* sidebar state */
  public isSidebarMinimized: ModelSignal<boolean> = model<boolean>(false);

  /* notification panel */
  public isNotificationPanelOpen: ModelSignal<boolean> = model<boolean>(false);

  /* scroll */
  public isScrolled: ModelSignal<boolean> = model<boolean>(false);
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const scrollPosition: number = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.isScrolled.set(scrollPosition > 50);
  }

  /* menu */
  public menuItems: MenuItem[] = [
    {label: 'Agende', link: 'calendars', icon: faCalendarDays},
    {label: 'Sedi', link: 'admin/locations', icon: faLocationDot},
    {label: 'Stanze', link: 'admin/rooms', icon: faLocationDot},
    {label: 'Scansione OCR', link: 'admin/ocr', icon: faFont},
    {label: 'Utenti', link: 'admin/users', icon: faUser},
    {label: 'Email Editor', link: 'email-editor', icon: faEnvelope},
    {label: 'Categorie', link: 'admin/press/categories', icon: faEnvelope},
  ];

  constructor(private swPush: SwPush, private loaderService: LoaderService, private navigationService: NavigationService) {
    moment.locale('it');

    if (this.swPush.isEnabled) {
      console.log('Notifiche push abilitate');
    } else {
      console.error('Notifiche push non abilitate o non supportate in questo browser.');
    }

    this.isLoading$ = combineLatest([
      this.loaderService.isLoading$,
      this.navigationService.isNavigating$
    ]).pipe(
      map(([isLoading, isNavigating]) => isLoading || isNavigating),
      startWith(true),
      switchMap((isLoading: boolean) => {
        return isLoading ? of(isLoading) : of(isLoading).pipe(delay(500));
      })
    );

    this.isSidebarMinimized.subscribe(() => {
      this.animateSidebarText();
      this.animateSidebarIcon();
    });

  }

  /***************************************************************************************
   *
   * Sidebar
   *
   * ************************************************************************************/

  private animateSidebarText(): void {
    if (this.isSidebarMinimized()) {
      anime({
        targets: this.menuTextElements.toArray().map((el: ElementRef<any>) => {
          return el.nativeElement;
        }),
        translateX: [0, -100], // Sposta da 0 a -100 (fuori dalla vista)
        opacity: {
          value: [1, 0],
          easing: 'easeInOutQuad',
          delay: 50
        },
        easing: 'easeInOutQuad',
        duration: 350,
        delay: anime.stagger(50)
      });

      this.menuLinkElements.forEach((link: ElementRef<any>) => {
        link.nativeElement.classList.add('translate-4');
        link.nativeElement.classList.remove('translate-1');
      });

      anime({
        targets: this.menuLinkElements.toArray().map((el: ElementRef<any>) => el.nativeElement),
        translateX: [0, -16], // Sposta da 0 a -16px (compensazione del margine)
        easing: 'easeInOutQuad',
        duration: 350,
        complete: () => {
          // Rimuovi la classe di trasformazione finale
          this.menuLinkElements.forEach((link: ElementRef<any>) => {
            link.nativeElement.classList.remove('translate-4');
            link.nativeElement.classList.add('translate-1');
          });
        }
      });

    } else {
      anime({
        targets: this.menuTextElements.toArray().map((el: ElementRef<any>) => el.nativeElement),
        translateX: [-100, 0], // Sposta da -100 a 0 (di nuovo visibile)
        opacity: [0, 1],
        easing: 'easeInOutQuad',
        duration: 350,
        delay: anime.stagger(50)
      });

      this.menuLinkElements.forEach((link: ElementRef<any>) => {
        link.nativeElement.classList.add('translate-1');
        link.nativeElement.classList.remove('translate-4');
      });

      anime({
        targets: this.menuLinkElements.toArray().map((el: ElementRef<any>) => el.nativeElement),
        translateX: [-16, 0], // Sposta da -16px a 0 (compensazione del margine)
        easing: 'easeInOutQuad',
        duration: 350,
        complete: () => {
          // Rimuovi la classe di trasformazione finale
          this.menuLinkElements.forEach((link: ElementRef<any>) => {
            link.nativeElement.classList.remove('translate-1');
            link.nativeElement.classList.add('translate-4');
          });
        }
      });

    }
  }

  private animateSidebarIcon(): void {
    const path = this.iconPath.nativeElement;

    const startD: string = !this.isSidebarMinimized()
      ? 'M6 18L18 6M6 6l12 12'
      : 'M4 6h16M4 12h16M4 18h16';
    const endD: string = !this.isSidebarMinimized()
      ? 'M4 6h16M4 12h16M4 18h16'
      : 'M6 18L18 6M6 6l12 12';

    anime({
      targets: path,
      d: [
        {value: startD},
        {value: endD}
      ],
      easing: 'easeInOutQuad',
      duration: 300,
    });
  }

}
