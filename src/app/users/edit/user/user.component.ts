import {Component, Inject, model, ModelSignal, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {FormGroup, ReactiveFormsModule, FormsModule, AbstractControl, Validators, FormBuilder} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {distinctUntilChanged, Observable, Subject, takeUntil} from 'rxjs';
import _ from 'lodash';
import {EditLogoComponent} from '../../../layouts/edit-logo/edit-logo.component';
import {BranchesComponent} from '../../../admin/branches/branches.component';
import {EMPTY_USER, USER_ROLES, USER_TYPE} from '../../model/user.model';
import {UserService} from '../../service/user.service';
import {MatSelectModule} from '@angular/material/select';
import {LabelModel} from '../../../core/model/label.model';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {generatePassword} from '../../../core/functions/password-generator';
import {CfValidator} from '../../../core/functions/cf-validator';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {provideMomentDateAdapter} from '@angular/material-moment-adapter';
import {AddressService, CityModel} from '../../../core/services/address.service';
import {
  CityAutocompleteComponent
} from '../../../core/shared/autocomplete/city-autocomplete/city-autocomplete.component';
import {
  ProvinceAutocompleteComponent
} from '../../../core/shared/autocomplete/province-autocomplete/province-autocomplete.component';
import {NgxMaskDirective} from 'ngx-mask';
import moment from 'moment';
import {DialogCloseButtonComponent} from '../../../layouts/dialog-close-button/dialog-close-button.component';

@Component({
  selector: 'app-user',
  standalone: true,
    imports: [
      CommonModule,
      FormsModule,
      ReactiveFormsModule,
      MatInputModule,
      MatFormFieldModule,
      EditLogoComponent,
      MatSelectModule,
      MatSlideToggle,
      MatDatepickerModule,
      CityAutocompleteComponent,
      ProvinceAutocompleteComponent,
      NgxMaskDirective,
      DialogCloseButtonComponent
    ],
  providers: [
    provideMomentDateAdapter(),
  ],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss'
})
export class UserComponent implements OnInit, OnDestroy {

  /* loading */
  public isLoading$!: Observable<boolean>;

  /* title */
  public formTitle: string = 'Nuovo Utente';

  /* doc */
  public doc: USER_TYPE = _.cloneDeep(EMPTY_USER);

  public cities: CityModel[] = [];

  /* form */
  public form: FormGroup = new FormGroup({});
  public userRoles: LabelModel[] = USER_ROLES;
  public isReadOnly: boolean = false;

  /* province and city */
  public city$: ModelSignal<string | null> = model<string | null>(null);
  public province$: ModelSignal<string | null> = model<string | null>(null);
  public isProvinceValid$: ModelSignal<boolean> = model<boolean>(false);

  /* subject */
  private destroy$: Subject<void> = new Subject<void>();

  constructor(public dialogRef: MatDialogRef<BranchesComponent>, @Inject(MAT_DIALOG_DATA) public data: USER_TYPE,
              private fb: FormBuilder, private crudService: UserService, public dialog: MatDialog,
              private addressService: AddressService) {
  };

  ngOnInit(): void {
    this.doc = this.data;
    this.formTitle = this.doc.name ? `Modifica Utente - ${this.doc.name} ${this.doc.lastname}` : 'Nuovo Utente';
    this.getCities();
    this.createForm();
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

  private patchForm(doc: USER_TYPE): void {
    this.form.patchValue({
      lastname: doc.lastname,
      name: doc.name,
      email: doc.email,
      role: doc.role,
      enabled: doc.enabled,
      cf: doc.cf,
      birthDate: doc.birthDate,
      birthProvince: doc.birthProvince,
      birthCity: doc.birthCity,
      phone: doc.phone,
    });

    this.province$.set(doc.birthProvince);
    this.city$.set(doc.birthCity);
  }

  private createForm(): void {
    this.form = this.fb.group({
      lastname: ['', Validators['required']],
      name: ['', Validators['required']],
      email: ['', [Validators['required'], Validators['email']]],
      role: [null, Validators['required']],
      enabled: [false],
      cf: [null, [CfValidator.validateCF(), Validators.minLength(16), Validators.maxLength(16)]],
      birthDate: [null],
      birthCity: [null],
      birthProvince: [null],
      phone: [null],
    });

    this.initializeSubscriptions();

    this.patchForm(this.doc);
  }

  private initializeSubscriptions(): void {

    this.isReadOnly = !!this.doc.email;

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

    this.lastname.valueChanges.pipe(
      takeUntil(this.destroy$),
      distinctUntilChanged()
    ).subscribe((lastname: string | null) => {
      if (!lastname) {
        return;
      }

      const capitalizedValue: string = lastname.charAt(0).toUpperCase() + lastname.slice(1);
      this.lastname.setValue(capitalizedValue);
    });

    this.cf.valueChanges.pipe(
      takeUntil(this.destroy$),
      distinctUntilChanged()
    ).subscribe(cf => {
      this.cf.setValue(cf ? cf.toUpperCase() : null);

      if (this.cf.valid && this.cf.value) {
        const birthDate: Date | null = CfValidator.extractBirthDate(cf);
        if (birthDate) {
          this.birthDate.setValue(birthDate);
        }

        const birthPlaceCode: string | null = CfValidator.extractComuneCode(cf);
        const birthPlace: CityModel | null = this.findCity(birthPlaceCode);
        if (birthPlace) {
          this.province$.set(birthPlace.provincia);
          this.city$.set(birthPlace.istat);
        }
      }
    });

    this.province$.subscribe((province: string | null) => {
      this.birthProvince.setValue(province);
    });

    this.city$.subscribe((city: string | null) => {
      this.birthCity.setValue(city);
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

    const date: Date | null = this.birthDate.value ? moment(this.birthDate.value).toDate() : null;

    this.doc.lastname = this.lastname.value;
    this.doc.name = this.name.value;
    this.doc.email = this.email.value;
    this.doc.role = this.role.value;
    this.doc.enabled = this.enabled.value ?? false;
    this.doc.cf = this.cf.value ?? null;
    this.doc.phone = this.phone.value ?? null;
    this.doc.birthDate = date;
    this.doc.birthProvince = this.birthProvince.value ?? null;
    this.doc.birthCity = this.birthCity.value ?? null;

    if (!this.doc.id) {
      this.doc.id = this.doc.email;
      this.doc.password = generatePassword();
      console.log(this.doc.password);
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
   * Cities
   *
   ************************************************/

  private getCities(): void {
    this.addressService.getCities()
      .subscribe(city => {
        this.cities = city ? city.city as CityModel[] : [];
      });
  }

  private findCity(code: string | null): CityModel | null {
    if (!code) {
      return null;
    }
    return this.cities.find((x: CityModel) => x.cod_fisco === code) ?? null;
  }

  /************************************************
   *
   * Controls
   *
   ***********************************************/

  get lastname(): AbstractControl {
    return this.form.get('lastname') as AbstractControl;
  }

  get name(): AbstractControl {
    return this.form.get('name') as AbstractControl;
  }

  get email(): AbstractControl {
    return this.form.get('email') as AbstractControl;
  }

  get role(): AbstractControl {
    return this.form.get('role') as AbstractControl;
  }

  get enabled(): AbstractControl {
    return this.form.get('enabled') as AbstractControl;
  }

  get cf(): AbstractControl {
    return this.form.get('cf') as AbstractControl;
  }

  get birthDate(): AbstractControl {
    return this.form.get('birthDate') as AbstractControl;
  }

  get birthCity(): AbstractControl {
    return this.form.get('birthCity') as AbstractControl;
  }

  get birthProvince(): AbstractControl {
    return this.form.get('birthProvince') as AbstractControl;
  }

  get phone(): AbstractControl {
    return this.form.get('phone') as AbstractControl;
  }
}
