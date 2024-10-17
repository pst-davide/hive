import {
  Component,
  ElementRef,
  model,
  ModelSignal,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {BreadcrumbComponent} from '../breadcrumb/breadcrumb.component';
import {Breadcrumb, BreadcrumbService} from 'app/core/services/breadcrumb.service';
import _ from 'lodash';
import {FontAwesomeModule, IconDefinition} from '@fortawesome/angular-fontawesome';
import {faBell, faGear, faUser} from '@fortawesome/free-solid-svg-icons';
import {WeatherService} from '../../core/services/weather.service';
import {Subject, takeUntil} from 'rxjs';
import moment, {Moment} from 'moment';
import {DatePipe, NgClass, NgOptimizedImage} from '@angular/common';
import anime from 'animejs/lib/anime.es.js';
import {Router} from '@angular/router';
import {AuthService} from '../../core/services/auth.service';

export interface WeatherCondition {
  icon: string | null;
  description: string | null;
  humidity: number | null;
  temperature: number | null;
  temp_max: number | null;
  temp_min: number | null;
  wind_speed: number | null;
}

export interface ForecastCondition {
  id: number;
  icon: string | null;
  description: string | null;
  temperature: number | null;
  date: Moment
}

export const EMPTY_WEATHER: WeatherCondition = {
  icon: null,
  description: null,
  temperature: null,
  humidity: null,
  temp_max: null,
  temp_min: null,
  wind_speed: null,
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [BreadcrumbComponent, FontAwesomeModule, DatePipe, NgClass, NgOptimizedImage],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
  /* page title */
  public title: ModelSignal<string> = model<string>('hive');

  /* icons */
  public faUser: IconDefinition = faUser;
  public faGear: IconDefinition = faGear;
  public faBell: IconDefinition = faBell;

  /* element ref */
  @ViewChild('iconPath') iconPath!: ElementRef;
  @ViewChildren('menuText') menuTextElements!: QueryList<ElementRef>;
  @ViewChildren('menuLink') menuLinkElements!: QueryList<ElementRef>;

  /* weather */
  public weather: WeatherCondition = _.cloneDeep(EMPTY_WEATHER);
  public forecast: ForecastCondition[] = [];
  public showWeatherOverlay: boolean = false;
  public forecastHours: {id: number, label: string}[] = [
    {id: 1, label: ''},
    {id: 2, label: '00'},
    {id: 3, label: '06'},
    {id: 4, label: '12'},
    {id: 5, label: '18'}
  ];

  /* sidebar state */
  public isSidebarMinimized: ModelSignal<boolean> = model<boolean>(false);

  /* notification panel */
  public isNotificationPanelOpen: ModelSignal<boolean> = model<boolean>(false);

  /* scroll */
  public isScrolled: ModelSignal<boolean> = model<boolean>(false);

  /* subject */
  private destroy$: Subject<void> = new Subject<void>();

  constructor(private breadcrumbService: BreadcrumbService, private weatherService: WeatherService,
              private router: Router, private authService: AuthService) {
  }

  ngOnInit(): void {
    this.setBreadcrumbs();
    this.getWeather();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public _navigateTo(url: string): void {
    this.router.navigate([url]).then(() => {});
  }

  /***************************************************************************************
   *
   * Breadcrumb
   *
   * ************************************************************************************/

  private setBreadcrumbs() {
    this.breadcrumbService.getBreadcrumbs()
      .pipe(takeUntil(this.destroy$))
      .subscribe((breadcrumbs: Breadcrumb[]) => {
        const lastBreadcrumbs: Breadcrumb | null = _.last(breadcrumbs) || null;
        this.title.set(lastBreadcrumbs ? lastBreadcrumbs.label : 'hive');
      });
  }

  /***************************************************************************************
   *
   * Sidebar
   *
   * ************************************************************************************/

  public toggleSidebar(): void {
    this.animateSidebarIcon();
    this.isSidebarMinimized.set(!this.isSidebarMinimized());
  }

  /******************************************************************************************
   *
   * Notification Panel
   *
   * ***************************************************************************************/

  public _toggleNotificationPanel(): void {
    this.isNotificationPanelOpen.set(!this.isNotificationPanelOpen());
  }

  /******************************************************************************************
   *
   * Weather
   *
   * ***************************************************************************************/

  private getWeather(): void {
    const hoursToFilter: number[] = [0, 6, 12, 18];

    this.weatherService.getWeather('Schio')
      .pipe(takeUntil(this.destroy$))
      .subscribe(weather => {
        if (weather) {
          if (weather.weather && weather.weather[0]) {
            this.weather.icon = weather.weather[0]?.icon ?? null;
            this.weather.description = weather.weather[0]?.description ?? null;
          }

          if (weather.main) {
            this.weather.humidity = parseInt(weather.main.humidity ?? 0, 10) ?? null;
            this.weather.temperature = parseInt(weather.main.temp ?? 0, 10) ?? null;
            this.weather.temp_max = parseInt(weather.main.temp_max ?? 0, 10) ?? null;
            this.weather.temp_min = parseInt(weather.main.temp_min ?? 0, 10) ?? null;
          }

          if (weather.wind) {
            this.weather.wind_speed = parseInt(weather.wind.speed ?? 0);
          }
        }
      });

    this.weatherService.getForecast('Schio')
      .pipe(takeUntil(this.destroy$))
      .subscribe(weather => {
        console.log(weather)
        if (weather && weather.list) {
          const filteredList: any[] = _.filter(weather.list, item => {
            const time: number = new Date(item.dt_txt).getHours();
            return hoursToFilter.includes(time);
          });

          let forecastCounter: number = 0;
          const today: Moment = moment().endOf('day');
          const endDay: Moment = today.clone().add(3, 'days');
          for (const item of filteredList) {
            if (item.weather[0]) {
              const date: Moment = moment(item.dt_txt);

              if (date.isAfter(today) && date.isSameOrBefore(endDay)) {
                forecastCounter ++;

                const forecastItem: ForecastCondition = {
                  id: forecastCounter,
                  icon: item.weather[0].icon,
                  description: item.weather[0].description,
                  temperature: parseInt(item.main.temp ?? 0, 10) ?? null,
                  date: date
                }

                if (date.hours() === 0) {
                  forecastCounter ++;
                  this.forecast.push({id: forecastCounter, icon: null, description: date.format('DD.MM'), temperature: null, date: date});
                }

                this.forecast.push(forecastItem);
              }

            }
          }
        }
      });
  }

  public _toggleWeatherOverlay(): void {
    this.showWeatherOverlay = !this.showWeatherOverlay;
  }

  private animateSidebarIcon(): void {
    const path = this.iconPath.nativeElement;

    const startD: string = !this.isSidebarMinimized()
      ? 'M6 18L18 6M6 6l12 12'
      : 'M4 6h16M4 12h16M4 18h16';
    const endD: string = this.isSidebarMinimized()
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

  /***************************************************************************************
   *
   * Logout
   *
   * ************************************************************************************/

  public _logout(): void {
    this.authService.logout();
  }
}
