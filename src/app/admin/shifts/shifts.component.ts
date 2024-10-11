import {Component, OnInit} from '@angular/core';
import {ColumnModel} from '../../core/model/column.model';
import {BRANCH_TYPE} from '../branches/model/branchModel';
import {BehaviorSubject} from 'rxjs';
import _ from 'lodash';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {LoaderService} from '../../core/services/loader.service';
import {DeleteDialogComponent} from '../../core/dialog/delete-dialog/delete-dialog.component';
import {displayedColumns} from './shifts.table';
import {EMPTY_SHIFT, ShiftModel} from './model/shift.model';
import {TableTemplateComponent} from '../../core/shared/table-template/table-template.component';
import {ShiftService} from './service/shift.service';
import {ShiftComponent} from './edit/shift/shift.component';

@Component({
  selector: 'app-shifts',
  standalone: true,
  imports: [
    TableTemplateComponent
  ],
  templateUrl: './shifts.component.html',
  styleUrl: './shifts.component.scss'
})
export class ShiftsComponent implements OnInit {

  /* columns */
  public displayedColumns: ColumnModel[] = displayedColumns;

  /* table */
  public docs: ShiftModel[] = [];
  public dataSource: BehaviorSubject<ShiftModel[]> = new BehaviorSubject<ShiftModel[]>([]);

  /* filter */
  public filters: Record<string, any> = {};

  /* doc */
  public doc: ShiftModel = _.cloneDeep(EMPTY_SHIFT);
  public emptyDoc: ShiftModel = _.cloneDeep(EMPTY_SHIFT);
  public deletedDoc: ShiftModel = _.cloneDeep(EMPTY_SHIFT);

  constructor(private crudService: ShiftService, public dialog: MatDialog,
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
      this.doc = _.cloneDeep(action.record ? action.record as ShiftModel : this.emptyDoc);
      this.editRow();
    } else if (action.key === 'delete') {
      this.deletedDoc = _.cloneDeep(action.record ? action.record as ShiftModel : this.emptyDoc);
      this.deleteRow();
    }
  }

  public async _reloadCollection(): Promise<void> {
    try {
      this.loaderService.setComponentLoader(ShiftsComponent.name);
      await this.getCollection();
    } finally {
      this.loaderService.setComponentLoaded(ShiftsComponent.name);
    }
  }

  /*************************************************
   *
   * Edit
   *
   ************************************************/

  public editRow(): void {
    let dialogRef: MatDialogRef<ShiftComponent> = this.dialog.open(ShiftComponent, {
      width: '100%',
      height: '100%',
      data: this.doc
    });

    dialogRef.afterClosed().subscribe(async (doc: BRANCH_TYPE | null) => {
      if (doc) {
        this.loaderService.setComponentLoader(ShiftsComponent.name);
        await this.getCollection();
        this.loaderService.setComponentLoaded(ShiftsComponent.name);
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
        title: 'Cancellazione Causale',
        message: `Sei sicuro di voler eliminare la causale <strong>${this.deletedDoc.name}</strong>?`
      }
    });

    dialogRef.afterClosed().subscribe(async (confirmed: boolean | null) => {
      if (confirmed) {
        this.loaderService.setComponentLoader(ShiftsComponent.name);

        await this.crudService.deleteDoc(this.deletedDoc.id as string);
        await this.getCollection();

        this.loaderService.setComponentLoaded(ShiftsComponent.name);
      }
    })
  }
}

