import { Injectable } from '@angular/core';
import { SwPush } from '@angular/service-worker';

@Injectable({
  providedIn: 'root'
})
export class CommunicationService {

  constructor(private swPush: SwPush) { }

  public sendMessage(message: string): void {

  }
}
