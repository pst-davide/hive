import {
  AfterViewInit,
  ChangeDetectorRef,
  Component, ElementRef,
  EventEmitter,
  Input,
  model,
  ModelSignal,
  OnChanges,
  OnDestroy,
  OnInit,
  Output, Renderer2,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {FaIconComponent, IconDefinition} from '@fortawesome/angular-fontawesome';
import {
  faEdit,
  faFileExcel,
  faFilePdf,
  faFilter,
  faFilterCircleXmark,
  faLocationDot,
  faMagnifyingGlass,
  faPlus,
  faTrash
} from '@fortawesome/free-solid-svg-icons';
import {BehaviorSubject, Subject, takeUntil} from 'rxjs';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatFormField, MatSuffix} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import _ from 'lodash';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE_OPTIONS} from '../../functions/environments';
import {MatTooltip} from '@angular/material/tooltip';
import {ALIGN_OPTIONS, ColumnModel, TYPE_OPTIONS} from '../../model/column.model';
import {NgClass} from '@angular/common';
import {PdfService} from '../../services/pdf.service';
import {exporter} from '../../functions/file-exporter';

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
    NgClass,
  ],
  templateUrl: './table-template.component.html',
  styleUrl: './table-template.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class TableTemplateComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  /* table */
  public docs: any[] = [];
  @Input() data!: BehaviorSubject<any[]>;
  public dataSource: MatTableDataSource<any> = new MatTableDataSource();
  public displayedColumns: ModelSignal<ColumnModel[]> = model([] as ColumnModel[]);
  public filterColumns: ModelSignal<ColumnModel[]> = model([] as ColumnModel[]);
  public pageSize: ModelSignal<number> = model(DEFAULT_PAGE_SIZE);
  public pageSizeOptions: ModelSignal<number[]> = model(DEFAULT_PAGE_SIZE_OPTIONS);
  public exportFileName: ModelSignal<string> = model('');
  @Output() rowAction: EventEmitter<{ record: any, key: string }> = new EventEmitter<{ record: any, key: string }>();

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
  public faPlus: IconDefinition = faPlus;
  public faGlass: IconDefinition = faMagnifyingGlass;
  public faFilter: IconDefinition = faFilter;
  public faFilterClear: IconDefinition = faFilterCircleXmark;
  public faPdf: IconDefinition = faFilePdf;
  public faExcel: IconDefinition = faFileExcel;
  public faEdit: IconDefinition = faEdit;
  public faTrash: IconDefinition = faTrash;
  public faLocationDot: IconDefinition = faLocationDot;

  /* data column options */
  public readonly TYPE_OPTIONS: { NUMBER: string; STRING: string; ID: string;
    ICON: string; COLOR: string; BADGE: string } = TYPE_OPTIONS;
  public readonly ALIGN_OPTIONS: { CENTER: string; LEFT: string; RIGHT: string } = ALIGN_OPTIONS;

  /* Subject */
  private destroy$: Subject<void> = new Subject<void>();

  constructor(private cdr: ChangeDetectorRef, private pdfService: PdfService, private elRef: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    this.data.pipe(takeUntil(this.destroy$)).subscribe((data: any) => {
      this.dataSource.data = data;
      this.dataSource.filteredData = data;
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;

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

      this.cdr.detectChanges();
    });
  }

  ngAfterViewInit(): void {
    this.tableAlign();
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {}

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
    this.cdr.detectChanges();
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

  private tableAlign(): void {
    const headers: any = this.elRef.nativeElement.querySelectorAll('.mat-sort-header');

    headers.forEach((header: any) => {

      const headerId = header.getAttribute('ng-reflect-id');

      const containerDiv = header.querySelector('.mat-sort-header-container');

      if (containerDiv) {
        const correspondingColumn: ColumnModel | null = this.displayedColumns()
          .find((column: ColumnModel) => column.key === headerId) ?? null;

        if (correspondingColumn) {

          this.renderer.removeClass(containerDiv, 'justify-start');
          this.renderer.removeClass(containerDiv, 'justify-center');
          this.renderer.removeClass(containerDiv, 'justify-end');

          if (correspondingColumn.align === ALIGN_OPTIONS.LEFT) {
            this.renderer.addClass(containerDiv, 'justify-start');
          } else if (correspondingColumn.align === ALIGN_OPTIONS.CENTER) {
            this.renderer.addClass(containerDiv, 'justify-center');
          } else if (correspondingColumn.align === ALIGN_OPTIONS.RIGHT) {
            this.renderer.addClass(containerDiv, 'justify-end');
          }
        }
      }
    });
  }

  /************************************************
   *
   * Emit
   *
   ***********************************************/

  public _emitRowAction(row: any, dataKey: string): void {
    this.rowAction.emit({record: row, key: dataKey});
  }

  public _exportAsPDF(): void {
    if (this.dataSource.filteredData.length > 0) {
      const dataExported: any[] = exporter(this.dataSource.filteredData, this.displayedColumns());
      this.pdfService.exportPDF(dataExported, _.kebabCase(this.exportFileName() ?? 'file'), this.exportFileName());
    }
  }
}
