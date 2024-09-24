import {Component, Inject, model, ModelSignal, OnDestroy, OnInit} from '@angular/core';
import {distinctUntilChanged, Observable, Subject, takeUntil} from 'rxjs';
import {FaIconComponent, IconDefinition} from '@fortawesome/angular-fontawesome';
import _ from 'lodash';
import {AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {PressService} from '../../../service/press.service';
import {NgxColorsModule} from 'ngx-colors';
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import {EMPTY_PRESS_KEYWORD, PRESS_KEYWORD_TYPE} from '../../../model/press-keyword.model';
import {AsyncPipe} from '@angular/common';
import {MatError, MatFormField, MatLabel, MatSuffix} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatOption, MatSelect} from '@angular/material/select';
import {
  PressCategoryAutocompleteComponent
} from '../../../../../core/shared/autocomplete/press-category-autocomplete/press-category-autocomplete.component';

@Component({
  selector: 'app-press-keyword',
  standalone: true,
  imports: [
    AsyncPipe,
    FaIconComponent,
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
    PressCategoryAutocompleteComponent
  ],
  templateUrl: './press-keyword.component.html',
  styleUrl: './press-keyword.component.scss'
})
export class PressKeywordComponent implements OnInit, OnDestroy {

  /* loading */
  public isLoading$!: Observable<boolean>;

  /* title */
  public formTitle: string = 'Nuova Parola Chiave';

  /* icons */
  public faTimes: IconDefinition = faTimes;

  /* doc */
  public doc: PRESS_KEYWORD_TYPE = _.cloneDeep(EMPTY_PRESS_KEYWORD);

  /* form */
  public form: FormGroup = new FormGroup({});

  /* categories */
  public category$: ModelSignal<number | null> = model<number | null>(null);

  /* subject */
  private destroy$: Subject<void> = new Subject<void>();



  constructor(public dialogRef: MatDialogRef<PressKeywordComponent>,
              @Inject(MAT_DIALOG_DATA) public data: PRESS_KEYWORD_TYPE,
              private fb: FormBuilder, private crudService: PressService, public dialog: MatDialog) {
  };

  ngOnInit(): void {
    this.doc = this.data;
    this.category$.set(this.doc.category);
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
      category: doc.category,
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
