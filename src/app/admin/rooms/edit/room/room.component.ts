import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {EMPTY_ROOM, ROOM_TYPE} from '../../model/room.model';
import { FormGroup, ReactiveFormsModule, FormsModule, AbstractControl, Validators, FormBuilder } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {distinctUntilChanged, Observable, Subject, takeUntil} from 'rxjs';
import _ from 'lodash';
import { NgxColorsModule, validColorValidator } from 'ngx-colors';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {DEFAULT_LOCATION_COLOR} from '../../../../core/functions/environments';
import {BRANCH_TYPE} from '../../../branches/model/branchModel';
import {MatOption} from '@angular/material/autocomplete';
import {MatSelect, MatSelectChange} from '@angular/material/select';
import {RoomService} from '../../service/room.service';
import {BranchService} from '../../../branches/service/branch.service';
import {EditLogoComponent} from '../../../../layouts/edit-logo/edit-logo.component';
import {DialogCloseButtonComponent} from '../../../../layouts/dialog-close-button/dialog-close-button.component';

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    NgxColorsModule,
    MatSlideToggle,
    MatOption,
    MatSelect,
    EditLogoComponent,
    DialogCloseButtonComponent
  ],
  templateUrl: './room.component.html',
  styleUrl: './room.component.scss'
})
export class RoomComponent implements OnInit, OnDestroy {

  /* loading */
  public isLoading$!: Observable<boolean>;

  /* title */
  public formTitle: string = 'Nuova Sede';

  /* doc */
  public doc: ROOM_TYPE = _.cloneDeep(EMPTY_ROOM);

  /* form */
  public form: FormGroup = new FormGroup({});
  public isReadOnly: boolean = false;

  /* branches */
  public branches: BRANCH_TYPE[] = [];

  /* subject */
  private destroy$: Subject<void> = new Subject<void>();

  constructor(public dialogRef: MatDialogRef<RoomComponent>, private crudService: RoomService,
              @Inject(MAT_DIALOG_DATA) public data: { doc: ROOM_TYPE, branch: BRANCH_TYPE | null},
              private fb: FormBuilder, private branchService: BranchService) {}

  ngOnInit(): void {
    this.doc = this.data.doc;
    if (!this.doc.id) {
      const {id, color = DEFAULT_LOCATION_COLOR} = this.data.branch ?? {};
      this.doc.branchId = id ?? null;
      this.doc.color = color;
    }
    this.formTitle = this.doc.name ? `Modifica Spazio - ${this.doc.name}` : 'Nuova Spazio';
    this.createForm();
    this.getBranches().then(() => {});
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

  private patchForm(doc: ROOM_TYPE): void {
    this.form.patchValue({
      code: doc.code,
      name: doc.name,
      description: doc.description,
      capacity: doc.capacity,
      floor: doc.floor,
      enabled: doc.enabled ?? true,
      color: doc.color,
      locationId: doc.branchId ?? null,
    });
  }

  private createForm(): void {
    this.form = this.fb.group({
      code: ['', Validators['required']],
      name: ['', Validators['required']],
      description: [null],
      capacity: [null],
      floor: [null],
      locationId: ['', Validators['required']],
      enabled: [false],
      color: [null, [Validators['required'], validColorValidator()]],
      picker: [null],
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
    this.doc.description = this.description.value ?? null;
    this.doc.color = this.color.value;
    this.doc.enabled = this.enabled.value ?? true;
    this.doc.capacity = this.capacity.value ?? null;
    this.doc.floor = this.floor.value ?? null;
    this.doc.branchId = this.locationId.value;

     try {
      if (!this.doc.id || this.doc.id === '') {
        this.doc.id = this.code.value.toUpperCase();
        await this.crudService.createDoc(this.doc);
      } else {
        await this.crudService.updateDoc(this.doc.id, this.doc);
      }

      this.dialogRef.close(this.doc);
    } catch (error) {
      console.error('Errore durante il salvataggio del documento:', error);
    }

  }

  public closeDialog(): void {
    this.dialogRef.close();
  }

  private async getBranches(): Promise<void> {
    if (this.data.branch) {
      this.branches = [this.data.branch];
    } else {
      this.branches = await this.branchService.getDocs();
    }
  }

  public _setColor(event: MatSelectChange): void {
    const value: string = event.value;
    const branch: BRANCH_TYPE | null = this.branches.find((b: BRANCH_TYPE) => b.id === value) ?? null;
    if (branch && branch.color) {
      this.color.setValue(branch.color);
    }
  }
  /*************************************************
   *
   * Color
   *
   ************************************************/

  public _onColorChange(event: any): void {
    this.color.setValue(event);
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

  get description(): AbstractControl {
    return this.form.get('description') as AbstractControl;
  }

  get capacity(): AbstractControl {
    return this.form.get('capacity') as AbstractControl;
  }

  get floor(): AbstractControl {
    return this.form.get('floor') as AbstractControl;
  }

  get color(): AbstractControl {
    return this.form.get('color') as AbstractControl;
  }

  get enabled(): AbstractControl {
    return this.form.get('enabled') as AbstractControl;
  }

  get locationId(): AbstractControl {
    return this.form.get('locationId') as AbstractControl;
  }
}
