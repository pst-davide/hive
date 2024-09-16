import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import { Router } from '@angular/router';
import {LoaderService} from './loader.service';
import {NotifyService} from "./notify.service";

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  private isNavigatingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isNavigating$: Observable<boolean> = this.isNavigatingSubject.asObservable();

  constructor(private router: Router, private loaderService: LoaderService, private notify: NotifyService) {
    this.router.events.subscribe(event => {
      if (event.constructor.name === 'NavigationStart') {
        console.log('navigation start')
        this.loaderService.clearLoadingComponents();
        this.isNavigatingSubject.next(true);
        // this.notify.loading();

      } else if (event.constructor.name === 'NavigationEnd' ||
        event.constructor.name === 'NavigationCancel' ||
        event.constructor.name === 'NavigationError') {
        console.log('navigation end')
        this.loaderService.clearLoadingComponents();
        this.isNavigatingSubject.next(false);
        // this.notify.hide();
      }
    });
  }
}
