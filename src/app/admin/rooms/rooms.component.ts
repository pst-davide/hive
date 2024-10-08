import {Component, effect, EventEmitter, model, ModelSignal, OnInit, Output} from '@angular/core';
import {RoomService} from './service/room.service';
import {EMPTY_ROOM, ROOM_TYPE} from './model/room.model';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {RoomComponent} from './edit/room/room.component';
import _ from 'lodash';
import {LoaderService} from '../../core/services/loader.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {ColumnModel} from '../../core/model/column.model';
import {displayedColumns} from './rooms.table';
import {TableTemplateComponent} from '../../core/shared/table-template/table-template.component';
import {DeleteDialogComponent} from '../../core/dialog/delete-dialog/delete-dialog.component';
import {BranchService} from '../branches/service/branch.service';
import {BranchModel} from '../branches/model/branchModel';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [
    TableTemplateComponent,
  ],
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.scss'
})
export class RoomsComponent implements OnInit {

  /* loading */
  public isLoading$!: Observable<boolean>;

  /* branch */
  public branchId: ModelSignal<string | null> = model<string | null>(null);
  @Output() locationChanged: EventEmitter<void> = new EventEmitter<void>();

  /* doc */
  public doc: ROOM_TYPE = _.cloneDeep(EMPTY_ROOM);
  public emptyDoc: ROOM_TYPE = _.cloneDeep(EMPTY_ROOM);
  public deletedDoc: ROOM_TYPE = _.cloneDeep(EMPTY_ROOM);

  /****************************
   * table
   * *************************/
  public docs: ROOM_TYPE[] = [];
  public dataSource: BehaviorSubject<ROOM_TYPE[]> = new BehaviorSubject<ROOM_TYPE[]>([]);

  /* filter */
  public filters: Record<string, string> = {};

  /* columns */
  public displayedColumns: ColumnModel[] = displayedColumns;

  /* branches */
  public branches: BranchModel[] = [];


  constructor(private crudService: RoomService, private branchService: BranchService,
              private loaderService: LoaderService, public dialog: MatDialog) {
    effect(async () => {
      await this.getBranches();
      this._reloadCollection().then(() => {
      });
    });
  }

  async ngOnInit(): Promise<void> {
    await this.getBranches();
    this._reloadCollection().then(() => {
    });
  }

  /*************************************************
   *
   * Table
   *
   ************************************************/

  private async getCollection(id: string | null = null): Promise<void> {
    try {
      this.docs = await this.crudService.getDocs(id);
      this.dataSource.next(this.docs);
    } catch (error) {
      console.error('Errore durante il caricamento dei documenti:', error);
    }
  }

  public async _reloadCollection(): Promise<void> {
    try {
      this.loaderService.setComponentLoader(RoomsComponent.name);
      await this.getCollection(this.branchId());
    } finally {
      this.loaderService.setComponentLoaded(RoomsComponent.name);
    }
  }

   public _rowAction(action: { record: any; key: string }): void {
    if (action.key === 'new') {
      this.doc = _.cloneDeep(this.emptyDoc);
      this.editRow();
    } else if (action.key === 'edit') {
      this.doc = _.cloneDeep(action.record ? action.record as ROOM_TYPE : this.emptyDoc);
      this.editRow();
    } else if (action.key === 'view') {
      this.doc = _.cloneDeep(action.record ? action.record as ROOM_TYPE : this.emptyDoc);
    } else if (action.key === 'delete') {
      this.deletedDoc = _.cloneDeep(action.record ? action.record as ROOM_TYPE : this.emptyDoc);
      this.deleteRow();
    }
  }

  /*************************************************
   *
   * Edit
   *
   ************************************************/

  private editRow(): void {
    const dialogRef: MatDialogRef<RoomComponent> = this.dialog.open(RoomComponent, {
      width: '100%',
      height: '100%',
      data: {doc: this.doc, locationId: this.branchId()}
    });

    dialogRef.afterClosed().subscribe(async (doc: ROOM_TYPE | null) => {

      if (doc) {
        this._reloadCollection().then(() => {
        });
        this.locationChanged.next();
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
        title: 'Cancellazione Stanza',
        message: `Sei sicuro di voler eliminare la stanza <strong>${this.deletedDoc.name}</strong>?`
      }
    });

    dialogRef.afterClosed().subscribe(async (doc: boolean | null) => {
        if (doc) {
          this.loaderService.setComponentLoader(RoomsComponent.name);

          // await this.crudService.deleteDoc(this.deletedDoc.id);
          // await this.getCollection(this.categoryId());
          // this.keywordsChanged.next();

          this.loaderService.setComponentLoaded(RoomsComponent.name);
        }
    })
  }

  /*************************************************
   *
   * Branches
   *
   ************************************************/

  private async getBranches(): Promise<void> {
    try {
      this.loaderService.setComponentLoader('branches');
      if (this.branchId()) {
        const branch: BranchModel = await this.branchService.getDoc(this.branchId() as string);
        console.log(branch);
      } else {
        this.branches = await this.branchService.getDocs();
      }
    } catch (error) {
      console.error('Errore durante il caricamento dei documenti:', error);
    } finally {
      this.loaderService.setComponentLoaded('branches');
    }
  }
}
