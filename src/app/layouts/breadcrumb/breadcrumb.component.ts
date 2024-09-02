import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {filter, map} from 'rxjs';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss'
})
export class BreadcrumbComponent implements OnInit {
  public breadcrumbs: Array<{label: string, url: string}> = [];

  constructor(private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => {
          console.log('aaa')
          return this.buildBreadcrumb(this.route.root);
        })
      )
      .subscribe(breadcrumbs => {
        console.log(breadcrumbs);
        this.breadcrumbs = breadcrumbs;
      });
  }

  private buildBreadcrumb(route: ActivatedRoute, url: string = '',
                          breadcrumbs: Array<{ label: string,
                            url: string }> = []): Array<{ label: string, url: string }> {

    console.log(route)
  const children: ActivatedRoute[] = route.children;

  if (children.length === 0) {
    return breadcrumbs;
  }

  for (const child of children) {
    const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');
    if (routeURL !== '') {
      url += `/${routeURL}`;
    }

    const label = child.snapshot.data['breadcrumb'];
    if (label) {
      breadcrumbs.push({ label, url });
    }

    // Chiamata ricorsiva senza return immediato
    this.buildBreadcrumb(child, url, breadcrumbs);
  }

  return breadcrumbs;
}
}
