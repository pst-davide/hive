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
import { AddressService, ProvinceModel } from 'app/core/services/address.service';

@Component({
  selector: 'app-province-autocomplete',
  standalone: true,
  imports: [CommonModule, MatAutocompleteModule, MatFormFieldModule, MatInputModule, FormsModule,
    ReactiveFormsModule, MatButtonModule, MatTooltipModule, MatIconModule],
  templateUrl: './province-autocomplete.component.html',
  styleUrl: './province-autocomplete.component.scss'
})
export class ProvinceAutocompleteComponent implements OnInit, OnChanges {
  @Input() currentDoc$: WritableSignal<string| null> = signal<string| null>(null);
  @Input() label: string = 'Provincia';
  @Input() placeholder: string = 'Seleziona una provincia...';
  @Input() requiredError: string = `Il campo <strong>provincia</strong> è obbligatorio`;
  @Input() matchError: string = `Seleziona un <strong>provincia</strong> valida`;
  @Input() isRequired: boolean = true;
  @Input() isEnabled: boolean = true;
  @Input() forceChanges: Moment = moment();

  @Output() selectedDoc: EventEmitter<string | null> = new EventEmitter<string | null>();
  @Output() selectedValid: EventEmitter<boolean> = new EventEmitter<boolean>();

  public docCtrl = new FormControl();
  public docs: ProvinceModel[] = [];
  public filteredDocs!: Observable<ProvinceModel[]>;

  constructor(private provinceService: AddressService) {}

  ngOnInit(): void {
      this.provinceService.getProvincies().subscribe(
        province => {
          this.docs = province ? province.province as ProvinceModel[] : [];
          this.filteredDocs = this.docCtrl.valueChanges.pipe(
            startWith(''),
            map(value => this._filter(value))
          );

          const selectedDoc: string | null = this.currentDoc$();
          this.docCtrl.setValue(selectedDoc);
        }
      );
  }

  ngOnChanges(changes: SimpleChanges): void {
    const selectedDoc: string | null = this.currentDoc$();
    this.docCtrl.setValue(selectedDoc);
  }

  private _filter(value: string): ProvinceModel[] {
    const filterValue = value.toLowerCase();

    return this.docs.filter((doc: ProvinceModel) =>
      doc.sigla.toLowerCase().includes(filterValue) ||
      doc.provincia.toLowerCase().includes(filterValue)
    );
  }

  public displayFn(event: string): string {
    console.log(event);
    const doc = this.docs.find((x: ProvinceModel) => x.sigla === event);
    return doc ? `${doc.provincia} | ${doc.sigla}` : '';
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
