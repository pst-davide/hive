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
import {catchError, of, Subject, takeUntil, tap} from 'rxjs';
import {AddressService, CityModel, ProvinceModel} from '../../core/services/address.service';
import {FaIconComponent, IconDefinition} from '@fortawesome/angular-fontawesome';
import {
  faEdit,
  faMagnifyingGlass,
  faPlus,
  faFilter,
  faFilterCircleXmark,
  faTrash,
  faLocationDot, faFilePdf, faFileExcel
} from '@fortawesome/free-solid-svg-icons';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import 'animate.css';
import {DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE_OPTIONS} from '../../core/functions/environments';
import {MapComponent} from '../../core/dialog/map/map.component';
import {OpenaiService} from '../../core/services/openai.service';

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
  public faPdf: IconDefinition = faFilePdf;
  public faExcel: IconDefinition = faFileExcel;

  /* table */
  public docs: LOCATION_TYPE[] = [];
  public displayedColumns: string[] = ['id', 'code', 'name', 'description', 'map', 'modify', 'delete'];
  public filterColumns: string[] = ['f_id', 'f_code', 'f_name', 'f_descriptions', 'f_map', 'f_modify', 'f_delete'];
  public dataSource!: MatTableDataSource<LOCATION_TYPE>;
  public pageSize: number = DEFAULT_PAGE_SIZE;
  public pageSizeOptions: number[] = DEFAULT_PAGE_SIZE_OPTIONS;
  /*
  public displayedColumns: ColumnModel[] = [
    { field: 'id', header: '#', hide: false },
    { field: 'code', header: 'Codice', hide: false },
    { field: 'name', header: 'Sede', hide: false },
    { field: 'description', header: 'Descrizione', hide: false },
    { field: 'map', header: 'Mappa', hide: false },
    { field: 'modify', header: 'Modifica', hide: false },
    { field: 'delete', header: 'Elimina', hide: false },
  ];

   */

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  /* doc */
  public doc: LOCATION_TYPE = _.cloneDeep(EMPTY_LOCATION);
  public emptyDoc: LOCATION_TYPE = _.cloneDeep(EMPTY_LOCATION);

  /* cities */
  public cities: CityModel[] = [];

  /* provinces */
  public provinces: ProvinceModel[] = [];

  /* Subject */
  private destroy$: Subject<void> = new Subject<void>();

  /* Filters */
  public globalFilterCtrl: FormControl = new FormControl();
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
  public globalFilter: string = '';
  public isFiltersOpen: boolean = false;
  public activeFilter: boolean = false;

  private text = "Charles Leclerc partirà ancora una volta davanti a tutti nel GP di Baku: l\'1\'41\"365 registrato in Q3 vale " +
  "infatti la quarta pole consecutiva al monegasco in Azerbaigian. Di fianco a lui ci sarà la McLaren di Oscar Piastri, " +
  "terza piazza per l\'altra Ferrari di Sainz. Il monegasco, reduce dalla vittoria di Monza, ha commentato così la pole " +
  "numero 26 della carriera: \"È un risultato fantastico: questa è una delle mie piste preferite, con cui sento di avere " +
  "un feeling speciale. E pensare che il weekend non era iniziato nel migliore dei modi: nelle prime prove libere " +
  "l\'incidente, nelle seconde abbiamo avuto problemi con un pezzo nuovo che abbiamo portato\"."
  userMessage: string = 'Puoi rispondere a domande riguardanti problemi di rete?';
  chatMessages: { sender: string, message: string }[] = [];

  constructor(private crudService: LocationService, public dialog: MatDialog, private addressService: AddressService,
              private openAiService: OpenaiService) {
  }

  ngOnInit(): void {
    this.getCities();
    this.getProvinces();
    this.getCollection();

    /*
    this.openAiService.analyzeText(this.text, ['Ferrari','GP','Leclerc']).subscribe(
      (response) => {
        console.log(response.analysis);
      },
      (error) => {
        console.error('Errore durante l\'analisi:', error);
      }
    );



    this.openAiService.sendMessage(this.userMessage)
    .pipe(
      tap((response) => {
        console.log('Risposta dal server:', response);
        this.chatMessages.push({ sender: 'Bot', message: response.message });
      }),
      catchError((error) => {
        this.chatMessages.push({ sender: 'Bot', message: 'Errore: Impossibile ottenere una risposta.' });
        return of();  // Evita l'errore e ritorna un observable vuoto
      })
    )
    .subscribe();

    this.userMessage = '';
    */
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

        this.dataSource.filterPredicate = (data: any, filter: string): boolean => {
          const searchTerms = JSON.parse(filter);
          const globalFilter = searchTerms.global || ''; // Ottieni il filtro globale
          delete searchTerms.global; // Rimuovi il filtro globale dall'oggetto

          // Filtro per campi specifici (per le colonne selezionate)
          const matchFilter: boolean = Object.keys(searchTerms).every(column => {
            const columnValue = data[column] ? data[column].toString().toLowerCase() : ''; // Gestisce null e undefined
            return columnValue.includes(searchTerms[column]);
          });

          // Filtro globale (su tutti i campi)
          const globalMatch: boolean = globalFilter
            ? Object.keys(data).some((key: string) => {
              const fieldValue = data[key] ? data[key].toString().toLowerCase() : ''; // Gestisce null e undefined
              return fieldValue.includes(globalFilter);
            })
            : true;

          return matchFilter && globalMatch; // Entrambi i filtri devono corrispondere
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
    this.globalFilter = filterValue.trim().toLowerCase();
    this.updateFilters();
  }

  public singleFilter(event: any, column: string) {
    const value = event.target.value;
    this.filters[column] = value.trim().toLowerCase();
    this.updateFilters();
  }

  private updateFilters(): void {
    const combinedFilter = {
      ...this.filters,  // Filtro per colonne specifiche
      global: this.globalFilter  // Filtro globale
    };
    console.log(combinedFilter);
    // Converte l'oggetto in una stringa e lo assegna alla dataSource.filter
    this.dataSource.filter = JSON.stringify(combinedFilter);

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
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

    this.globalFilter = '';
    this.globalFilterCtrl.setValue(null);
    this.filterForm.reset();
    this.activeFilter = false;

    this.updateFilters();
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
        data: {address: doc.address, title: address}
      });
    }

  }

}
