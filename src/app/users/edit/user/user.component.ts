import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTimes, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FormGroup, ReactiveFormsModule, FormsModule, AbstractControl, Validators, FormBuilder } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {distinctUntilChanged, Observable, Subject, takeUntil} from 'rxjs';
import _ from 'lodash';
import {EditLogoComponent} from '../../../layouts/edit-logo/edit-logo.component';
import {BranchesComponent} from '../../../admin/branches/branches.component';
import {EMPTY_USER, USER_ROLES, UserModel} from '../../model/user.model';
import {UserService} from '../../service/user.service';
import {MatSelectModule} from '@angular/material/select';
import {LabelModel} from '../../../core/model/label.model';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {generatePassword} from '../../../core/functions/password-generator';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, ReactiveFormsModule, MatInputModule,
    MatFormFieldModule, EditLogoComponent, MatSelectModule, MatSlideToggle],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss'
})
export class UserComponent implements OnInit, OnDestroy {

  /* loading */
  public isLoading$!: Observable<boolean>;

  /* title */
  public formTitle: string = 'Nuovo Utente';

  /* icons */
  public faTimes: IconDefinition = faTimes;

  /* doc */
  public doc: UserModel = _.cloneDeep(EMPTY_USER);

  /* form */
  public form: FormGroup = new FormGroup({});
  public userRoles: LabelModel[] = USER_ROLES;
  public isReadOnly: boolean = false;

  /* subject */
  private destroy$: Subject<void> = new Subject<void>();

  constructor(public dialogRef: MatDialogRef<BranchesComponent>, @Inject(MAT_DIALOG_DATA) public data: UserModel,
              private fb: FormBuilder, private crudService: UserService, public dialog: MatDialog) {
  };

  ngOnInit(): void {
    this.doc = this.data;
    this.formTitle = this.doc.name ? `Modifica Utente - ${this.doc.name} ${this.doc.lastname}` : 'Nuovo Utente';
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

  private patchForm(doc: UserModel): void {
    this.form.patchValue({
      lastname: doc.lastname,
      name: doc.name,
      email: doc.email,
      role: doc.role,
      enabled: doc.enabled,
    });
  }

  private createForm(): void {
    this.form = this.fb.group({
      lastname: ['', Validators['required']],
      name: ['', Validators['required']],
      email: ['', [Validators['required'], Validators['email']]],
      role: [null, Validators['required']],
      enabled: [false],
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

    this.doc.lastname = this.lastname.value;
    this.doc.name = this.name.value;
    this.doc.email = this.email.value;
    this.doc.role = this.role.value;
    this.doc.enabled = this.enabled.value ?? false;

    if (!this.doc.id) {
      this.doc.id = this.doc.email;
      this.doc.password = generatePassword();
      await this.crudService.createDoc(this.doc);
    } else {
      await this.crudService.updateDoc(this.doc.id, this.doc);
    }


    this.dialogRef.close(this.doc);
  }

  public closeDialog(): void {
    this.dialogRef.close(null);
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
}
