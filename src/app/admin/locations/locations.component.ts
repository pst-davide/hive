import {Component, model, ModelSignal, OnInit} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {EMPTY_LOCATION, LOCATION_TYPE, LocationModel} from './model/location.model';
import _ from 'lodash';
import {LocationService} from './service/location.service';
import {LocationComponent} from './edit/location/location.component';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatTableModule} from '@angular/material/table';
import {BehaviorSubject, Subject, takeUntil} from 'rxjs';
import {AddressService, CityModel, ProvinceModel} from '../../core/services/address.service';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import 'animate.css';
import {MapComponent} from '../../core/dialog/map/map.component';
import {TableTemplateComponent} from '../../core/shared/table-template/table-template.component';
import {ColumnModel} from '../../core/model/column.model';
import {displayedColumns} from './locations.table';
import {LoaderService} from '../../core/services/loader.service';
import {DeleteDialogComponent} from '../../core/dialog/delete-dialog/delete-dialog.component';
import {RoomService} from '../rooms/service/room.service';
import {RoomsComponent} from '../rooms/rooms.component';


@Component({
  selector: 'app-locations',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatTableModule,
    FormsModule, ReactiveFormsModule, TableTemplateComponent, RoomsComponent],
  templateUrl: './locations.component.html',
  styleUrl: './locations.component.scss'
})
export class LocationsComponent implements OnInit {

  /* columns */
  public displayedColumns: ColumnModel[] = displayedColumns;

  /* table */
  public docs: LOCATION_TYPE[] = [];
  public dataSource: BehaviorSubject<LOCATION_TYPE[]> = new BehaviorSubject<LOCATION_TYPE[]>([]);

  /* filter */
  public filters: Record<string, any> = {
    code: '',
    name: '',
    description: '',
    enabled: 'Tutti'
  };

  /* doc */
  public doc: LOCATION_TYPE = _.cloneDeep(EMPTY_LOCATION);
  public emptyDoc: LOCATION_TYPE = _.cloneDeep(EMPTY_LOCATION);
  public deletedDoc: LOCATION_TYPE = _.cloneDeep(EMPTY_LOCATION);

  /* cities */
  public cities: CityModel[] = [];

  /* provinces */
  public provinces: ProvinceModel[] = [];

  /* category */
  public locationId: ModelSignal<string | null> = model<string | null>('');
  public locationIdUpdateSubject: Subject<string | null> = new Subject<string | null>();

  /* Subject */
  private destroy$: Subject<void> = new Subject<void>();

  constructor(private crudService: LocationService, public dialog: MatDialog, private addressService: AddressService,
              private loaderService: LoaderService, private roomService: RoomService) {
  }

  ngOnInit(): void {
    this.getCities();
    this.getProvinces();
    this.getCollection().then(() => {});
  }

  /*************************************************
   *
   * Table
   *
   ************************************************/

  private mapDoc(doc: LocationModel): LOCATION_TYPE {
    const city: string | null = this.findCity(doc.address?.city ?? null);
    const province: string | null = this.findProvince(doc.address?.province ?? null);

    return {
      ...doc,
      VIEW_STREET: doc.address?.street ?? null,
      VIEW_ZIP: doc.address?.zip ?? null,
      VIEW_CITY: city,
      VIEW_PROVINCE: province
    } as LOCATION_TYPE;
  }

  private async getCollection(): Promise<void> {
    this.loaderService.setComponentLoader(LocationsComponent.name);
    try {
      const docs: LocationModel[] = await this.crudService.getDocs();
      this.docs = docs.map((doc: LocationModel) => this.mapDoc(doc));
      this.dataSource.next(this.docs);
    } catch (error) {
      console.error('Errore durante il caricamento dei documenti:', error);
    } finally {
      this.loaderService.setComponentLoaded(LocationsComponent.name);
    }
  }

  public _rowAction(action: { record: any; key: string }): void {
    if (action.key === 'new') {
      this.doc = _.cloneDeep(this.emptyDoc);
      this.locationId.set(this.doc.id);
      this.editRow();
      this.locationIdUpdateSubject.next(this.locationId());
    } else if (action.key === 'edit') {
      this.doc = _.cloneDeep(action.record ? action.record as LOCATION_TYPE : this.emptyDoc);
      this.locationId.set(this.doc.id);
      this.editRow();
      this.locationIdUpdateSubject.next(this.locationId());
    } else if (action.key === 'view') {
      this.doc = _.cloneDeep(action.record ? action.record as LOCATION_TYPE : this.emptyDoc);
      this.locationId.set(this.doc.id);
      this.locationIdUpdateSubject.next(this.locationId());
    } else if (action.key === 'map') {
      this.doc = _.cloneDeep(action.record ? action.record as LOCATION_TYPE : this.emptyDoc);
      this.openMap(this.doc);
    } else if (action.key === 'delete') {
      this.deletedDoc = _.cloneDeep(action.record ? action.record as LOCATION_TYPE : this.emptyDoc);
      this.deleteRow();
    }
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

    dialogRef.afterClosed().subscribe((doc: LOCATION_TYPE | null) => {
      if (doc) {
        this.loaderService.setComponentLoader(LocationsComponent.name);
        this.getCollection();
        this.loaderService.setComponentLoaded(LocationsComponent.name);
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
        this.loaderService.setComponentLoader(LocationsComponent.name);

        const hasRooms: boolean = await this.roomService.hasRoom(this.deletedDoc.id as string);
        if (hasRooms) {
          this.loaderService.setComponentLoaded(LocationsComponent.name);
          return;
        }

        await this.crudService.deleteDoc(this.deletedDoc.id as string);
        await this.getCollection();
        this.locationId.set('');
        this.locationIdUpdateSubject.next(this.locationId());

        this.loaderService.setComponentLoaded(LocationsComponent.name);
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

  private openMap(doc: LOCATION_TYPE): void {
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
