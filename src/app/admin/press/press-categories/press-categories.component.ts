import {Component, model, ModelSignal, OnInit} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BehaviorSubject} from "rxjs";
import {PressService} from "../service/press.service";
import {TableTemplateComponent} from '../../../core/shared/table-template/table-template.component';
import {EMPTY_PRESS_CATEGORY, PRESS_CATEGORY_TYPE} from '../model/press-category.model';
import {ColumnModel} from '../../../core/model/column.model';
import _ from 'lodash';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {PressCategoryComponent} from './edit/press-category/press-category.component';
import {displayedColumns} from './press-categories.table';
import {DeleteDialogComponent} from '../../../core/dialog/delete-dialog/delete-dialog.component';
import {SM_DIALOG_HEIGHT, SM_DIALOG_WIDTH} from '../../../core/functions/environments';
import {PressKeywordsComponent} from '../press-keywords/press-keywords.component';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {PRESS_KEYWORD_TYPE} from '../model/press-keyword.model';
import {EMPTY_CRUD} from '../../../core/model/crud.model';

@Component({
  selector: 'app-press-categories',
  standalone: true,
  imports: [
    TableTemplateComponent,
    PressKeywordsComponent,
    FormsModule,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule
  ],
  templateUrl: './press-categories.component.html',
  styleUrl: './press-categories.component.scss'
})
export class PressCategoriesComponent implements OnInit {

  /* form control */
  public keywordsControl: FormControl<string | null> = new FormControl('');

  /* doc */
  public doc: PRESS_CATEGORY_TYPE = _.cloneDeep(EMPTY_PRESS_CATEGORY);
  public emptyDoc: PRESS_CATEGORY_TYPE = _.cloneDeep(EMPTY_PRESS_CATEGORY);

  /* category */
  public categoryId: ModelSignal<number | null> = model<number | null>(-1);

  /****************************
   * table
   * *************************/
  public docs: PRESS_CATEGORY_TYPE[] = [];
  public dataSource: BehaviorSubject<PRESS_CATEGORY_TYPE[]> = new BehaviorSubject<PRESS_CATEGORY_TYPE[]>([]);

  /* filter */
  public filters: Record<string, string> = {};
  public filterForm: FormGroup = new FormGroup({name: new FormControl('')});

  /* columns */
  public displayedColumns: ColumnModel[] = displayedColumns;

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

  private getCollection(): void {
    this.crudService.getDocs().subscribe({
      next: (data: PRESS_CATEGORY_TYPE[]) => {
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
      this.doc = _.cloneDeep(action.record ? action.record as PRESS_CATEGORY_TYPE : this.emptyDoc);
      this.editRow();
    } else if (action.key === 'view') {
      this.doc = _.cloneDeep(action.record ? action.record as PRESS_CATEGORY_TYPE : this.emptyDoc);
      this.categoryId.set(this.doc.id);
    } else if (action.key === 'delete') {
      this.doc = _.cloneDeep(action.record ? action.record as PRESS_CATEGORY_TYPE : this.emptyDoc);
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

  /*************************************************
   *
   * New Keywords
   *
   ************************************************/

  public _transformKeywords(): void {

    const keywordPattern = /#(high|medium|low)#\s*([^#]+)/g;
    const input: string | null = this.keywordsControl.value;
    const result: PRESS_KEYWORD_TYPE[] = [];
    let match: RegExpExecArray | null;

    if (input) {
      while ((match = keywordPattern.exec(input)) !== null) {
      const importance: string = match[1];  // high, medium, low
      const words: string[] = match[2].split(';').map((word: string) => word.trim()); // Separiamo le parole

      words.forEach(word => {
        if (word) {
          const keywordModel: PRESS_KEYWORD_TYPE = {
            id: 0,
            word: word || null,
            category: this.categoryId(),
            importance: importance,
            crud: _.cloneDeep(EMPTY_CRUD)
          };
          result.push(keywordModel);
        }
      });
    }
    }

    console.log(result);
  }
}
