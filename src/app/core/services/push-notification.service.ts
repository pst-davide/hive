import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PushNotificationService {
  constructor() {}

  public requestNotificationPermission(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      Notification.requestPermission()
        .then((permission: NotificationPermission) => {
          if (permission === 'granted') {
            resolve(true);
          } else {
            reject(false);
          }
        })
        .catch(err => reject(err));
    });
  }

  public subscribeToPushNotifications(): void {
    console.log('Push Notification Service Subscription');
    navigator.serviceWorker.ready.then((registration) => {
      const applicationServerKey: Uint8Array = this.urlB64ToUint8Array('3OSEg8Q_yCEKBlSTTz-rOiIYKdpo0lVrAXKnh4Su6Es');
      console.log('Subscription Manager');
      registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey,
      }).then((subscription: PushSubscription) => {
        console.log('Subscription successful:', subscription);
        this.sendSubscriptionToServer(subscription);
      }).catch(err => console.error('Failed to subscribe:', err));
    }).catch(err => console.error('Service Worker not ready:', err));
  }

  private sendSubscriptionToServer(subscription: PushSubscription): void {
    fetch('http://localhost:3000/subscribe', {
      method: 'POST',
      body: JSON.stringify(subscription),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
    }).catch(err => console.error('Error sending subscription:', err));
  }

  private urlB64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData: any = window.atob(base64);
    return new Uint8Array([...rawData].map(char => char.charCodeAt(0)));
  }
}
