import {Component, Inject, model, ModelSignal, OnDestroy, OnInit, signal, WritableSignal} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import _ from 'lodash';
import {EMPTY_LOCATION, LocationModel} from '../../model/location.model';
import {distinctUntilChanged, Observable, Subject, takeUntil} from 'rxjs';
import {FontAwesomeModule, IconDefinition} from '@fortawesome/angular-fontawesome';
import {LocationService} from '../../service/location.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import {NgxColorsModule, validColorValidator} from 'ngx-colors';
import {CommonModule} from '@angular/common';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {
  ProvinceAutocompleteComponent
} from '../../../../core/shared/autocomplete/province-autocomplete/province-autocomplete.component';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {
  CityAutocompleteComponent
} from '../../../../core/shared/autocomplete/city-autocomplete/city-autocomplete.component';
import {GeoResponse, GeoService} from '../../../../core/services/geo.service';
import {AddressService, CityModel, ZipModel} from "../../../../core/services/address.service";

@Component({
  selector: 'app-location',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, ReactiveFormsModule, MatInputModule,
    MatFormFieldModule, NgxColorsModule, ProvinceAutocompleteComponent, MatCheckboxModule, MatSlideToggleModule, CityAutocompleteComponent],
  templateUrl: './location.component.html',
  styleUrl: './location.component.scss'
})
export class LocationComponent implements OnInit, OnDestroy {

  /* loading */
  public isLoading$!: Observable<boolean>;

  /* title */
  public formTitle: string = 'Nuova Sede';

  /* icons */
  public faTimes: IconDefinition = faTimes;

  /* icons */
  public doc: LocationModel = _.cloneDeep(EMPTY_LOCATION);

  /* form */
  public form: FormGroup = new FormGroup({});

  /* province and city */
  public city$: ModelSignal<string | null> = model<string | null>(null);
  public province$: ModelSignal<string | null> = model<string | null>(null);
  public isProvinceValid$: ModelSignal<boolean> = model<boolean>(false);
  public required$: WritableSignal<boolean> = signal<boolean>(true);

  /* zip */
  public zips: ZipModel[] = [];

  /* cities */
  public cities: CityModel[] = [];

  /* form */
  private destroy$: Subject<void> = new Subject<void>();

  constructor(public dialogRef: MatDialogRef<LocationComponent>, @Inject(MAT_DIALOG_DATA) public data: LocationModel,
              private fb: FormBuilder, private crudService: LocationService, private geoService: GeoService,
              private addressService: AddressService) {
  };

