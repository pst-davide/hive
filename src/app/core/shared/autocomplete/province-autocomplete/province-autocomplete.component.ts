import {
  Component, effect,
  input, InputSignal,
  model,
  ModelSignal,
  OnDestroy,
  OnInit
} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MatAutocompleteModule, MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatIconModule} from '@angular/material/icon';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {map, Observable, startWith, Subscription} from 'rxjs';
import {AddressService, ProvinceModel} from 'app/core/services/address.service';
import { RequireMatch } from 'app/core/functions/require-match.validator';

@Component({
  selector: 'app-province-autocomplete',
  standalone: true,
  imports: [CommonModule, MatAutocompleteModule, MatFormFieldModule, MatInputModule, FormsModule,
    ReactiveFormsModule, MatButtonModule, MatTooltipModule, MatIconModule],
  templateUrl: './province-autocomplete.component.html',
  styleUrl: './province-autocomplete.component.scss'
})
export class ProvinceAutocompleteComponent implements OnInit, OnDestroy {
  public doc$: ModelSignal<string | null> = model<string | null>(null);
  public label: InputSignal<string> = input<string>('Provincia');
  public placeholder: InputSignal<string> = input<string>('Seleziona una provincia...');
  public requiredError: InputSignal<string> = input<string>(`Il campo <strong>provincia</strong> è obbligatorio`);
  public matchError: InputSignal<string> = input<string>(`Seleziona un <strong>provincia</strong> valida`);
  public isRequired: InputSignal<boolean> = input<boolean>(false);
  public isEnabled: InputSignal<boolean> = input<boolean>(true);
  public isValid$: ModelSignal<boolean> = model<boolean>(true);

  public docCtrl: FormControl<string | null> = new FormControl();
  public docs: ProvinceModel[] = [];
  public docIds: string[] = [];
  public filteredDocs!: Observable<ProvinceModel[]>;

  private _subscription!: Subscription;

  constructor(private provinceService: AddressService) {
    effect(() => {
      const selectedDoc: string | null = this.doc$();
      this.docCtrl.setValue(selectedDoc);

      this.docCtrl.setValidators(RequireMatch(this.docIds, this.isRequired()));
      this.docCtrl.updateValueAndValidity();
    });
  }

  ngOnInit(): void {

    this._subscription = this.provinceService.getProvinces().subscribe(
      province => {
        this.docs = province ? province.province as ProvinceModel[] : [];
        this.docIds = this.docs.map(doc => doc.sigla );

        this.filteredDocs = this.docCtrl.valueChanges.pipe(
          startWith(''),
          map((value: string | null) => this._filter(value ?? ''))
        );

        const selectedDoc: string | null = this.doc$();
        this.docCtrl.setValue(selectedDoc);

        this.docCtrl.setValidators(RequireMatch(this.docIds, this.isRequired()));
        this.docCtrl.updateValueAndValidity();
      }
    );
  }

  ngOnDestroy() {
    if (this._subscription) {
      this._subscription.unsubscribe();
    }
  }

  private _filter(value: string): ProvinceModel[] {
    const filterValue: string = value.toLowerCase();

    return this.docs.filter((doc: ProvinceModel) =>
      doc.sigla.toLowerCase().includes(filterValue) ||
      doc.provincia.toLowerCase().includes(filterValue)
    );
  }

  public displayFn(event: string): string {
    const doc: ProvinceModel | null = this.docs.find((x: ProvinceModel) => x.sigla === event) ?? null;
    return doc ? `${doc.provincia} | ${doc.sigla}` : '';
  }

  public _onKeyUp(event: KeyboardEvent): void {
    if (event.code !== 'Tab') {
      this.isValid$.set(this.docCtrl.valid);
      if (this.docCtrl.valid) {
        this.doc$.set(this.docCtrl.value);
      }
    }
  }

  public _onSelectionChange(event?: MatAutocompleteSelectedEvent): void {
    this.doc$.set(event ? event.option.value : null);
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
