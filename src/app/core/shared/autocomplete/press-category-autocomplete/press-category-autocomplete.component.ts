import {Component, input, InputSignal, model, ModelSignal, OnInit} from '@angular/core';
import {PRESS_CATEGORY_TYPE} from '../../../../admin/press/model/press-category.model';
import {PressService} from '../../../../admin/press/service/press.service';
import {map, Observable, startWith, take} from 'rxjs';
import {AsyncPipe} from '@angular/common';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {
  MatAutocomplete,
  MatAutocompleteSelectedEvent,
  MatAutocompleteTrigger,
  MatOption
} from '@angular/material/autocomplete';
import {MatError, MatFormField, MatLabel, MatSuffix} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';
import {MatInput} from '@angular/material/input';
import {MatTooltip} from '@angular/material/tooltip';
import {RequireMatch} from '../../../functions/require-match.validator';

@Component({
  selector: 'app-press-category-autocomplete',
  standalone: true,
  imports: [
    AsyncPipe,
    FormsModule,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatError,
    MatFormField,
    MatIcon,
    MatIconButton,
    MatInput,
    MatLabel,
    MatOption,
    MatSuffix,
    MatTooltip,
    ReactiveFormsModule
  ],
  templateUrl: './press-category-autocomplete.component.html',
  styleUrl: './press-category-autocomplete.component.scss'
})
export class PressCategoryAutocompleteComponent implements OnInit {

  public doc$: ModelSignal<number | null> = model<number | null>(null);
  public label: InputSignal<string> = input<string>('Argomento');
  public placeholder: InputSignal<string> = input<string>('Seleziona un argomento...');
  public requiredError: InputSignal<string> = input<string>(`Il campo <strong>argomento</strong> è obbligatorio`);
  public matchError: InputSignal<string> = input<string>(`Seleziona un <strong>argomento</strong> valido`);
  public isRequired: InputSignal<boolean> = input<boolean>(false);
  public isEnabled: InputSignal<boolean> = input<boolean>(true);
  public isValid$: ModelSignal<boolean> = model<boolean>(true);

  public docCtrl: FormControl<string | null> = new FormControl();
  public docs: PRESS_CATEGORY_TYPE[] = [];
  public docIds: number[] = [];
  public filteredDocs!: Observable<PRESS_CATEGORY_TYPE[]>;

  constructor(private crudService: PressService) {
  }

  ngOnInit(): void {
    this.getCollection();
  }

  private getCollection(): void {
    this.crudService.getDocs().pipe(take(1)).subscribe({
      next: (data: PRESS_CATEGORY_TYPE[]) => {
        this.docs = data;
        this.docIds = this.docs.map((doc: PRESS_CATEGORY_TYPE) => doc.id );

        this.filteredDocs = this.docCtrl.valueChanges.pipe(
          startWith(''),
          map((value: string | null) => this._filter(value?.toString() ?? ''))
        );

        const selectedDoc: string | null = (this.doc$() ?? '') as string;
        this.docCtrl.setValue(selectedDoc);

        this.docCtrl.setValidators(RequireMatch(this.docIds, this.isRequired()));
        this.docCtrl.updateValueAndValidity();
      },
      error: (error) => {
        console.error('Errore durante il recupero dei documenti:', error);
      },
      complete: () => {
        console.log('Recupero documenti completato');
      }
    });
  }

  private _filter(value: string): PRESS_CATEGORY_TYPE[] {
    const filterValue: string = value.toLowerCase();

    return this.docs.filter((doc: PRESS_CATEGORY_TYPE) =>
      doc.name && doc.name.toLowerCase().includes(filterValue)
    );
  }

  public displayFn(event: number): string {
    const doc: PRESS_CATEGORY_TYPE | null = this.docs.find((x: PRESS_CATEGORY_TYPE) => x.id === event) ?? null;
    return doc ? `${doc.name}` : '';
  }

  public _onKeyUp(event: KeyboardEvent): void {
    if (event.code !== 'Tab') {
      this.isValid$.set(this.docCtrl.valid);
      if (this.docCtrl.valid) {
        this.doc$.set(this.docCtrl.value ? parseInt(this.docCtrl.value, 10) : null);
      }
    }
  }

  public _onSelectionChange(event?: MatAutocompleteSelectedEvent): void {
    this.doc$.set(event ? parseInt(event.option.value, 10) : null);
    if (!event) {
      this.isValid$.set(!this.isRequired);
    } else {
      this.isValid$.set(this.docCtrl.valid);
    }
  }

  public _remove(): void {
    this.docCtrl.setValue(null);
    this.doc$.set(null);
    this.isValid$.set(!this.isRequired);
  }
}
