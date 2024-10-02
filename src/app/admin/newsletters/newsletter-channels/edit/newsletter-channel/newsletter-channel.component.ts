import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {distinctUntilChanged, Observable, Subject, takeUntil} from 'rxjs';
import {FaIconComponent, IconDefinition} from '@fortawesome/angular-fontawesome';
import _ from 'lodash';
import {AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import {NewsletterService} from '../../../service/newsletter.service';
import {EMPTY_NEWSLETTER_CHANNEL, NEWSLETTER_CHANNEL_TYPE} from '../../../model/newsletter.model';
import {AsyncPipe} from '@angular/common';
import {MatError, MatFormField, MatLabel, MatSuffix} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {NgxColorsModule} from 'ngx-colors';

@Component({
  selector: 'app-newsletter-channel',
  standalone: true,
  imports: [
    AsyncPipe,
    FaIconComponent,
    MatError,
    MatFormField,
    MatInput,
    MatLabel,
    MatSuffix,
    NgxColorsModule,
    ReactiveFormsModule
  ],
  templateUrl: './newsletter-channel.component.html',
  styleUrl: './newsletter-channel.component.scss'
})
export class NewsletterChannelComponent implements OnInit, OnDestroy {

  /* loading */
  public isLoading$!: Observable<boolean>;

  /* title */
  public formTitle: string = 'Nuova Lista';

  /* icons */
  public faTimes: IconDefinition = faTimes;

  /* icons */
  public doc: NEWSLETTER_CHANNEL_TYPE = _.cloneDeep(EMPTY_NEWSLETTER_CHANNEL);

  /* form */
  public form: FormGroup = new FormGroup({});

  /* form */
  private destroy$: Subject<void> = new Subject<void>();

  constructor(public dialogRef: MatDialogRef<NewsletterChannelComponent>,
              @Inject(MAT_DIALOG_DATA) public data: NEWSLETTER_CHANNEL_TYPE,
              private fb: FormBuilder, private crudService: NewsletterService, public dialog: MatDialog) {
  };

  ngOnInit(): void {
    this.doc = this.data;
    this.formTitle = this.doc.name ? `Modifica Lista - ${this.doc.name}` : 'Nuova Lista';
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

  private patchForm(doc: NEWSLETTER_CHANNEL_TYPE): void {

    this.form.patchValue({
      name: doc.name,
      description: doc.description,
    });
  }

  private createForm(): void {
    this.form = this.fb.group({
      name: ['', Validators['required']],
      description: [null],
    });

    this.initializeSubscriptions();

    this.patchForm(this.doc);
  }

  private initializeSubscriptions(): void {

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
    this.doc.description = this.description.value;

    try {
      if (!this.doc.id || this.doc.id === 0) {
        await this.crudService.createChannelDoc(this.doc);
      } else {
        await this.crudService.updateChannelDoc(this.doc.id, this.doc);
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

  get name(): AbstractControl {
    return this.form.get('name') as AbstractControl;
  }

  get description(): AbstractControl {
    return this.form.get('description') as AbstractControl;
  }
}
