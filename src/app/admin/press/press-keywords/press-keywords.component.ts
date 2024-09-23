import {Component, model, ModelSignal, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {PRESS_CATEGORY_TYPE} from '../model/press-category.model';
import _ from 'lodash';
import {EMPTY_PRESS_KEYWORD_TYPE, PRESS_KEYWORD_TYPE} from '../model/press-keyword.model';
import {BehaviorSubject, Subscription} from 'rxjs';
import {FormControl, FormGroup} from '@angular/forms';
import {ColumnModel} from '../../../core/model/column.model';
import {displayedColumns} from './press-keywords.table';
import {PressService} from '../service/press.service';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {TableTemplateComponent} from '../../../core/shared/table-template/table-template.component';
import {SM_DIALOG_HEIGHT, SM_DIALOG_WIDTH} from '../../../core/functions/environments';
import {DeleteDialogComponent} from '../../../core/dialog/delete-dialog/delete-dialog.component';
import {PressCategoryComponent} from '../press-categories/edit/press-category/press-category.component';
import {PressCategoriesComponent} from '../press-categories/press-categories.component';

@Component({
  selector: 'app-press-keywords',
  standalone: true,
  imports: [
    TableTemplateComponent
  ],
  templateUrl: './press-keywords.component.html',
  styleUrl: './press-keywords.component.scss'
})
export class PressKeywordsComponent implements OnInit, OnDestroy {

  /* category */
  public categoryId: ModelSignal<number | null> = model<number | null>(null);

  /* doc */
  public doc: PRESS_KEYWORD_TYPE = _.cloneDeep(EMPTY_PRESS_KEYWORD_TYPE);
  public emptyDoc: PRESS_KEYWORD_TYPE = _.cloneDeep(EMPTY_PRESS_KEYWORD_TYPE);

  /****************************
   * table
   * *************************/
  public docs: PRESS_KEYWORD_TYPE[] = [];
  public dataSource: BehaviorSubject<PRESS_KEYWORD_TYPE[]> = new BehaviorSubject<PRESS_KEYWORD_TYPE[]>([]);

  /* filter */
  public filters: Record<string, string> = {};
  public filterForm: FormGroup = new FormGroup({name: new FormControl('')});

  /* columns */
  public displayedColumns: ColumnModel[] = displayedColumns;

  private categoryIdUpdateSubscription!: Subscription;

  constructor(private crudService: PressService, public dialog: MatDialog,
              private parentComponent: PressCategoriesComponent) {
    this.categoryIdUpdateSubscription = this.parentComponent.categoryIdUpdateSubject
      .subscribe((newCategoryId: number | null) => {
      this.getCollection(newCategoryId);
    });
  }

  ngOnInit(): void {
    this.getCollection(this.categoryId());
  }

  ngOnDestroy() {
    this.categoryIdUpdateSubscription.unsubscribe();
  }

  /*************************************************
   *
   * Table
   *
   ************************************************/

  private getCollection(id: number | null = null): void {
    this.crudService.getKeywordsDocs(id).subscribe({
      next: (data: PRESS_KEYWORD_TYPE[]) => {
        this.docs = data;
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
    if (action.key === 'new') {
      this.doc = _.cloneDeep(this.emptyDoc);
      this.editRow();
    } else if (action.key === 'edit') {
      this.doc = _.cloneDeep(action.record ? action.record as PRESS_KEYWORD_TYPE : this.emptyDoc);
      this.editRow();
    } else if (action.key === 'view') {
      this.doc = _.cloneDeep(action.record ? action.record as PRESS_KEYWORD_TYPE : this.emptyDoc);
    } else if (action.key === 'delete') {
      this.doc = _.cloneDeep(action.record ? action.record as PRESS_KEYWORD_TYPE : this.emptyDoc);
      this.deleteRow();
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

    dialogRef.afterClosed().subscribe(async (doc: PRESS_CATEGORY_TYPE | null) => {

      if (doc) {
        this.getCollection();
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
      width: SM_DIALOG_WIDTH,
      height: SM_DIALOG_HEIGHT,
      data: {message: ''}
    });

    dialogRef.afterClosed().subscribe(async (doc: boolean | null) => {

    })
  }
}
