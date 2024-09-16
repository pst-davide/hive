import {Component} from '@angular/core';
import {TableTemplateComponent} from '../../core/shared/table-template/table-template.component';

@Component({
  selector: 'app-press-categories',
  standalone: true,
  imports: [
    TableTemplateComponent
  ],
  templateUrl: './press-categories.component.html',
  styleUrl: './press-categories.component.scss'
})
export class PressCategoriesComponent {
  public filters: Record<string, string> = {
    code: '',
    name: '',
    description: '',
  };
}
