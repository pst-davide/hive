import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import {NotifyService} from "./notify.service";

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  /* loader state */
  private isLoadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isLoading$: Observable<boolean> = this.isLoadingSubject.asObservable();

  private loadingComponents: Set<string> = new Set<string>();

  constructor(private notify: NotifyService) {}

  public setComponentLoader(componentId: string, toastMsg: string | null = null): void {
    this.loadingComponents.add(componentId);
    if (this.loadingComponents.size >= 1) {
      this.isLoadingSubject.next(true);

      if (toastMsg) {
        this.notify.loading(toastMsg);
      }
    }
  }

  public setComponentLoaded(componentId: string): void {
    this.loadingComponents.delete(componentId);

    if (this.loadingComponents.size === 0) {
      this.isLoadingSubject.next(false);
      this.notify.hide();
    }
  }

  public clearLoadingComponents(): void {
    this.loadingComponents.clear();
    this.loadingComponents = new Set<string>();

    this.isLoadingSubject.next(false);
    this.notify.hide();
  }
}