  ngOnInit(): void {
    this.doc = this.data;
    this.formTitle = this.doc.name ? `Modifica Sede - ${this.doc.name}` : 'Nuova Sede';
    this.createForm();
    this.getCities();
    this.getZips();


  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /*************************************************
   *
   * Form
   *
   ************************************************/

  private patchForm(doc: LocationModel): void {
    this.province$.set(doc.address.province);
    this.city$.set(doc.address.city);

    this.form.patchValue({
      code: doc.code,
      name: doc.name,
      enabled: doc.enabled ?? true,
      description: doc.description,
      color: doc.color,
      province: doc.address.province,
      city: doc.address.city,
      street: doc.address.street,
      zip: doc.address.zip
    });
  }

  private createForm(): void {
    this.form = this.fb.group({
      code: ['', Validators['required']],
      name: ['', Validators['required']],
      enabled: [true],
      description: [null],
      color: [null, [Validators['required'], validColorValidator()]],
      picker: [null],
      province: ['', Validators['required']],
      city: ['', Validators['required']],
      street: ['', Validators['required']],
      zip: [null],
    });

    this.initializeSubscriptions();

    this.patchForm(this.doc);
  }

  private initializeSubscriptions(): void {

    this.color.valueChanges.subscribe((color) => {
      if (this.form.controls['picker'].valid) {
        this.form.controls['picker'].setValue(color, {
          emitEvent: false,
        });
      }
    });

    this.form.controls['picker'].valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((color: any) =>
        this.color.setValue(color, {
          emitEvent: false,
        })
      );

    this.province$.subscribe(() => {
      this.zip.setValue(null);
    });

    this.city$.subscribe((city: string | null) => {
      this.zip.setValue(this.findZip(city));
    });

    this.name.valueChanges.pipe(
      takeUntil(this.destroy$),
      distinctUntilChanged()
    ).subscribe((name: string | null) => {
      if (!name) {
        return;
      }

      const capitalizedValue: string = name.charAt(0).toUpperCase() + name.slice(1);
      this.name.setValue(capitalizedValue);
    });
  }

  public async onSubmit(): Promise<void> {

    if (!this.form.valid) {
      for (const controlName in this.form.controls) {
        if (this.form.controls[controlName].invalid) {
          console.error(`Il campo ${controlName} è invalido.`);
        }
      }
      return;
    }

    const room: LocationModel = _.cloneDeep(EMPTY_LOCATION);
    room.id = this.code.value.toUpperCase();
    room.code = this.code.value.toUpperCase();
    room.name = this.name.value;
    room.description = this.form.get('description')?.value ?? null;
    room.color = this.color.value;
    room.enabled = this.form.get('enabled')?.value ?? true;

    room.address = {
      street: this.form.get('street')?.value ?? null,
      zip: this.form.get('zip')?.value ?? null,
      province: this.province$() ?? null,
      city: this.city$() ?? null,
      latitude: room.address.latitude,
      longitude: room.address.longitude,
    };

    const {street = null, province = '', city = null} = room.address;

    if (street && city) {
      const address: string = `${street} ${this.findCity(city)} ${province}`;
      const geocode: GeoResponse | null = await this.getGeocode(address);
      room.address.latitude = geocode?.lat ?? 0;
      room.address.longitude = geocode?.lng ?? 0;
    }

    // await this.crudService.createDoc(room);
  }

  public closeDialog(): void {
    this.dialogRef.close();
  }

  /*************************************************
   *
   * Color
   *
   ************************************************/

  public _onColorChange(event: any): void {
    this.color.setValue(event);
  }

  /*************************************************
   *
   * Zip
   *
   ************************************************/

  private getZips(): void {
    this.addressService.getZip().pipe(takeUntil(this.destroy$)).subscribe(zip => {
      this.zips = zip.zip ?? [];
    });
  }

  private findZip(istat: string | null): string | null {
    if (!istat) {
      return null;
    }
    const zip: ZipModel | null = this.zips.find((zip: ZipModel) => zip.istat === istat) ?? null;
    return zip ? zip.cap : null;
  }

  /*************************************************
   *
   * City
   *
   ************************************************/

  private getCities(): void {
    this.addressService.getCities().pipe(takeUntil(this.destroy$)).subscribe(city => {
      this.cities = city.city ?? [];
    });
  }

  private findCity(istat: string | null): string | null {
    if (!istat) {
      return null;
    }
    const city: CityModel | null = this.cities.find((city: CityModel) => city.istat === istat) ?? null;
    return city ? city.comune : null;
  }

  /*************************************************
   *
   * Geocode
   *
   ************************************************/

  private async getGeocode(address: string): Promise<GeoResponse | null> {
    return await this.geoService.geocodeAddress(address);
  }

  /************************************************
   *
   * Controls
   *
   ***********************************************/

  get code(): AbstractControl {
    return this.form.get('code') as AbstractControl;
  }

  get name(): AbstractControl {
    return this.form.get('name') as AbstractControl;
  }

  get color(): AbstractControl {
    return this.form.get('color') as AbstractControl;
  }

  get street(): AbstractControl {
    return this.form.get('street') as AbstractControl;
  }

  get zip(): AbstractControl {
    return this.form.get('zip') as AbstractControl;
  }

}
