import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {AsyncPipe, NgOptimizedImage} from '@angular/common';
import {MatError, MatFormField, MatLabel, MatSuffix} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {NgxColorsModule, validColorValidator} from 'ngx-colors';
import {AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {distinctUntilChanged, Observable, Subject, takeUntil} from 'rxjs';
import _ from 'lodash';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {EMPTY_PRESS_CATEGORY, PRESS_CATEGORY_TYPE} from '../../../model/press-category.model';
import {PressService} from '../../../service/press.service';
import {EditLogoComponent} from '../../../../../layouts/edit-logo/edit-logo.component';
import {DialogCloseButtonComponent} from '../../../../../layouts/dialog-close-button/dialog-close-button.component';

@Component({
  selector: 'app-press-category',
  standalone: true,
  imports: [
    AsyncPipe,
    MatError,
    MatFormField,
    MatInput,
    MatLabel,
    MatSuffix,
    NgxColorsModule,
    ReactiveFormsModule,
    NgOptimizedImage,
    EditLogoComponent,
    DialogCloseButtonComponent
  ],
  templateUrl: './press-category.component.html',
  styleUrl: './press-category.component.scss'
})
export class PressCategoryComponent implements OnInit, OnDestroy {

  /* loading */
  public isLoading$!: Observable<boolean>;

  /* title */
  public formTitle: string = 'Nuovo Argomento';

  /* icons */
  public doc: PRESS_CATEGORY_TYPE = _.cloneDeep(EMPTY_PRESS_CATEGORY);

  /* form */
  public form: FormGroup = new FormGroup({});

  /* form */
  private destroy$: Subject<void> = new Subject<void>();

  constructor(public dialogRef: MatDialogRef<PressCategoryComponent>,
              @Inject(MAT_DIALOG_DATA) public data: PRESS_CATEGORY_TYPE,
              private fb: FormBuilder, private crudService: PressService, public dialog: MatDialog) {
  };

  ngOnInit(): void {
    this.doc = this.data;
    this.formTitle = this.doc.name ? `Modifica Argomento - ${this.doc.name}` : 'Nuovo Argomento';
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

  private patchForm(doc: PRESS_CATEGORY_TYPE): void {

    this.form.patchValue({
      name: doc.name,
      color: doc.color,
    });
  }

  private createForm(): void {
    this.form = this.fb.group({
      name: ['', Validators['required']],
      color: [null, [Validators['required'], validColorValidator()]],
      picker: [null],
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

    this.doc.name = this.name.value;
    this.doc.color = this.color.value;

    try {
      if (!this.doc.id || this.doc.id === 0) {
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

  get name(): AbstractControl {
    return this.form.get('name') as AbstractControl;
  }

  get color(): AbstractControl {
    return this.form.get('color') as AbstractControl;
  }

}
