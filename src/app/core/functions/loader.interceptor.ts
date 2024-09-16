import { HttpEvent, HttpHandler, HttpRequest, HttpInterceptor } from '@angular/common/http';
import { Observable, Subscription } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import {Injectable} from "@angular/core";
import {NavigationService} from "../services/navigation.service";

@Injectable()
export class LoaderInterceptor implements HttpInterceptor {

  private navigationSubscription: Subscription | null = null;

  constructor(private navigationService: NavigationService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (!this.navigationSubscription) {
      this.navigationSubscription = this.navigationService.isNavigating$.subscribe(isNavigating => {
        if (isNavigating) {
          console.log('Navigation start');
        }
      });
    }

    return next.handle(req).pipe(
      tap(() => console.log('HTTP request sent')),
      finalize(() => {

        if (this.navigationSubscription) {
          this.navigationSubscription.unsubscribe();
          this.navigationSubscription = null;
        }
      })
    );
  }

}
