import { Injectable } from '@angular/core';
import {HotToastService} from "@ngxpert/hot-toast";

@Injectable({
  providedIn: 'root'
})
export class NotifyService {

  constructor(private toast: HotToastService) { }

  public loading(msg: string = 'caricamento in corso...'): void {
    this.toast.loading(msg, {
      dismissible: false,
      autoClose: false,
      className: 'p-5',
    });
  }

  public hide(): void {
    this.toast.close();
  }
}
