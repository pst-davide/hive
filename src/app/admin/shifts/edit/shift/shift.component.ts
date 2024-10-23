import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatError, MatFormField, MatLabel, MatSuffix} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {NgxColorsModule, validColorValidator} from 'ngx-colors';
import {distinctUntilChanged, Observable, Subject, takeUntil} from 'rxjs';
import _ from 'lodash';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {BranchesComponent} from '../../../branches/branches.component';
import {ShiftService} from '../../service/shift.service';
import {EMPTY_SHIFT, ShiftModel} from '../../model/shift.model';
import {AsyncPipe} from '@angular/common';
import {EditLogoComponent} from '../../../../layouts/edit-logo/edit-logo.component';
import {DialogCloseButtonComponent} from '../../../../layouts/dialog-close-button/dialog-close-button.component';

@Component({
  selector: 'app-shift',
  standalone: true,
    imports: [
        FormsModule,
        MatError,
        MatFormField,
        MatInput,
        MatLabel,
        MatSuffix,
        NgxColorsModule,
        ReactiveFormsModule,
        AsyncPipe,
        EditLogoComponent,
        DialogCloseButtonComponent
    ],
  templateUrl: './shift.component.html',
  styleUrl: './shift.component.scss'
})
export class ShiftComponent implements OnInit, OnDestroy {

  /* loading */
  public isLoading$!: Observable<boolean>;

  /* title */
  public formTitle: string = 'Nuova Causale';

  /* doc */
  public doc: ShiftModel = _.cloneDeep(EMPTY_SHIFT);

  /* form */
  public form: FormGroup = new FormGroup({});
  public isReadOnly: boolean = false;

  /* subject */
  private destroy$: Subject<void> = new Subject<void>();


  constructor(public dialogRef: MatDialogRef<BranchesComponent>, @Inject(MAT_DIALOG_DATA) public data: ShiftModel,
              private fb: FormBuilder, private crudService: ShiftService, public dialog: MatDialog) {
  };

  ngOnInit(): void {
    this.doc = this.data;
    this.formTitle = this.doc.name ? `Modifica Causale - ${this.doc.name}` : 'Nuova Causale';
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

  private patchForm(doc: ShiftModel): void {
    this.form.patchValue({
      code: doc.code,
      name: doc.name,
      color: doc.color,
    });
  }

  private createForm(): void {
    this.form = this.fb.group({
      code: ['', Validators['required']],
      name: ['', Validators['required']],
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
    this.doc.color = this.color.value;

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

}

