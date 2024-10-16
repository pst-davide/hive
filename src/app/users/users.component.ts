import {Component, OnInit} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ColumnModel} from '../core/model/column.model';
import {BehaviorSubject} from 'rxjs';
import _ from 'lodash';
import {LoaderService} from '../core/services/loader.service';
import {DeleteDialogComponent} from '../core/dialog/delete-dialog/delete-dialog.component';
import {displayedColumns} from './users.table';
import {EMPTY_USER, UserModel} from './model/user.model';
import {UserService} from './service/user.service';
import {TableTemplateComponent} from '../core/shared/table-template/table-template.component';
import {UserComponent} from './edit/user/user.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    TableTemplateComponent
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {

  /* columns */
  public displayedColumns: ColumnModel[] = displayedColumns;

  /* table */
  public docs: UserModel[] = [];
  public dataSource: BehaviorSubject<UserModel[]> = new BehaviorSubject<UserModel[]>([]);

  /* filter */
  public filters: Record<string, any> = {
    lastname: '',
    name: '',
    email: '',
    cf: '',
    enabled: 'Tutti'
  };

  /* doc */
  public doc: UserModel = _.cloneDeep(EMPTY_USER);
  public emptyDoc: UserModel = _.cloneDeep(EMPTY_USER);
  public deletedDoc: UserModel = _.cloneDeep(EMPTY_USER);

  constructor(private crudService: UserService, public dialog: MatDialog,
              private loaderService: LoaderService) {
  }

  async ngOnInit(): Promise<void> {
    this._reloadCollection().then(() => {
    });
  }

  /*************************************************
   *
   * Table
   *
   ************************************************/

  private async getCollection(): Promise<void> {
    try {
      this.docs = await this.crudService.getDocs();
      this.dataSource.next(this.docs);
    } catch (error) {
      console.error('Errore durante il caricamento dei documenti:', error);
    }
  }

  public _rowAction(action: { record: any; key: string }): void {
    if (action.key === 'new') {
      this.doc = _.cloneDeep(this.emptyDoc);
      this.editRow();
    } else if (action.key === 'edit') {
      this.doc = _.cloneDeep(action.record ? action.record as UserModel : this.emptyDoc);
      this.editRow();
    } else if (action.key === 'delete') {
      this.deletedDoc = _.cloneDeep(action.record ? action.record as UserModel : this.emptyDoc);
      this.deleteRow();
    }
  }

  public async _reloadCollection(): Promise<void> {
    try {
      this.loaderService.setComponentLoader(UsersComponent.name);
      await this.getCollection();
    } finally {
      this.loaderService.setComponentLoaded(UsersComponent.name);
    }
  }

  /*************************************************
   *
   * Edit
   *
   ************************************************/

  public editRow(): void {
    let dialogRef: MatDialogRef<UserComponent> = this.dialog.open(UserComponent, {
      width: '100%',
      height: '100%',
      data: this.doc
    });

    dialogRef.afterClosed().subscribe(async (doc: UserModel | null) => {
      if (doc) {
        this.loaderService.setComponentLoader(UsersComponent.name);
        await this.getCollection();
        this.loaderService.setComponentLoaded(UsersComponent.name);
      }
    })
  }

  /*************************************************
   *
   * Delete
   *
   ************************************************/

  private deleteRow(): void {
    const dialogRef: MatDialogRef<DeleteDialogComponent> = this.dialog.open(DeleteDialogComponent, {
      data: {
        title: 'Cancellazione Utente',
        message: `Sei sicuro di voler eliminare l'utente <strong>${this.deletedDoc.name} ${this.deletedDoc.lastname}</strong>?`
      }
    });

    dialogRef.afterClosed().subscribe(async (confirmed: boolean | null) => {
      if (confirmed) {
        this.loaderService.setComponentLoader(UsersComponent.name);

        await this.crudService.deleteDoc(this.deletedDoc.id as string);
        await this.getCollection();

        this.loaderService.setComponentLoaded(UsersComponent.name);
      }
    })
  }
}
