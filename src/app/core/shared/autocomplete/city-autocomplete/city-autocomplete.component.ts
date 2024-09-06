import { Component, EventEmitter, Input, OnChanges, OnInit, Output, signal, SimpleChanges, WritableSignal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatIconModule} from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { map, Observable, startWith } from 'rxjs';
import moment, { Moment } from 'moment';
import { AddressService, CityModel } from 'app/core/services/address.service';

@Component({
  selector: 'app-city-autocomplete',
  standalone: true,
  imports: [CommonModule, MatAutocompleteModule, MatFormFieldModule, MatInputModule, FormsModule,
    ReactiveFormsModule, MatButtonModule, MatTooltipModule, MatIconModule],
  templateUrl: './city-autocomplete.component.html',
  styleUrl: './city-autocomplete.component.scss'
})
export class CityAutocompleteComponent implements OnInit, OnChanges {
  @Input() currentDoc$: WritableSignal<string| null> = signal<string| null>(null);
  @Input() province$: WritableSignal<string| null> = signal<string| null>(null);
  @Input() label: string = 'Comune';
  @Input() placeholder: string = 'Seleziona un comune...';
  @Input() requiredError: string = `Il campo <strong>comune</strong> è obbligatorio`;
  @Input() matchError: string = `Seleziona un <strong>comune</strong> valido`;
  @Input() isRequired: boolean = true;
  @Input() isEnabled: boolean = true;
  @Input() forceChanges: Moment = moment();

  @Output() selectedDoc: EventEmitter<string | null> = new EventEmitter<string | null>();
  @Output() selectedValid: EventEmitter<boolean> = new EventEmitter<boolean>();

  public docCtrl = new FormControl();
  public docs: CityModel[] = [];
  public filteredDocs!: Observable<CityModel[]>;

  constructor(private addressService: AddressService) {}

  ngOnInit(): void {
      this.addressService.getCities().subscribe(
        city => {
          this.docs = city ? city.city as CityModel[] : [];
          this.filteredDocs = this.getFilteredDocs();

          const selectedDoc: string | null = this.currentDoc$();
          this.docCtrl.setValue(selectedDoc);
        }
      );
  }

  ngOnChanges(changes: SimpleChanges): void {
    const selectedDoc: string | null = this.currentDoc$();
    this.docCtrl.setValue(selectedDoc);
  }

  private _filter(value: string): CityModel[] {
    const filterValue = value.toLowerCase();

    return this.docs.filter((doc: CityModel) =>
      doc.comune.toLowerCase().includes(filterValue) ||
      doc.provincia.toLowerCase().includes(filterValue) ||
      doc.regione.toLowerCase().includes(filterValue) ||
      doc.istat.toLowerCase().includes(filterValue)
    );
  }

  private getFilteredDocs(): Observable<CityModel[]> {
    return this.docCtrl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const filteredProvince = this.province$();
        const filterValue = value.toLowerCase();
        return this.docs.filter(doc => {
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
      this.selectedValid.next(this.docCtrl.valid);
    }
  }

  public _onSelectionChange(event?: MatAutocompleteSelectedEvent): void {
    if (!event) {
      this.selectedDoc.next(null);
      this.selectedValid.next(!this.isRequired);
    } else {
      this.selectedDoc.next(event.option.value);
      this.selectedValid.next(this.docCtrl.valid);
    }
  }

  public _remove(): void {
    this.docCtrl.setValue(null);
    this.selectedDoc.next(null);
    this.selectedValid.next(!this.isRequired);
  }
}
