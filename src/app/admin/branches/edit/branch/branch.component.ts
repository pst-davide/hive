import {Component, Inject, model, ModelSignal, OnDestroy, OnInit, signal, WritableSignal} from '@angular/core';
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import {AsyncPipe} from '@angular/common';
import {
  CityAutocompleteComponent
} from '../../../../core/shared/autocomplete/city-autocomplete/city-autocomplete.component';
import {FaIconComponent, IconDefinition} from '@fortawesome/angular-fontawesome';
import {MatError, MatFormField, MatLabel, MatSuffix} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {NgxColorsModule, validColorValidator} from 'ngx-colors';
import {NgxMaskDirective} from 'ngx-mask';
import {
  ProvinceAutocompleteComponent
} from '../../../../core/shared/autocomplete/province-autocomplete/province-autocomplete.component';
import {AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ReactiveTypedFormsModule} from '@rxweb/reactive-form-validators';
import { MapComponent } from 'app/core/dialog/map/map.component';
import {GeoResponse, GeoService} from '../../../../core/services/geo.service';
import {AddressService, CityModel, ZipModel} from 'app/core/services/address.service';
import {distinctUntilChanged, Observable, Subject, takeUntil} from 'rxjs';
import {BRANCH_TYPE, EMPTY_BRANCH} from '../../model/branchModel';
import {BranchesComponent} from '../../branches.component';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {BranchService} from '../../service/branch.service';
import _ from 'lodash';

@Component({
  selector: 'app-branch',
  standalone: true,
  imports: [
    AsyncPipe,
    CityAutocompleteComponent,
    FaIconComponent,
    MatError,
    MatFormField,
    MatInput,
    MatLabel,
    MatSlideToggle,
    MatSuffix,
    NgxColorsModule,
    NgxMaskDirective,
    ProvinceAutocompleteComponent,
    ReactiveFormsModule,
    ReactiveTypedFormsModule
  ],
  templateUrl: './branch.component.html',
  styleUrl: './branch.component.scss'
})
export class BranchComponent implements OnInit, OnDestroy {

  /* loading */
  public isLoading$!: Observable<boolean>;

  /* title */
  public formTitle: string = 'Nuova Sede';

  /* icons */
  public faTimes: IconDefinition = faTimes;

  /* icons */
  public doc: BRANCH_TYPE = _.cloneDeep(EMPTY_BRANCH);

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
  public isReadOnly: boolean = false;

  constructor(public dialogRef: MatDialogRef<BranchesComponent>, @Inject(MAT_DIALOG_DATA) public data: BRANCH_TYPE,
              private fb: FormBuilder, private crudService: BranchService, private geoService: GeoService,
              private addressService: AddressService, public dialog: MatDialog) {
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

  private patchForm(doc: BRANCH_TYPE): void {
    this.province$.set(doc.address.province);
    this.city$.set(doc.address.city);

    this.form.patchValue({
      code: doc.code,
      name: doc.name,
      enabled: doc.enabled ?? true,
      description: doc.description,
      phone: doc.phone,
      email: doc.email,
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
      phone: [null],
      email: [null, Validators['email']],
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

    this.isReadOnly = !!this.doc.code;

    this.color.valueChanges.subscribe((color) => {
      if (this.form.controls['picker'].valid) {
        this.form.controls['picker'].setValue(color, {
          emitEvent: false,
        });
      }
    });

    this.form.controls['picker'].valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((color: string) =>
        this.color.setValue(color, {
          emitEvent: false,
        })
      );

    this.province$.subscribe((province: string | null) => {
      this.province.setValue(province);
      this.zip.setValue(null);
    });

    this.city$.subscribe((city: string | null) => {
      this.city.setValue(city);
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

    this.doc.code = this.code.value.toUpperCase();
    this.doc.name = this.name.value;
    this.doc.description = this.form.get('description')?.value ?? null;
    this.doc.phone = this.phone.value ?? null;
    this.doc.email = this.email.value ?? null;
    this.doc.color = this.color.value;
    this.doc.enabled = this.form.get('enabled')?.value ?? true;

    this.doc.address = {
      street: this.form.get('street')?.value ?? null,
      zip: this.form.get('zip')?.value ?? null,
      province: this.province$() ?? null,
      city: this.city$() ?? null,
      latitude: this.doc.address.latitude,
      longitude: this.doc.address.longitude,
    };

    const {street = null, province = '', city = null} = this.doc.address;

    if (street && city) {
      const address: string = `${street} ${this.findCity(city)} ${province}`;
      const geocode: GeoResponse | null = await this.getGeocode(address);
      this.doc.address.latitude = geocode?.lat ?? 0;
      this.doc.address.longitude = geocode?.lng ?? 0;
    }

    if (!this.doc.id) {
      this.doc.id = this.code.value.toUpperCase();
      await this.crudService.createDoc(this.doc);
    } else {
      await this.crudService.updateDoc(this.doc.id, this.doc);
    }


    this.dialogRef.close(this.doc);
  }

  public closeDialog(): void {
    this.dialogRef.close(null);
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

  public _openMap(): void {
    const {street = null, province = '', city = null} = this.doc.address;

    if (street && city) {
      const address: string = `${street} ${this.findCity(city)} ${province}`;

      this.dialog.open(MapComponent, {
        width: '100%',
        height: '100%',
        data: {address: this.doc.address, title: address}
      });
    }

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

  get province(): AbstractControl {
    return this.form.get('province') as AbstractControl;
  }

  get city(): AbstractControl {
    return this.form.get('city') as AbstractControl;
  }

  get street(): AbstractControl {
    return this.form.get('street') as AbstractControl;
  }

  get zip(): AbstractControl {
    return this.form.get('zip') as AbstractControl;
  }

  get phone(): AbstractControl {
    return this.form.get('phone') as AbstractControl;
  }

  get email(): AbstractControl {
    return this.form.get('email') as AbstractControl;
  }

}
