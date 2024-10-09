import { RouteReuseStrategy, ActivatedRouteSnapshot, DetachedRouteHandle } from '@angular/router';

export class CustomReuseStrategy implements RouteReuseStrategy {
  handlers: { [key: string]: DetachedRouteHandle } = {};

  // Decide se staccare la rotta per la cache
  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return false; // Non staccare mai, quindi nessun caching
  }

  // Decide se salvare la route handle
  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
    // Non facciamo nulla, dato che non vogliamo memorizzare alcuna rotta
  }

  // Decide se ricollegare una rotta memorizzata
  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return false; // Non ricollegare mai, vogliamo sempre creare una nuova istanza
  }

  // Restituisce la rotta memorizzata (nessuna in questo caso)
  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    return null; // Non recuperiamo nulla dalla cache
  }

  // Forza il router a non riutilizzare alcune rotte specifiche
  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    const noReuseRoutes: string[] = ['press/categories', 'press/keywords', 'locations'];
    return !noReuseRoutes.includes(future.routeConfig?.path || '') && future.routeConfig === curr.routeConfig;
  }
}
