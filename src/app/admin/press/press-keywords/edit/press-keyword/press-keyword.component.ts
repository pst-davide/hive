import {Component, Inject, model, ModelSignal, OnDestroy, OnInit} from '@angular/core';
import {distinctUntilChanged, Observable, Subject, takeUntil} from 'rxjs';
import _ from 'lodash';
import {AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {PressService} from '../../../service/press.service';
import {NgxColorsModule} from 'ngx-colors';
import {EMPTY_PRESS_KEYWORD, PRESS_KEYWORD_TYPE} from '../../../model/press-keyword.model';
import {AsyncPipe} from '@angular/common';
import {MatError, MatFormField, MatLabel, MatSuffix} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatOption, MatSelect} from '@angular/material/select';
import {
  PressCategoryAutocompleteComponent
} from '../../../../../core/shared/autocomplete/press-category-autocomplete/press-category-autocomplete.component';
import {EditLogoComponent} from '../../../../../layouts/edit-logo/edit-logo.component';
import {DialogCloseButtonComponent} from '../../../../../layouts/dialog-close-button/dialog-close-button.component';

@Component({
  selector: 'app-press-keyword',
  standalone: true,
    imports: [
        AsyncPipe,
        FormsModule,
        MatError,
        MatFormField,
        MatInput,
        MatLabel,
        MatSuffix,
        NgxColorsModule,
        ReactiveFormsModule,
        MatSelect,
        MatOption,
        PressCategoryAutocompleteComponent,
        EditLogoComponent,
        DialogCloseButtonComponent
    ],
  templateUrl: './press-keyword.component.html',
  styleUrl: './press-keyword.component.scss'
})
export class PressKeywordComponent implements OnInit, OnDestroy {

  /* loading */
  public isLoading$!: Observable<boolean>;

  /* title */
  public formTitle: string = 'Nuova Parola Chiave';

  /* doc */
  public doc: PRESS_KEYWORD_TYPE = _.cloneDeep(EMPTY_PRESS_KEYWORD);

  /* form */
  public form: FormGroup = new FormGroup({});
  public isEnabled: boolean = true;

  /* categories */
  public category$: ModelSignal<number | null> = model<number | null>(null);

  /* subject */
  private destroy$: Subject<void> = new Subject<void>();



  constructor(public dialogRef: MatDialogRef<PressKeywordComponent>,
              @Inject(MAT_DIALOG_DATA) public data: { doc: PRESS_KEYWORD_TYPE, categoryId: number | null },
              private fb: FormBuilder, private crudService: PressService, public dialog: MatDialog) {
  };

  ngOnInit(): void {
    this.doc = this.data.doc;
    this.category$.set(this.data.categoryId && this.data.categoryId > 0 ? this.data.categoryId : this.doc.category);
    this.formTitle = this.doc.word ? `Modifica Parola Chiave - ${this.doc.word}` : 'Nuova Parola Chiave';
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

  private patchForm(doc: PRESS_KEYWORD_TYPE): void {

    this.form.patchValue({
      word: doc.word,
      importance: doc.importance,
      category: this.data.categoryId && this.data.categoryId > 0 ? this.data.categoryId : doc.category,
    });
  }

  private createForm(): void {
    this.form = this.fb.group({
      word: ['', Validators['required']],
      importance: ['', Validators['required']],
      category: [null, Validators['required']],
    });

    this.initializeSubscriptions();

    this.patchForm(this.doc);
  }

  private initializeSubscriptions(): void {

    this.word.valueChanges.pipe(
      takeUntil(this.destroy$),
      distinctUntilChanged()
    ).subscribe((word: string | null) => {
      if (!word) {
        return;
      }

      const capitalizedValue: string = word.charAt(0).toUpperCase() + word.slice(1);
      this.word.setValue(capitalizedValue);
    });

    this.category$.subscribe((category: number | null) => {
      this.category.setValue(category);
    });

    if (this.data.categoryId && this.data.categoryId > 0) {
      this.isEnabled = false;
    }
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

    this.doc.word = this.word.value;
    this.doc.importance = this.importance.value;
    this.doc.category = this.category$();

    try {
      if (!this.doc.id || this.doc.id === 0) {
        await this.crudService.createKeywordDoc(this.doc);
      } else {
        await this.crudService.updateKeywordDoc(this.doc.id, this.doc);
      }
      this.dialogRef.close(this.doc);
    } catch (error) {
      console.error('Errore durante il salvataggio del documento:', error);
    }
  }

  public closeDialog(): void {
    this.dialogRef.close(null);
  }

  /************************************************
   *
   * Controls
   *
   ***********************************************/

  get word(): AbstractControl {
    return this.form.get('word') as AbstractControl;
  }

  get importance(): AbstractControl {
    return this.form.get('importance') as AbstractControl;
  }

  get category(): AbstractControl {
    return this.form.get('category') as AbstractControl;
  }

}
