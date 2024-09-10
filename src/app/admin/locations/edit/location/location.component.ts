import {Component, Inject, model, ModelSignal, OnInit, signal, WritableSignal} from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import _ from 'lodash';
import { EMPTY_LOCATION, LocationModel } from '../../model/location.model';
import { Observable } from 'rxjs';
import { FontAwesomeModule, IconDefinition } from '@fortawesome/angular-fontawesome';
import { LocationService } from '../../service/location.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { NgxColorsModule, validColorValidator } from 'ngx-colors';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ProvinceAutocompleteComponent } from "../../../../core/shared/autocomplete/province-autocomplete/province-autocomplete.component";
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CityAutocompleteComponent } from "../../../../core/shared/autocomplete/city-autocomplete/city-autocomplete.component";

@Component({
  selector: 'app-location',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, ReactiveFormsModule, MatInputModule,
    MatFormFieldModule, NgxColorsModule, ProvinceAutocompleteComponent, MatCheckboxModule, MatSlideToggleModule, CityAutocompleteComponent],
  templateUrl: './location.component.html',
  styleUrl: './location.component.scss'
})
export class LocationComponent implements OnInit {

  /* loading */
  public isLoading$!: Observable<boolean>;

  /* icons */
  public faTimes: IconDefinition = faTimes;

  /* icons */
  public doc: LocationModel = _.cloneDeep(EMPTY_LOCATION);

  /* form */
  public form: FormGroup = new FormGroup({});
  public roomColor: FormControl = new FormControl(null);

  /* province and city */
  public city$: ModelSignal<string| null> = model<string| null>(null);
  public province$: ModelSignal<string | null> = model<string | null>(null);
  public isProvinceValid$: ModelSignal<boolean> = model<boolean>(false);
  public required$: WritableSignal<boolean> = signal<boolean>(true);

  constructor(public dialogRef: MatDialogRef<LocationComponent>, @Inject(MAT_DIALOG_DATA) public data: LocationModel,
  private fb: FormBuilder, private crudService: LocationService) {}; 

  ngOnInit(): void {
      this.doc = this.data;
      this.createForm();

      const r = _.cloneDeep(EMPTY_LOCATION);
      r.id = 'TST3';
      r.code = 'TST3';
      r.name = 'Test 3';
      // this.roomService.createRoom(r).subscribe(ref => {console.log(ref)});
  }

  /*************************************************
   *
   * Form
   *
   ************************************************/
  private patchForm(doc: LocationModel): void {
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

    this.color.valueChanges.subscribe((color) => {
      if (this.form.controls['picker'].valid) {
        this.form.controls['picker'].setValue(color, {
          emitEvent: false,
        });
      }
    });

    this.form.controls['picker'].valueChanges.subscribe((color: any) =>
      this.color.setValue(color, {
        emitEvent: false,
      })
    );

    this.patchForm(this.doc);
  }

  public async onSubmit(): Promise<void> {

    const room: LocationModel = _.cloneDeep(EMPTY_LOCATION);
    room.id = this.code.value;
    room.code = this.code.value;
    room.name = this.name.value;

    this.crudService.createDoc(room);
  }

  public closeDialog(): void {
    this.dialogRef.close();
  }

  public _onColorChange(event: any): void {
    console.log(event);
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

}
