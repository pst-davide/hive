import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {BehaviorSubject} from "rxjs";
import {PressService} from "../service/press.service";
import {TableTemplateComponent} from '../../../core/shared/table-template/table-template.component';
import {EMPTY_PRESS_CATEGORY, PRESS_CATEGORY_TYPE, PressCategoryModel} from '../model/press-category.model';
import {ALIGN_OPTIONS, ColumnModel, TYPE_OPTIONS} from '../../../core/model/column.model';
import {faEdit, faTrash} from '@fortawesome/free-solid-svg-icons';
import _ from 'lodash';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {PressCategoryComponent} from './edit/press-category/press-category.component';

@Component({
  selector: 'app-press-categories',
  standalone: true,
  imports: [
    TableTemplateComponent
  ],
  templateUrl: './press-categories.component.html',
  styleUrl: './press-categories.component.scss'
})
export class PressCategoriesComponent implements OnInit {

  public doc: PRESS_CATEGORY_TYPE = _.cloneDeep(EMPTY_PRESS_CATEGORY);
  public emptyDoc: PRESS_CATEGORY_TYPE = _.cloneDeep(EMPTY_PRESS_CATEGORY);

  /****************************
   * table
   * *************************/
  public docs: PRESS_CATEGORY_TYPE[] = [];
  public dataSource: BehaviorSubject<PRESS_CATEGORY_TYPE[]> = new BehaviorSubject<PRESS_CATEGORY_TYPE[]>([]);

  // filter
  public filters: Record<string, string> = {};
  public filterForm: FormGroup = new FormGroup({name: new FormControl('')});

  // columns
  public displayedColumns: ColumnModel[] = [
    {
      key: 'id',
      name: '#',
      hide: false,
      type: TYPE_OPTIONS.ID,
      align: ALIGN_OPTIONS.CENTER,
      isFilterable: false,
      isSortable: false,
      className: 'text-slate-400 max-w-28 w-28',
      isExportable: true,
    },
    {
      key: 'name',
      name: 'Argomento',
      hide: false,
      type: TYPE_OPTIONS.STRING,
      isFilterable: false,
      isSortable: true,
      isExportable: true,
    },
    {
      key: 'edit',
      name: 'Modifica',
      hide: false,
      type: TYPE_OPTIONS.ICON,
      isFilterable: false,
      isSortable: false,
      align: ALIGN_OPTIONS.CENTER,
      stickyEnd: true,
      icon: faEdit,
      isExportable: false,
    },
    {
      key: 'delete',
      name: 'Elimina',
      hide: false,
      type: TYPE_OPTIONS.ICON,
      isFilterable: false,
      isSortable: false,
      align: ALIGN_OPTIONS.CENTER,
      stickyEnd: true,
      icon: faTrash,
      isExportable: false,
    }
  ];

  constructor(private crudService: PressService, public dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.getCollection();
  }

  /*************************************************
   *
   * Table
   *
   ************************************************/

  private mapData(doc: PressCategoryModel): PRESS_CATEGORY_TYPE {
    return {
      ...doc
    } as PRESS_CATEGORY_TYPE;
  }

  private getCollection(): void {
    this.crudService.getDocs().subscribe({
      next: (data: PressCategoryModel[]) => {
        console.log(data);
        this.docs = data.map((doc: PressCategoryModel) => this.mapData(doc));
        this.dataSource.next(this.docs);
      },
      error: (error) => {
        console.error('Errore durante il recupero dei documenti:', error);
      },
      complete: () => {
        console.log('Recupero documenti completato');
      }
    });
  }

  public _rowAction(action: { record: any; key: string }): void {
    console.log(action)
    if (action.key === 'new') {
      this.doc = _.cloneDeep(this.emptyDoc);
      this.editRow();
    } else if (action.key === 'edit') {
      this.doc = _.cloneDeep(action.record ? action.record as PRESS_CATEGORY_TYPE : this.emptyDoc);
      this.editRow();
    }
  }

  /*************************************************
   *
   * Edit
   *
   ************************************************/

  private editRow(): void {
    const dialogRef: MatDialogRef<PressCategoryComponent> = this.dialog.open(PressCategoryComponent, {
      width: '100%',
      height: '100%',
      data: this.doc
    });

    dialogRef.afterClosed().subscribe((doc: PRESS_CATEGORY_TYPE | null) => {
      console.log(doc);
    })
  }
}
