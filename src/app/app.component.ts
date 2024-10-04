import {
  Component,
  ElementRef, HostListener,
  model,
  ModelSignal, OnInit,
  QueryList,
  ViewChildren,
  ViewEncapsulation
} from '@angular/core';
import {Router, RouterModule, RouterOutlet} from '@angular/router';
import {HeaderComponent} from './layouts/header/header.component';
import {FooterComponent} from './layouts/footer/footer.component';
import {FontAwesomeModule, IconDefinition} from '@fortawesome/angular-fontawesome';
import {
  faFont,
  faCalendarDays,
  faUser,
  faEnvelope, faChevronDown, faCog, faChevronRight, faCaretRight, faNewspaper,
} from '@fortawesome/free-solid-svg-icons';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {animate, state, style, transition, trigger} from '@angular/animations';
import anime from 'animejs/lib/anime.es.js';
import {NotificationCenterComponent} from './layouts/notification-center/notification-center.component';
import moment from 'moment';
import {LoaderService} from './core/services/loader.service';
import {combineLatest, delay, map, Observable, of, startWith, switchMap} from 'rxjs';
import {NavigationService} from './core/services/navigation.service';
import {MatProgressBar} from '@angular/material/progress-bar';
import {PushNotificationService} from './core/services/push-notification.service';

interface MenuItem {
  id: string;
  label: string;
  link?: string;
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
      ]),
    trigger('menuAnimation', [
      state('collapsed', style({ height: '0', overflow: 'hidden' })),
      state('expanded', style({ height: '*', overflow: 'hidden' })),
      transition('collapsed <=> expanded', [animate('300ms ease-in-out')]),
    ]),
  ]
})
export class AppComponent implements OnInit {
  public title: string = 'Hive';

  /* loading */
  public isLoading$!: Observable<boolean>;

  /* animations */
  @ViewChildren('menuText') menuTextElements!: QueryList<ElementRef>;
  @ViewChildren('menuLink') menuLinkElements!: QueryList<ElementRef>;
  @ViewChildren('subUl') subUlElements!: QueryList<ElementRef>;

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
    {id: 'm1', label: 'Agende', link: 'calendars', icon: faCalendarDays},
    {id: 'm2', label: 'Scansione OCR', link: 'admin/ocr', icon: faFont},
    {id: 'm3', label: 'Email Editor', link: 'email-editor', icon: faEnvelope},
    {
      id: 'm4', label: 'Amministrazione', icon: faCog, isOpen: false,
      subItems: [
        {id: 'm5', label: 'Rassegna Stampa', icon: faNewspaper, isOpen: false,
          subItems: [
            {id: 'm6', label: 'Categorie', link: 'admin/press/categories', icon: faCaretRight},
            {id: 'm7', label: 'Parole Chiave', link: 'admin/press/categories/keywords', icon: faCaretRight},
          ]
        },
        {id: 'm8', label: 'Anagrafiche', icon: faUser, isOpen: false,
          subItems: [
            {id: 'm9', label: 'Sedi', link: 'admin/locations', icon: faCaretRight},
            {id: 'm10', label: 'Stanze', link: 'admin/locations/rooms', icon: faCaretRight},
            {id: 'm11', label: 'Utenti', link: 'admin/users', icon: faCaretRight},
          ]
        },
        {
          id: 'm12', label: 'Newsletter', icon: faEnvelope, isOpen: false,
          subItems: [
            {id: 'm13', label: 'Liste', link: 'admin/newsletter/lists', icon: faCaretRight},
          ]
        }
      ]
    }
  ];
  public activeItem: string = '';

  /* icons */
  public readonly faChevronDown: IconDefinition = faChevronDown;
  public readonly faChevronRight: IconDefinition = faChevronRight;

  constructor(private pushNotificationService: PushNotificationService, private loaderService: LoaderService,
              private navigationService: NavigationService, private router: Router) {
    moment.locale('it');

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

  ngOnInit(): void {
    this.navigationService.currentRoute$.subscribe((currentUrl: string) => {
      this.setActiveItem(currentUrl);
    });

    this.pushNotificationService.requestNotificationPermission()
      .then(() => {
        console.log('Send subscribe request to service');
        this.pushNotificationService.subscribeToPushNotifications();
      })
      .catch(err => console.error('Permission denied:', err));
  }

  /***************************************************************************************
   *
   * Sidebar
   *
   * ************************************************************************************/

  public toggleItem(item: MenuItem): void {
    item.isOpen = !item.isOpen;
  }

  private animateSidebarText(): void {
    const textElements: any[] = this.menuTextElements.toArray().map((el: ElementRef<any>) => el.nativeElement);
    const linkElements: any[] = this.menuLinkElements.toArray().map((el: ElementRef<any>) => el.nativeElement);
    const subElements: any[] = this.subUlElements.toArray().map((el: ElementRef<any>) => el.nativeElement);

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
        delay: anime.stagger(50),
      });

      anime({
        targets: linkElements,
        translateX: [0, -16],
        easing: 'easeInOutQuad',
        duration: 350,
      });

      anime({
        targets: subElements,
        translateX: [0, -16],
        easing: 'easeInOutQuad',
        duration: 150,
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
        delay: anime.stagger(50),
      });

      anime({
        targets: linkElements,
        translateX: [-16, 0],
        easing: 'easeInOutQuad',
        duration: 350,
      });

      anime({
        targets: subElements,
        translateX: [-16, 0],
        easing: 'easeInOutQuad',
        duration: 150,
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

  public navigate(item: MenuItem): void {
    this.activeItem = item.id;
    this.router.navigate([item.link]).then(() => {});
  }

  private setActiveItem(currentUrl: string): void {

    this.menuItems.forEach(item => {
      item.isOpen = false;
      if (item.subItems) {
        item.subItems.forEach(subItem => {
          subItem.isOpen = false;
          if (subItem.subItems) {
            subItem.subItems.forEach(innerSubItem => {
              innerSubItem.isOpen = false; // Reset degli inner subItems
            });
          }
        });
      }
    });

    // Controlla gli elementi principali
    this.menuItems.forEach(item => {
      if (item.link && currentUrl.includes(item.link)) {
        this.activeItem = item.id;
      }

      // Controlla i subItems
      if (item.subItems) {
        item.subItems.forEach(subItem => {
          if (subItem.link && currentUrl.includes(subItem.link)) {
            this.activeItem = subItem.id;
            item.isOpen = true; // Apri il menu principale se un subItem è attivo
          }

          // Controlla i subItems di secondo livello
          if (subItem.subItems) {
            subItem.subItems.forEach(innerSubItem => {
              if (innerSubItem.link && currentUrl.includes(innerSubItem.link)) {
                this.activeItem = innerSubItem.id;
                subItem.isOpen = true; // Apri il subItem se un innerSubItem è attivo
                item.isOpen = true; // Apri anche il menu principale
              }
            });
          }
        });
      }
    });
  }

}
