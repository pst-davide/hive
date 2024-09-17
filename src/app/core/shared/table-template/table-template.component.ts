import {
  AfterViewInit,
  Component, input, InputSignal,
  model,
  ModelSignal,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatSort, MatSortModule} from '@angular/material/sort';
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
import {Subject, Subscription} from 'rxjs';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatFormField, MatSuffix} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import _ from 'lodash';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE_OPTIONS} from '../../functions/environments';
import {MatTooltip} from '@angular/material/tooltip';
import {T} from '@fullcalendar/core/internal-common';
import {ALIGN_OPTIONS, ColumnModel, TYPE_OPTIONS} from "../../model/column.model";

@Component({
  selector: 'app-table-template',
  standalone: true,
  imports: [
    FaIconComponent,
    MatFormField,
    MatInput,
    MatSuffix,
    ReactiveFormsModule,
    MatTooltip,
    MatSortModule,
    MatTableModule,
    MatPaginatorModule,
  ],
  templateUrl: './table-template.component.html',
  styleUrl: './table-template.component.scss'
})
export class TableTemplateComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  /* table */
  public docs: any[] = [];
  public dataSourceInput: ModelSignal<any> = model([]);
  public dataSource: MatTableDataSource<T> = new MatTableDataSource(this.dataSourceInput());
  public displayedColumns: ModelSignal<ColumnModel[]> = model([] as ColumnModel[]);
  public filterColumns: ModelSignal<ColumnModel[]> = model([] as ColumnModel[]);
  public pageSize: ModelSignal<number> = model(DEFAULT_PAGE_SIZE);
  public pageSizeOptions: ModelSignal<number[]> = model(DEFAULT_PAGE_SIZE_OPTIONS);

  /* actions */
  public canExportToPdf: ModelSignal<boolean> = model(true);
  public canExportToXls: ModelSignal<boolean> = model(true);
  public canInsert: ModelSignal<boolean> = model(true);

  /* Filters */
  public globalFilterCtrl: FormControl = new FormControl();
  public filters: ModelSignal<Record<string, string>> = model<Record<string, string>>({});
  public filterForm: ModelSignal<FormGroup<any>> = model<FormGroup<any>>(new FormGroup({}));
  public globalFilter: string = '';
  public isFiltersOpen: boolean = false;
  public activeFilter: boolean = false;

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

  /* data column options */
  public readonly TYPE_OPTIONS: { NUMBER: string; STRING: string; ID: string; ICON: string } = TYPE_OPTIONS;
  public readonly ALIGN_OPTIONS: { CENTER: string; LEFT: string; RIGHT: string } = ALIGN_OPTIONS;

  /* Subject */
  private destroy$: Subject<void> = new Subject<void>();
  private _subscription!: Subscription;

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes['dataSourceInput'] && !changes['dataSourceInput'].firstChange) {

    }


    if (changes['dataSourceInput'] && !changes['dataSourceInput'].firstChange) {
      console.log('New dataSourceInput value:');
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
    this.filters()[column] = value.trim().toLowerCase();
    this.updateFilters();
  }

  private updateFilters(): void {
    const combinedFilter = {
      ...this.filters(),  // Filtro per colonne specifiche
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
    for (const key in this.filters()) {
      if (this.filters()[key].trim() !== '') {
        return true;
      }
    }
    return false;
  }

  public hasFilters(): boolean {
    return Object.keys(this.filters()).length > 0;
  }

  public _clearFilter(): void {
    _.forEach(this.filters, (value, key) => {
      this.filters()[key] = '';
    });

    this.globalFilter = '';
    this.globalFilterCtrl.setValue(null);
    this.filterForm().reset();
    this.activeFilter = false;

    this.updateFilters();
  }

  public _toggleFilter(): void {
    this.isFiltersOpen = !this.isFiltersOpen;
  }

  /*************************************************
   *
   * Columns
   *
   ************************************************/

  public _getColumnKeys(filter: boolean = false): string[] {
    return this.displayedColumns()
      .filter((column: ColumnModel) => !column.hide)
      .map((column: ColumnModel) => filter ? `_${column.key}` : column.key);
  }

  public hasData = (row: any): boolean => {
    return this.dataSource.filteredData.length > 0;
  };

  public noData = (row: any): boolean => {
    return this.dataSource.filteredData.length === 0;
  };

}
