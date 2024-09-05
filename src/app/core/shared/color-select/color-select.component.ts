import { Component } from '@angular/core';
import { NgxColorsModule } from 'ngx-colors';

@Component({
  selector: 'app-color-select',
  standalone: true,
  imports: [NgxColorsModule],
  templateUrl: './color-select.component.html',
  styleUrl: './color-select.component.scss'
})
export class ColorSelectComponent {

}
