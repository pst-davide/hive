import {
  AfterViewInit,
  ChangeDetectorRef,
  Component, effect, ElementRef,
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
  faFileExcel,
  faFilePdf,
  faFilter,
  faFilterCircleXmark,
  faMagnifyingGlass,
  faPlus,
  faCheck,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import {BehaviorSubject, Subject, takeUntil} from 'rxjs';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatFormField, MatLabel, MatSuffix} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import _ from 'lodash';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE_OPTIONS} from '../../functions/environments';
import {MatTooltip} from '@angular/material/tooltip';
import {ALIGN_OPTIONS, ColumnModel, TYPE_OPTIONS} from '../../model/column.model';
import {NgClass} from '@angular/common';
import {PdfService} from '../../services/pdf.service';
import {exporter} from '../../functions/file-exporter';
import {TruncatePipe} from '../../pipe/truncate.pipe';
import {MatOption} from '@angular/material/autocomplete';
import {MatSelectChange, MatSelectModule} from '@angular/material/select';
import {MatOptionSelectionChange} from '@angular/material/core';

export interface SelectColumnModel {
  key: string, name: string, checked: boolean
}

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
    TruncatePipe,
    MatLabel,
    MatOption,
    MatSelectModule,
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
  public filters: ModelSignal<Record<string, any>> = model<Record<string, any>>({});
  public globalFilter: string = '';
  public isFiltersOpen: boolean = false;
  public activeFilter: boolean = false;
  public form: FormGroup = new FormGroup({});

  /* view columns */
  public columnCtrl: FormControl = new FormControl();
  public selectableColumns: SelectColumnModel[] = [];
  public allSelected: boolean = false;

  /* icons */
  public faPlus: IconDefinition = faPlus;
  public faGlass: IconDefinition = faMagnifyingGlass;
  public faFilter: IconDefinition = faFilter;
  public faFilterClear: IconDefinition = faFilterCircleXmark;
  public faPdf: IconDefinition = faFilePdf;
  public faExcel: IconDefinition = faFileExcel;
  public faCheck: IconDefinition = faCheck;
  public faXmark: IconDefinition = faXmark;

  /* data column options */
  public readonly TYPE_OPTIONS: { NUMBER: string; STRING: string; ID: string;
    ICON: string; COLOR: string; BADGE: string; TRUNCATE: string; BOOLEAN: string } = TYPE_OPTIONS;
  public readonly ALIGN_OPTIONS: { CENTER: string; LEFT: string; RIGHT: string } = ALIGN_OPTIONS;

  /* Subject */
  private destroy$: Subject<void> = new Subject<void>();

  constructor(private cdr: ChangeDetectorRef, private pdfService: PdfService, private elRef: ElementRef,
              private renderer: Renderer2) {
    effect(() => {
      const columns: ColumnModel[] = this.displayedColumns();
      if (columns.length > 0) {
        this.setSelectableColumns(columns);
      }
    });
  }

  ngOnInit(): void {
    for (const column of this.displayedColumns()) {
      if (column.isFilterable) {
        let defaultValue: any = '';
        if (column.type === TYPE_OPTIONS.BOOLEAN) {
          defaultValue = null;
        }
        this.form.addControl(column.key, new FormControl(defaultValue));
      }
    }

    this.data.pipe(takeUntil(this.destroy$)).subscribe((data: any) => {
      this.dataSource.data = data;
      this.dataSource.filteredData = data;
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;

      this.dataSource.filterPredicate = (data: any, filter: string): boolean => {
        const searchTerms = JSON.parse(filter);
        const globalFilter = searchTerms.global || '';
        delete searchTerms.global;

        // Filtra per colonne specifiche
        const matchFilter: boolean = Object.keys(searchTerms).every((column: string) => {
          const filterValue: any = searchTerms[column];

          if (typeof data[column] === 'number') {
            return data[column] === filterValue || data[column].toString().includes(filterValue.toString());
          } else if (typeof data[column] === 'boolean') {
            if (filterValue === 'Tutti' || filterValue === '') return true;
            return data[column] === (filterValue === 'true');
          } else {
            const columnValue: string = data[column]?.toString().toLowerCase() ?? '';
            return columnValue.includes(filterValue.toLowerCase());
          }
        });

        // Filtro globale (su tutti i campi)
        const globalMatch: boolean = globalFilter
          ? Object.keys(data).some((key: string) => {
            const fieldValue = data[key]?.toString().toLowerCase() ?? ''; // Gestione null e undefined
            return fieldValue.includes(globalFilter);
          })
          : true;

        return matchFilter && globalMatch;
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

  public singleFilter(event: any, columnKey: string): void {
    let value: string | boolean;
    const column: ColumnModel | null = this.displayedColumns()
      .find((col: ColumnModel) => col.key === columnKey) ?? null;

    if (column?.type === TYPE_OPTIONS.BOOLEAN) {
      const selectedValue = event.value;
      value = selectedValue === 'Tutti' ? 'Tutti' : selectedValue === 'true';
    } else {
      value = event.target.value.trim().toLowerCase();
    }

    this.filters()[columnKey] = value;
    this.updateFilters();
  }

  private updateFilters(): void {
    const combinedFilter = {
      ...this.filters(),
      global: this.globalFilter
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
      const filterValue = this.filters()[key];
      if (typeof filterValue === 'string' && filterValue.trim() !== '') {
        return true;
      } else if (typeof filterValue === 'boolean' && filterValue) {
        return true;
      }
    }
    return false;
  }

  public hasFilters(): boolean {
    return Object.keys(this.filters()).length > 0;
  }

  public _clearFilter(): void {
    for (const key in this.filters()) {
      if (this.filters().hasOwnProperty(key)) {
        this.filters()[key] = '';
      }
    }

    this.globalFilter = '';
    this.globalFilterCtrl.setValue(null);
    this.form.reset();
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
   * visible Columns
   *
   ***********************************************/

  public _toggleAll(event: MatOptionSelectionChange): void {
    this.allSelected = event.source.selected;

    const checkedColumns: string[] = [];
    this.selectableColumns = this.selectableColumns.map((column: SelectColumnModel) => {
      if (event.source.selected) {
        checkedColumns.push(column.key);
      }
      column.checked = event.source.selected;
      return column;
    });

    for (const column of this.displayedColumns()) {
      if (column.isSelectable) {
        column.hide = !event.source.selected;
      }
    }

    this.columnCtrl.setValue(checkedColumns);
    this.resetColumnClass();
  }

  public _toggleColumns(event: MatSelectChange): void {
    for (const column of this.displayedColumns()) {
      if (column.isSelectable) {
        const index = event.value.findIndex((v: string) => v === column.key);
        column.hide = index === -1;
      }
    }

    this.allSelected = this.displayedColumns().filter((column: ColumnModel) => column.isSortable && column.hide).length === 0;
    // TODO
    if (!this.allSelected) {
      const checked: string[] = this.columnCtrl.value;
      this.columnCtrl.setValue(checked.map((c: string) => c !?? 'select-all') ?? []);
    }

    this.resetColumnClass();
  }

  private setSelectableColumns(columns: ColumnModel[]): void {
    const checkedColumns: string[] = [];

    for (const column of columns) {
      if (column.isSelectable) {
        this.selectableColumns.push({
          key: column.key,
          name: column?.selectableName ?? column.name,
          checked: !column.hide
        });

        if (!column.hide) {
          checkedColumns.push(column.key);
        }
      }
    }

    this.selectableColumns = _.sortBy(this.selectableColumns, 'name');
    this.columnCtrl.setValue(checkedColumns);
  }

  public getColumnControlName(key: string | null): string {
    if (key) {
      const column: ColumnModel | null = this.displayedColumns().find((col: ColumnModel) => col.key === key) ?? null;
      const {selectableName, name = ''} = column ?? {};
      return selectableName ?? name;
    }
    return '';
  }

  private resetColumnClass(): void {
    setTimeout(() => {
      const columns: ColumnModel[] = this.displayedColumns();

      for (const column of columns) {
        const containerDiv: HTMLElement | null = document.getElementById(`${column.key}`);
        if (containerDiv) {
          const sortHeaderContainerDiv: Element | null = containerDiv.querySelector('.mat-sort-header-container');
          if (sortHeaderContainerDiv) {
            this.renderer.removeClass(sortHeaderContainerDiv, 'justify-start');
            this.renderer.removeClass(sortHeaderContainerDiv, 'justify-center');
            this.renderer.removeClass(sortHeaderContainerDiv, 'justify-end');

            if (column.align === ALIGN_OPTIONS.LEFT) {
              this.renderer.addClass(sortHeaderContainerDiv, 'justify-start');
            } else if (column.align === ALIGN_OPTIONS.CENTER) {
              this.renderer.addClass(sortHeaderContainerDiv, 'justify-center');
            } else if (column.align === ALIGN_OPTIONS.RIGHT) {
              this.renderer.addClass(sortHeaderContainerDiv, 'justify-end');
            }
          }
        }
      }
    }, 0);
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
