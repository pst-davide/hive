import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {EMPTY_LOCATION, LOCATION_TYPE, LocationModel} from './model/location.model';
import _ from 'lodash';
import {LocationService} from './service/location.service';
import {LocationComponent} from './edit/location/location.component';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {Subject, takeUntil} from "rxjs";
import {AddressService, CityModel, ProvinceModel} from "../../core/services/address.service";
import {FaIconComponent, IconDefinition} from "@fortawesome/angular-fontawesome";
import {
  faEdit,
  faMagnifyingGlass,
  faPlus,
  faFilter,
  faFilterCircleXmark,
  faTrash,
  faLocationDot
} from '@fortawesome/free-solid-svg-icons';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import 'animate.css';
import {DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE_OPTIONS} from "../../core/functions/environments";
import {MapComponent} from "../../core/dialog/map/map.component";

@Component({
  selector: 'app-locations',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule, FaIconComponent,
    FormsModule, ReactiveFormsModule],
  templateUrl: './locations.component.html',
  styleUrl: './locations.component.scss'
})
export class LocationsComponent implements OnInit, AfterViewInit {

  /* icons */
  public faEdit: IconDefinition = faEdit;
  public faPlus: IconDefinition = faPlus;
  public faTrash: IconDefinition = faTrash;
  public faGlass: IconDefinition = faMagnifyingGlass;
  public faFilter: IconDefinition = faFilter;
  public faFilterClear: IconDefinition = faFilterCircleXmark;
  public faLocationDot: IconDefinition = faLocationDot;

  /* table */
  public docs: LOCATION_TYPE[] = [];
  public displayedColumns: string[] = ['id', 'code', 'name', 'description', 'map', 'modify', 'delete'];
  public filterColumns: string[] = ['f_id', 'f_code', 'f_name', 'f_descriptions', 'f_map', 'f_modify', 'f_delete'];
  public dataSource!: MatTableDataSource<LOCATION_TYPE>;
  public pageSize: number = DEFAULT_PAGE_SIZE;
  public pageSizeOptions: number[] = DEFAULT_PAGE_SIZE_OPTIONS;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  /* doc */
  public doc: LOCATION_TYPE = _.cloneDeep(EMPTY_LOCATION);

  /* cities */
  public cities: CityModel[] = [];

  /* provinces */
  public provinces: ProvinceModel[] = [];

  /* Subject */
  private destroy$: Subject<void> = new Subject<void>();

  /* Filters */
  public filters: Record<string, string> = {
    code: '',
    name: '',
    description: '',
  };
  public filterForm: FormGroup = new FormGroup({
    code: new FormControl(''),
    name: new FormControl(''),
    description: new FormControl('')
  });
  public isFiltersOpen: boolean = false;
  public activeFilter: boolean = false;

  constructor(private crudService: LocationService, public dialog: MatDialog, private addressService: AddressService) {
  }

  ngOnInit(): void {
    this.getCities();
    this.getProvinces();
    this.getCollection();
  }

  ngAfterViewInit() {
  }

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

  private getCollection(): void {
    this.crudService.getDocs().subscribe({
      next: (data: LocationModel[]) => {
        this.docs = data.map((doc: LocationModel) => this.mapDoc(doc));
        this.dataSource = new MatTableDataSource(this.docs);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        this.dataSource.filterPredicate = (data: any, filter: string) => {
          const filters = JSON.parse(filter);

          return (
            (!filters.code || data.code.toLowerCase().includes(filters.code)) &&
            (!filters.name || data.name.toLowerCase().includes(filters.name)) &&
            (!filters.description || (data.description && data.description.toLowerCase().includes(filters.description)))
          );
        };
      },
      error: (error) => {
        console.error('Errore durante il recupero dei documenti:', error);
      },
      complete: () => {
        console.log('Recupero documenti completato');
      }
    });
  }

  /*************************************************
   *
   * Filter
   *
   ************************************************/

  public applyFilter(event: Event): void {
    const filterValue: string = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  public singleFilter(event: any, column: string) {
    const value = event.target.value;
    this.filters[column] = value.trim().toLowerCase();
    this.dataSource.filter = JSON.stringify(this.filters);

    this.activeFilter = this.hasActiveFilters();
  }

  private hasActiveFilters(): boolean {
    for (const key in this.filters) {
      if (this.filters[key].trim() !== '') {
        return true;
      }
    }
    return false;
  }

  public _clearFilter(): void {
    _.forEach(this.filters, (value, key) => {
      this.filters[key] = '';
    });

    this.filterForm.reset();
    this.activeFilter = false;

    this.dataSource.filter = JSON.stringify(this.filters);
  }

  public _toggleFilter(): void {
    this.isFiltersOpen = !this.isFiltersOpen;
  }

  /*************************************************
   *
   * Edit
   *
   ************************************************/

  public openDialog(doc: LOCATION_TYPE): void {
    console.log(doc)
    let dialogRef: MatDialogRef<LocationComponent> = this.dialog.open(LocationComponent, {
      width: '100%',
      height: '100%',
      data: doc
    });

    dialogRef.afterClosed().subscribe((doc: LOCATION_TYPE | null) => {
      console.log(doc);
    })
  }

  /*************************************************
   *
   * Cities
   *
   ************************************************/

  private getCities(): void {
    this.addressService.getCities().pipe(takeUntil(this.destroy$)).subscribe(city => {
      this.cities = city.city ?? [];
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
    this.addressService.getProvincies().pipe(takeUntil(this.destroy$)).subscribe(province => {
      this.provinces = province.province ?? [];
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

  public _openMap(doc: LOCATION_TYPE): void {
    const {street = null, province = '', city = null} = doc.address;

    if (street && city) {
      const address: string = `${street} ${this.findCity(city)} ${province}`;

      this.dialog.open(MapComponent, {
        width: '100%',
        height: '100%',
        data: {address: this.doc.address, title: address}
      });
    }

  }

}
