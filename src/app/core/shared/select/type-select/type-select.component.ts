import {Component, input, InputSignal, model, ModelSignal, OnInit} from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import {FormControl, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatSelectChange, MatSelectModule} from '@angular/material/select';
import {ShiftService} from '../../../../admin/shifts/service/shift.service';
import {ShiftModel} from '../../../../admin/shifts/model/shift.model';
import {sortBy} from 'lodash';

@Component({
  selector: 'app-type-select',
  standalone: true,
  imports: [MatFormFieldModule, MatSelectModule, FormsModule, ReactiveFormsModule],
  templateUrl: './type-select.component.html',
  styleUrl: './type-select.component.scss'
})
export class TypeSelectComponent implements OnInit {
  public doc$: ModelSignal<string | null> = model<string | null>(null);
  public shift$: ModelSignal<ShiftModel | null> = model<ShiftModel | null>(null);
  public label: InputSignal<string> = input<string>('Causale');
  public requiredError: InputSignal<string> = input<string>(`Il campo <strong>causale</strong> è obbligatorio`);
  public isRequired: InputSignal<boolean> = input<boolean>(false);
  public isEnabled: InputSignal<boolean> = input<boolean>(true);
  public isValid$: ModelSignal<boolean> = model<boolean>(true);

  public docCtrl: FormControl<string | null> = new FormControl();
  public docs: ShiftModel[] = [];

  constructor(private crudService: ShiftService) {}

  ngOnInit(): void {
    this.getCollection().then(() => {
    });
  }

  private async getCollection(): Promise<void> {
    try {
      const docs: ShiftModel[] = await this.crudService.getDocs();
      this.docs = sortBy(docs, ['name']);

      const selectedDoc: string | null = (this.doc$() ?? '') as string;
      this.docCtrl.setValue(selectedDoc);

      this.docCtrl.clearValidators();
      if (this.isRequired()) {
        this.docCtrl.setValidators(Validators.required);
      }
      this.docCtrl.updateValueAndValidity();
    } catch (error) {
      console.error('Errore durante il caricamento dei documenti:', error);
    }
  }

  public _update(event: MatSelectChange): void {
    this.doc$.update(() => event.value);
    const shift: ShiftModel | null = this.docs.find((x: ShiftModel) => x.id === event.value) ?? null;
    this.shift$.update(() => shift);
  }
}
