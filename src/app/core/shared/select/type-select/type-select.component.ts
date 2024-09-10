import { Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatSelectModule} from '@angular/material/select';
import _ from 'lodash';

@Component({
  selector: 'app-type-select',
  standalone: true,
  imports: [MatFormFieldModule, MatSelectModule, FormsModule, ReactiveFormsModule],
  templateUrl: './type-select.component.html',
  styleUrl: './type-select.component.scss'
})
export class TypeSelectComponent {
  typeCtrl = new FormControl('');

  types: string[] = ['Evento', 'Conferenza', 'Riunione', 'Altro', 'Inagibile'].sort();
}
