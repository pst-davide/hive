import {Component, model, ModelSignal, OnDestroy, OnInit} from '@angular/core';
import {RoomsComponent} from '../rooms/rooms.component';
import {ColumnModel} from '../../core/model/column.model';
import {EMPTY_BRANCH, BRANCH_TYPE, BranchModel} from './model/branchModel';
import {BehaviorSubject, Subject, takeUntil} from 'rxjs';
import _ from 'lodash';
import {AddressService, CityModel, ProvinceModel} from '../../core/services/address.service';
import {BranchService} from './service/branch.service';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {LoaderService} from '../../core/services/loader.service';
import {RoomService} from '../rooms/service/room.service';
import {Router, RouterOutlet} from '@angular/router';
import {LocationComponent} from '../locations/edit/location/location.component';
import {DeleteDialogComponent} from '../../core/dialog/delete-dialog/delete-dialog.component';
import {MapComponent} from '../../core/dialog/map/map.component';
import {displayedColumns} from './branches.table';
import {TableTemplateComponent} from '../../core/shared/table-template/table-template.component';

@Component({
  selector: 'app-branches',
  standalone: true,
  imports: [
    RoomsComponent,
    TableTemplateComponent,
    RouterOutlet
  ],
  templateUrl: './branches.component.html',
  styleUrl: './branches.component.scss'
})
export class BranchesComponent implements OnInit, OnDestroy {

  /* columns */
  public displayedColumns: ColumnModel[] = displayedColumns;

  /* table */
  public docs: BRANCH_TYPE[] = [];
  public dataSource: BehaviorSubject<BRANCH_TYPE[]> = new BehaviorSubject<BRANCH_TYPE[]>([]);

  /* filter */
  public filters: Record<string, any> = {
    code: '',
    name: '',
    description: '',
    enabled: 'Tutti'
  };

  /* doc */
  public doc: BRANCH_TYPE = _.cloneDeep(EMPTY_BRANCH);
  public emptyDoc: BRANCH_TYPE = _.cloneDeep(EMPTY_BRANCH);
  public deletedDoc: BRANCH_TYPE = _.cloneDeep(EMPTY_BRANCH);

  /* cities */
  public cities: CityModel[] = [];

  /* provinces */
  public provinces: ProvinceModel[] = [];

  /* branch */
  public branchId: ModelSignal<string | null> = model<string | null>('');
  public locationIdUpdateSubject: Subject<string | null> = new Subject<string | null>();

  /* Subject */
  private destroy$: Subject<void> = new Subject<void>();

  constructor(private crudService: BranchService, public dialog: MatDialog, private addressService: AddressService,
              private loaderService: LoaderService, private roomService: RoomService, private router: Router) {
  }

  ngOnInit(): void {
    this.getCities();
    this.getProvinces();
    this._reloadCollection().then(() => {});
  }

  ngOnDestroy() : void {
    this.changeLocationId(null);
  }

  public isRoomsRoute(): boolean {
    return this.router.url.includes('/locations/rooms');
  }

  /*************************************************
   *
   * Table
   *
   ************************************************/

  private mapDoc(doc: BranchModel): BRANCH_TYPE {
    const city: string | null = this.findCity(doc.address?.city ?? null);
    const province: string | null = this.findProvince(doc.address?.province ?? null);

    return {
      ...doc,
      VIEW_STREET: doc.address?.street ?? null,
      VIEW_ZIP: doc.address?.zip ?? null,
      VIEW_CITY: city,
      VIEW_PROVINCE: province
    } as BRANCH_TYPE;
  }

  private async getCollection(): Promise<void> {
    try {
      const docs: BranchModel[] = await this.crudService.getDocs();
      this.docs = docs.map((doc: BranchModel) => this.mapDoc(doc));
      this.dataSource.next(this.docs);
    } catch (error) {
      console.error('Errore durante il caricamento dei documenti:', error);
    }
  }

