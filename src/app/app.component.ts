import {
  Component,
  ElementRef, HostListener,
  model,
  ModelSignal,
  QueryList,
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
  faEnvelope, faChevronUp, faChevronDown,
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
  isOpen?: boolean;
  subItems?: MenuItem[];
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
    {
      label: 'Test', link: 'admin/press/categories', icon: faEnvelope, isOpen: false,
      subItems: [
        {label: 'Submenu 1-1', link: '/sub1', icon: faFont},
        {label: 'Submenu 1-2', link: '/sub2', icon: faLocationDot}
      ]
    },
  ];

  constructor(private swPush: SwPush, private loaderService: LoaderService,
              private navigationService: NavigationService) {
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
    });

  }

  /***************************************************************************************
   *
   * Sidebar
   *
   * ************************************************************************************/

  private animateSidebarText(): void {
    const textElements: any[] = this.menuTextElements.toArray().map((el: ElementRef<any>) => {
      return el.nativeElement;
    });
    const linkElements: any[] = this.menuLinkElements.toArray().map((el: ElementRef<any>) => el.nativeElement);

    if (this.isSidebarMinimized()) {

      anime({
        targets: textElements,
        translateX: [0, -100],
        opacity: {
          value: [1, 0],
          easing: 'easeInOutQuad',
          delay: anime.stagger(50),
        },
        easing: 'easeInOutQuad',
        duration: 350,
        delay: anime.stagger(50)
      });

      anime({
        targets: linkElements,
        translateX: [0, -16],
        easing: 'easeInOutQuad',
        duration: 350,
      });

      anime({
        targets: '.chevron',
        opacity: [1, 0],
        translateX: [0, -100],
        easing: 'easeInOutQuad',
        duration: 350,
        delay: anime.stagger(50)
      });

    } else {
      anime({
        targets: textElements,
        translateX: [-100, 0],
        opacity: {
          value: [0, 1],
          easing: 'easeInOutQuad',
          delay: anime.stagger(50),
        },
        easing: 'easeInOutQuad',
        duration: 350,
        delay: anime.stagger(50)
      });

      anime({
        targets: linkElements,
        translateX: [-16, 0],
        easing: 'easeInOutQuad',
        duration: 350,
      });

      anime({
        targets: '.chevron',
        opacity: [0, 1],
        translateX: [-100, -0],
        easing: 'easeInOutQuad',
        duration: 350,
        delay: anime.stagger(50)
      });
    }
  }

  public toggleSubmenu(item: any): void {
    item.isOpen = !item.isOpen;

    anime({
      targets: '.chevron',
      rotate: item.isOpen ? 180 : 0,
      duration: 150,
      easing: 'easeInOutQuad'
    });
  }

  protected readonly faChevronDown = faChevronDown;
}
