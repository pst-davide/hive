import {Component, model, ModelSignal, OnDestroy, OnInit} from '@angular/core';
import {BreadcrumbComponent} from '../breadcrumb/breadcrumb.component';
import {Breadcrumb, BreadcrumbService} from 'app/core/services/breadcrumb.service';
import _ from 'lodash';
import {FontAwesomeModule, IconDefinition} from '@fortawesome/angular-fontawesome';
import {faBell, faGear, faUser} from '@fortawesome/free-solid-svg-icons';
import {WeatherService} from '../../core/services/weather.service';
import {Subject, takeUntil} from 'rxjs';
import moment, {Moment} from 'moment';
import {DatePipe} from '@angular/common';

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
  imports: [BreadcrumbComponent, FontAwesomeModule, DatePipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
  public title: string = 'HIVE';

  /* icons */
  public faUser: IconDefinition = faUser;
  public faGear: IconDefinition = faGear;
  public faBell: IconDefinition = faBell;

  /* weather */
  public weather: WeatherCondition = _.cloneDeep(EMPTY_WEATHER);
  public forecast: ForecastCondition[] = [];
  public showWeatherOverlay: boolean = true;
  public forecastHours: {id: number, label: string}[] = [
    {id: 1, label: ''},
    {id: 2, label: '00'},
    {id: 3, label: '06'},
    {id: 4, label: '12'},
    {id: 5, label: '18'}
  ];

  public showNotificationPanel: ModelSignal<boolean> = model<boolean>(false);

  private destroy$: Subject<void> = new Subject<void>();

  constructor(private breadcrumbService: BreadcrumbService, private weatherService: WeatherService) {
  }

  ngOnInit(): void {
    this.setBreadcrumbs();
    this.getWeather();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setBreadcrumbs() {
    this.breadcrumbService.getBreadcrumbs()
      .pipe(takeUntil(this.destroy$))
      .subscribe((breadcrumbs: Breadcrumb[]) => {
        const lastBreadcrumbs: Breadcrumb | null = _.last(breadcrumbs) || null;
        this.title = lastBreadcrumbs ? lastBreadcrumbs.label : 'HIVE';
      });
  }

  public _toggleNotificationPanel(): void {
    this.showNotificationPanel.set(!this.showNotificationPanel());
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
        console.log(this.forecast);
      });
  }

  public _toggleWeatherOverlay(): void {
    this.showWeatherOverlay = !this.showWeatherOverlay;
  }
}