  public _rowAction(action: { record: any; key: string }): void {
    if (action.key === 'new') {
      this.doc = _.cloneDeep(this.emptyDoc);
      this.changeLocationId(this.doc.id);
      this.editRow();
      this.locationIdUpdateSubject.next(this.branchId());
    } else if (action.key === 'edit') {
      this.doc = _.cloneDeep(action.record ? action.record as BRANCH_TYPE : this.emptyDoc);
      this.changeLocationId(this.doc.id);
      this.editRow();
      this.locationIdUpdateSubject.next(this.branchId());
    } else if (action.key === 'view') {
      this.doc = _.cloneDeep(action.record ? action.record as BRANCH_TYPE : this.emptyDoc);
      this.changeLocationId(this.doc.id);
      this.locationIdUpdateSubject.next(this.branchId());
    } else if (action.key === 'map') {
      this.doc = _.cloneDeep(action.record ? action.record as BRANCH_TYPE : this.emptyDoc);
      this.openMap(this.doc);
    } else if (action.key === 'delete') {
      this.deletedDoc = _.cloneDeep(action.record ? action.record as BRANCH_TYPE : this.emptyDoc);
      this.deleteRow();
    }
  }

  public async _reloadCollection(): Promise<void> {
    try {
      this.loaderService.setComponentLoader(BranchesComponent.name);
      await this.getCollection();
    } finally {
      this.loaderService.setComponentLoaded(BranchesComponent.name);
    }
  }

  private changeLocationId(id: string | null): void {
    this.branchId.set(id);
    this.crudService.updateLocationId(id);
  }

  /*************************************************
   *
   * Edit
   *
   ************************************************/

  public editRow(): void {
    let dialogRef: MatDialogRef<LocationComponent> = this.dialog.open(LocationComponent, {
      width: '100%',
      height: '100%',
      data: this.doc
    });

    dialogRef.afterClosed().subscribe(async (doc: BRANCH_TYPE | null) => {
      if (doc) {
        this.loaderService.setComponentLoader(BranchesComponent.name);
        await this.getCollection();
        this.loaderService.setComponentLoaded(BranchesComponent.name);
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
        title: 'Cancellazione Parola Chiave',
        message: `Sei sicuro di voler eliminare la sede <strong>${this.deletedDoc.name}</strong>?`
      }
    });

    dialogRef.afterClosed().subscribe(async (confirmed: boolean | null) => {
      if (confirmed) {
        this.loaderService.setComponentLoader(BranchesComponent.name);

        const hasRooms: boolean = await this.roomService.hasRoom(this.deletedDoc.id as string);
        if (hasRooms) {
          this.loaderService.setComponentLoaded(BranchesComponent.name);
          return;
        }

        await this.crudService.deleteDoc(this.deletedDoc.id as string);
        await this.getCollection();
        this.changeLocationId('');
        this.locationIdUpdateSubject.next(this.branchId());

        this.loaderService.setComponentLoaded(BranchesComponent.name);
      }
    })
  }

  /*************************************************
   *
   * Cities
   *
   ************************************************/

  private getCities(): void {
    this.loaderService.setComponentLoader('cities');
    this.addressService.getCities().pipe(takeUntil(this.destroy$)).subscribe(city => {
      this.cities = city.city ?? [];
      this.loaderService.setComponentLoaded('cities');
    });
  }

  private findCity(istat: string | null): string | null {
    if (!istat) {
      return null;
    }
    const city: CityModel | null = this.cities.find((city: CityModel) => city.istat === istat) ?? null;
    return city ? city.comune : null;
  }

  /*************************************************
   *
   * Provinces
   *
   ************************************************/

  private getProvinces(): void {
    this.loaderService.setComponentLoader('provinces');
    this.addressService.getProvincies().pipe(takeUntil(this.destroy$)).subscribe(province => {
      this.provinces = province.province ?? [];
      this.loaderService.setComponentLoaded('provinces');
    });
  }

  private findProvince(sigla: string | null): string | null {
    if (!sigla) {
      return null;
    }
    const province: ProvinceModel | null = this.provinces.find((province: ProvinceModel) => province.sigla === sigla) ?? null;
    return province ? province.provincia : null;
  }

  /*************************************************
   *
   * Map
   *
   ************************************************/

  private openMap(doc: BRANCH_TYPE): void {
    const {street = null, province = '', city = null} = doc.address;

    if (street && city) {
      const address: string = `${street} ${this.findCity(city)} ${province}`;

      this.dialog.open(MapComponent, {
        width: '100%',
        height: '100%',
        data: {address: doc.address, title: address}
      });
    }

  }
}
