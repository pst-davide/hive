import { Component } from '@angular/core';
import {NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'app-edit-logo',
  standalone: true,
    imports: [
        NgOptimizedImage
    ],
  templateUrl: './edit-logo.component.html',
  styleUrl: './edit-logo.component.scss'
})
export class EditLogoComponent {

}
