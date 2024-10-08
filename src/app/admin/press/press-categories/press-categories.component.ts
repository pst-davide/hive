import {Component, model, ModelSignal, OnInit} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BehaviorSubject, Observable} from 'rxjs';
import {PressService} from '../service/press.service';
import {TableTemplateComponent} from '../../../core/shared/table-template/table-template.component';
import {EMPTY_PRESS_CATEGORY, PRESS_CATEGORY_TYPE} from '../model/press-category.model';
import {ColumnModel} from '../../../core/model/column.model';
import _ from 'lodash';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {PressCategoryComponent} from './edit/press-category/press-category.component';
import {displayedColumns} from './press-categories.table';
import {DeleteDialogComponent} from '../../../core/dialog/delete-dialog/delete-dialog.component';
import {PressKeywordsComponent} from '../press-keywords/press-keywords.component';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {PRESS_KEYWORD_TYPE} from '../model/press-keyword.model';
import {EMPTY_CRUD} from '../../../core/model/crud.model';
import {LoaderService} from '../../../core/services/loader.service';
import {Router, RouterOutlet} from '@angular/router';

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
    ReactiveFormsModule,
    RouterOutlet
  ],
  templateUrl: './press-categories.component.html',
  styleUrl: './press-categories.component.scss'
})
export class PressCategoriesComponent implements OnInit {

  /* loading */
  public isLoading$!: Observable<boolean>;

  /* form control */
  public keywordsControl: FormControl<string | null> = new FormControl('');

  /* doc */
  public doc: PRESS_CATEGORY_TYPE = _.cloneDeep(EMPTY_PRESS_CATEGORY);
  public emptyDoc: PRESS_CATEGORY_TYPE = _.cloneDeep(EMPTY_PRESS_CATEGORY);
  public deletedDoc: PRESS_CATEGORY_TYPE = _.cloneDeep(EMPTY_PRESS_CATEGORY);

  /* category */
  public categoryId: ModelSignal<number | null> = model<number | null>(-1);
  public keysInserted: ModelSignal<boolean> = model<boolean>(false);

  /****************************
   * table
   * *************************/
  public docs: PRESS_CATEGORY_TYPE[] = [];
  public dataSource: BehaviorSubject<PRESS_CATEGORY_TYPE[]> = new BehaviorSubject<PRESS_CATEGORY_TYPE[]>([]);

  /* filter */
  public filters: Record<string, string> = {};

  /* columns */
  public displayedColumns: ColumnModel[] = displayedColumns;

  constructor(private crudService: PressService, public dialog: MatDialog, private loaderService: LoaderService,
              private router: Router) {
  }

  ngOnInit(): void {
    this._reloadCollection().then(() => {
    });
  }

  public isKeywordsRoute(): boolean {
    return this.router.url.includes('/press/categories/keywords');
  }

  /*************************************************
   *
   * Table
   *
   ************************************************/

  private async getCollection(): Promise<void> {
    try {
      this.docs = await this.crudService.getDocs();
      this.dataSource.next(this.docs);
    } catch (error) {
      console.error('Errore durante il caricamento dei documenti:', error);
    }
  }

  public _rowAction(action: { record: any; key: string }): void {
    if (action.key === 'new') {
      this.doc = _.cloneDeep(this.emptyDoc);
      this.categoryId.set(-1);
      this.editRow();
    } else if (action.key === 'edit') {
      this.doc = _.cloneDeep(action.record ? action.record as PRESS_CATEGORY_TYPE : this.emptyDoc);
      this.categoryId.set(this.doc.id);
      this.editRow();
    } else if (action.key === 'view') {
      this.doc = _.cloneDeep(action.record ? action.record as PRESS_CATEGORY_TYPE : this.emptyDoc);
      this.categoryId.set(this.doc.id);
    } else if (action.key === 'delete') {
      this.deletedDoc = _.cloneDeep(action.record ? action.record as PRESS_CATEGORY_TYPE : this.emptyDoc);
      this.deleteRow();
    }
  }

  public async _reloadCollection(): Promise<void> {
    try {
      this.loaderService.setComponentLoader(PressCategoryComponent.name);
      await this.getCollection();
    } finally {
      this.loaderService.setComponentLoaded(PressCategoryComponent.name);
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
        this._reloadCollection().then(() => {
        });
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
        title: 'Cancellazione Argomento',
        message: `Sei sicuro di voler eliminare l\'argomento <strong>${this.deletedDoc.name}</strong>?`
      }
    });

    dialogRef.afterClosed().subscribe(async (confirmed: boolean | null) => {
      if (confirmed && (!this.deletedDoc.VIEW_KEYWORDS_COUNT || this.deletedDoc.VIEW_KEYWORDS_COUNT === 0)) {
        this.loaderService.setComponentLoader(PressCategoryComponent.name);
        await this.crudService.deleteDoc(this.deletedDoc.id);
        await this.getCollection();
        this.categoryId.set(-1);
        this.loaderService.setComponentLoaded(PressCategoryComponent.name);
      }
    });
  }

  /*************************************************
   *
   * New Keywords
   *
   ************************************************/

  public async _transformKeywords(): Promise<void> {
    const keywordPattern = /#([hml])\s*([^#]+)/g;
    const input: string | null = this.keywordsControl.value;
    const result: PRESS_KEYWORD_TYPE[] = [];

    // Verifica se il testo contiene almeno uno dei tag richiesti
    if (!input || !/#([hml])/.test(input)) {
      console.error('Il testo non è conforme: deve includere #h, #m o l.');
      return;
    }

    let match: RegExpExecArray | null;

    while ((match = keywordPattern.exec(input)) !== null) {
      // Mappa h, m, l con valori high, medium, low
      const importanceMap: { [key: string]: string } = {'h': 'high', 'm': 'medium', 'l': 'low'};
      const importance: string = importanceMap[match[1]];
      const words: string[] = match[2].split(';').map((word: string) => word.trim());

      words.forEach((word: string) => {
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

    if (result.length === 0) {
      console.error('Il testo non contiene parole valide nel formato richiesto.');
      return;
    }

    this.loaderService.setComponentLoader(PressCategoryComponent.name);
    await this.crudService.saveKeywordsBatch(result);
    await this.getCollection();
    this.keysInserted.set(true);
    this.keywordsControl.setValue(null);
    this.loaderService.setComponentLoaded(PressCategoryComponent.name);
  }

}
