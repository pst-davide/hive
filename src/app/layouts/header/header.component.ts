import { Component, OnInit } from '@angular/core';
import { BreadcrumbComponent } from "../breadcrumb/breadcrumb.component";
import { Breadcrumb, BreadcrumbService } from 'app/core/services/breadcrumb.service';
import _ from 'lodash';
import { FontAwesomeModule, IconDefinition } from '@fortawesome/angular-fontawesome';
import { faBell, faGear, faUser } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [BreadcrumbComponent, FontAwesomeModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  public title: string = 'HIVE';

  public faUser: IconDefinition = faUser;
  public faGear: IconDefinition = faGear;
  public faBell: IconDefinition = faBell;

  constructor(private breadcrumbService: BreadcrumbService) {}

  ngOnInit(): void {
    this.breadcrumbService.getBreadcrumbs().subscribe((breadcrumbs: Breadcrumb[]) => {
      console.log(breadcrumbs);
      const lastBreadcrumbs: Breadcrumb | null = _.last(breadcrumbs) || null;
      this.title = lastBreadcrumbs ? lastBreadcrumbs.label : 'HIVE';
    });

  }
}
