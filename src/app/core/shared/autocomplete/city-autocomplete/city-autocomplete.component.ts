import { Component, input, InputSignal, model, ModelSignal, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {FormControl} from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatIconModule} from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { map, Observable, startWith, Subscription } from 'rxjs';
import { AddressService, CityModel } from 'app/core/services/address.service';
import { RequireMatch } from 'app/core/functions/require-match.validator';

@Component({
  selector: 'app-city-autocomplete',
  standalone: true,
  imports: [CommonModule, MatAutocompleteModule, MatFormFieldModule, MatInputModule, FormsModule,
    ReactiveFormsModule, MatButtonModule, MatTooltipModule, MatIconModule],
  templateUrl: './city-autocomplete.component.html',
  styleUrl: './city-autocomplete.component.scss'
})
export class CityAutocompleteComponent implements OnInit, OnDestroy, OnChanges {
  public doc$: ModelSignal<string | null> = model<string | null>(null);
  public province$: ModelSignal<string | null> = model<string | null>(null);
  public label: InputSignal<string> = input<string>('Comune');
  public placeholder: InputSignal<string> = input<string>('Seleziona un comune...');
  public requiredError: InputSignal<string> = input<string>(`Il campo <strong>comune</strong> è obbligatorio`);
  public matchError: InputSignal<string> = input<string>(`Seleziona un <strong>comune</strong> valido`);
  public isRequired: InputSignal<boolean> = input<boolean>(false);
  public isEnabled: InputSignal<boolean> = input<boolean>(true);
  public isValid$: ModelSignal<boolean> = model<boolean>(true);

  public docCtrl: FormControl<any> = new FormControl();
  public docs: CityModel[] = [];
  public provinceDocs: CityModel[] = [];
  public docIds: string[] = [];
  public filteredDocs!: Observable<CityModel[]>;

  private _subscription!: Subscription;

  constructor(private addressService: AddressService) {}

  ngOnInit(): void {

      this._subscription = this.addressService.getCities()
      .subscribe(
        city => {
          this.docs = city ? city.city as CityModel[] : [];
          this.docIds = this.docs.map(doc => doc.istat );

          const selectedDoc: string | null = this.doc$();
          this.docCtrl.setValue(selectedDoc);

          this.docCtrl.setValidators(RequireMatch(this.docIds, this.isRequired()));
          this.docCtrl.updateValueAndValidity();

          this.filteredDocs = this.getFilteredDocs();

        }
      );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['province$']) {
      this.docCtrl.setValue(null);
      this.setProvinceCities(this.province$());
    }
  }

  ngOnDestroy() {
    if (this._subscription) {
      this._subscription.unsubscribe();
    }
  }

  private setProvinceCities(filteredProvince: string | null): void {
    this.provinceDocs = filteredProvince ? this.docs.filter(doc => doc.provincia === filteredProvince) : [];
    this.filteredDocs = this.getFilteredDocs();
  }

  private getFilteredDocs(): Observable<CityModel[]> {
    return this.docCtrl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const filteredProvince = this.province$();
        const filterValue = value ? value.toLowerCase() : '';
        return this.provinceDocs.filter(doc => {
          const includeDoc =
            doc.comune.toLowerCase().includes(filterValue) ||
            doc.provincia.toLowerCase().includes(filterValue) ||
            doc.regione.toLowerCase().includes(filterValue) ||
            doc.istat.toLowerCase().includes(filterValue);
          // Filtra per provincia solo se `filteredProvince` è valorizzato
          return includeDoc && (!filteredProvince || doc.provincia === filteredProvince);
        });
      })
    );
  }

  public displayFn(event: string): string {
    const doc = this.docs.find((x: CityModel) => x.istat === event);
    return doc ? `${doc.comune} | ${doc.istat}` : '';
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
