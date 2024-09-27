import {Component, model, ModelSignal, OnDestroy, OnInit} from '@angular/core';
import { RoomService } from './service/room.service';
import {EMPTY_ROOM, ROOM_TYPE} from './model/room.model';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import { RoomComponent } from './edit/room/room.component';
import _ from 'lodash';
import {LoaderService} from '../../core/services/loader.service';
import {LocationsComponent} from '../locations/locations.component';
import {BehaviorSubject, Subscription} from 'rxjs';
import {ColumnModel} from '../../core/model/column.model';
import {displayedColumns} from './rooms.table';
import {DeleteDialogComponent} from '../../core/dialog/delete-dialog/delete-dialog.component';
import {TableTemplateComponent} from '../../core/shared/table-template/table-template.component';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [
    TableTemplateComponent,
  ],
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.scss'
})
export class RoomsComponent implements OnInit, OnDestroy {

  /* location */
  public locationId: ModelSignal<string | null> = model<string | null>(null);

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

  private locationIdUpdateSubscription!: Subscription;

  constructor(private crudService: RoomService, public dialog: MatDialog, private loaderService: LoaderService,
              private parentComponent: LocationsComponent) {
    this.locationIdUpdateSubscription = this.parentComponent.locationIdUpdateSubject
      .subscribe((locationId: string | null) => {
        this.getCollection(locationId).then(() => {
        });
      });
  }

  ngOnInit(): void {
    this._reloadCollection().then(() => {
    });
  }

  ngOnDestroy() {
    this.locationIdUpdateSubscription.unsubscribe();
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

  public async _reloadCollection(): Promise<void> {
    try {
      this.loaderService.setComponentLoader(RoomsComponent.name);
      await this.getCollection(this.locationId());
    } finally {
      this.loaderService.setComponentLoaded(RoomsComponent.name);
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
      data: {doc: this.doc, categoryId: this.locationId()}
    });

    dialogRef.afterClosed().subscribe(async (doc: ROOM_TYPE | null) => {

      if (doc) {
        this._reloadCollection().then(() => {
        });
        // this.keywordsChanged.next();
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

        // await this.crudService.deleteKeywordDoc(this.deletedDoc.id);
        // await this.getCollection(this.categoryId());
        // this.keywordsChanged.next();

        this.loaderService.setComponentLoaded(RoomsComponent.name);
      }
    })
  }
}
