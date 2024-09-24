import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, filter, Observable } from 'rxjs';

export interface Breadcrumb {
  label: string;
  url: string;
  enabled: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {
  private breadcrumbs$: BehaviorSubject<Breadcrumb[]> = new BehaviorSubject<Breadcrumb[]>([]);

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const root = this.router.routerState.snapshot.root;
        const breadcrumbs: Breadcrumb[] = this.createBreadcrumbs(root);
        this.breadcrumbs$.next(breadcrumbs);
      });
  }

  getBreadcrumbs(): Observable<Breadcrumb[]> {
    return this.breadcrumbs$.asObservable();
  }

  private createBreadcrumbs(route: ActivatedRouteSnapshot, url: string = '', breadcrumbs: Breadcrumb[] = []): Breadcrumb[] {
    const children: ActivatedRouteSnapshot[] = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      const routeURL: string = child.url.map(segment => segment.path).join('/');
      if (routeURL !== '') {
        url += `/${routeURL}`;
      }

      const label: string = child.data['breadcrumb'];
      const enabled: boolean = child.data['enabled'] ?? false;
      const parentRoute: string = child.data['parent'];  // Verifica se c'è una rotta genitore

      // Se c'è una rotta genitore, aggiungila manualmente ai breadcrumb
      if (parentRoute) {
        const parentLabel = this.getLabelForRoute(parentRoute); // Funzione che restituisce il label della rotta genitore
        if (parentLabel) {
          breadcrumbs.push({ label: parentLabel, url: `/${parentRoute}`, enabled: true });
        }
      }

      if (label) {
        breadcrumbs.push({ label, url, enabled });
      }

      return this.createBreadcrumbs(child, url, breadcrumbs);
    }

    return breadcrumbs;
  }

// Funzione che restituisce il label di una route dato il suo path
  private getLabelForRoute(path: string): string | null {
    const route = this.router.config.find(r => r.path === path);
    return route ? route.data?.['breadcrumb'] : null;
  }

}
