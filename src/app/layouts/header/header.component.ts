import { Component, OnInit } from '@angular/core';
import { BreadcrumbComponent } from "../breadcrumb/breadcrumb.component";
import { Breadcrumb, BreadcrumbService } from 'app/core/services/breadcrumb.service';
import _ from 'lodash';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [BreadcrumbComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  public title: string = 'Index';
  
  constructor(private breadcrumbService: BreadcrumbService) {}

  ngOnInit(): void {
    this.breadcrumbService.getBreadcrumbs().subscribe((breadcrumbs: Breadcrumb[]) => {
      console.log(breadcrumbs);
      const lastBreadcrumbs: Breadcrumb | null = _.last(breadcrumbs) || null;
      this.title = lastBreadcrumbs ? lastBreadcrumbs.label : 'Index';
    });
      
  }
}
