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
import {faEdit, faMagnifyingGlass, faPlus, faFilter, faFilterCircleXmark} from '@fortawesome/free-solid-svg-icons';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import 'animate.css';

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
  public faGlass: IconDefinition = faMagnifyingGlass;
  public faFilter: IconDefinition = faFilter;
  public faFilterClear: IconDefinition = faFilterCircleXmark;

  /* table */
  public docs: LOCATION_TYPE[] = [];
  public displayedColumns: string[] = ['id', 'code', 'name', 'description', 'modify', 'delete'];
  public filterColumns: string[] = ['f_id', 'f_code', 'f_name', 'f_descriptions', 'f_modify', 'f_delete'];
  public dataSource!: MatTableDataSource<LOCATION_TYPE>;

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

  filters: Record<string, string> = {
    code: '',
    name: '',
    description: '',
    // Add more fields if needed
  };

  public isFiltersOpen: boolean = false;

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

  /**************
   <table mat-table [dataSource]="dataSource" matSort>

   <!-- ID Column -->
   <ng-container matColumnDef="id">
   <th mat-header-cell *matHeaderCellDef mat-sort-header> ID</th>
   <td mat-cell *matCellDef="let row"> {{ row.id }}</td>
   </ng-container>

   <!-- Progress Column -->
   <ng-container matColumnDef="code">
   <th mat-header-cell *matHeaderCellDef mat-sort-header> Codice</th>
   <td mat-cell *matCellDef="let row"> {{ row.code }}</td>
   </ng-container>

   <!-- Name Column -->
   <ng-container matColumnDef="name">
   <th mat-header-cell *matHeaderCellDef mat-sort-header> Sede</th>
   <td mat-cell *matCellDef="let row"> {{ row.name }}</td>
   </ng-container>

   <!-- description Column -->
   <ng-container matColumnDef="description">
   <th mat-header-cell *matHeaderCellDef mat-sort-header> Descrizione</th>
   <td mat-cell *matCellDef="let row"> {{ row.description }}</td>
   </ng-container>

   <!-- edit Column -->
   <ng-container matColumnDef="modify">
   <th mat-header-cell *matHeaderCellDef> Modifica</th>
   <td mat-cell *matCellDef="let row">
   <button class="block font-normal ease-soft-in-out text-sm text-slate-500 hover:text-slate-800 mr-2
   rounded-2xl p-2 text-center transition-all
   hover:bg-slate-200"
   (click)="openDialog(row)" type="button">
   <fa-icon [icon]="faEdit"></fa-icon>
   </button>
   </td>
   </ng-container>

   <!-- delete Column -->
   <ng-container matColumnDef="delete">
   <th mat-header-cell *matHeaderCellDef> Elimina</th>
   <td mat-cell *matCellDef="let row">
   <button class="block font-normal ease-soft-in-out text-sm text-slate-500 hover:text-slate-800 mr-2
   rounded-2xl p-2 text-center transition-all
   hover:bg-slate-200"
   (click)="openDialog(row)" type="button">
   <fa-icon [icon]="faEdit"></fa-icon>
   </button>
   </td>
   </ng-container>

   <ng-container matColumnDef="f_id">
   <th mat-header-cell></th>
   </ng-container>

   <ng-container matColumnDef="f_code">
   <th mat-header-cell *matHeaderCellDef>
   <input (click)="$event.stopPropagation()"
   (keyup)="singleFilter($event, 'code')"
   class="rounded-md py-1 px-3 text-sm
   bg-slate-100
   focus:bg-slate-200
   transition-all duration-200 ease-in-out"
   placeholder="">
   </th>
   </ng-container>

   <ng-container matColumnDef="f_name">
   <th mat-header-cell></th>
   </ng-container>

   <ng-container matColumnDef="f_description">
   <th mat-header-cell></th>
   </ng-container>

   <ng-container matColumnDef="f_modify">
   <th mat-header-cell></th>
   </ng-container>

   <ng-container matColumnDef="f_delete">
   <th mat-header-cell></th>
   </ng-container>

   <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>
   <tr mat-header-row *matHeaderRowDef="filterColumns"></tr>
   <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

   <!-- Row shown when there is no matching data. -->
   <tr class="mat-row" *matNoDataRow>
   <td class="mat-cell" colspan="4">No data matching the filter "</td>
   </tr>
   </table>
   *************/
}
