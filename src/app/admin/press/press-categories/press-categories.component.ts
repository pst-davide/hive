import {Component, model, ModelSignal, OnInit} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BehaviorSubject, Observable, Subject, take} from 'rxjs';
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
  public categoryIdUpdateSubject: Subject<number | null> = new Subject<number | null>();

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

  constructor(private crudService: PressService, public dialog: MatDialog, private loaderService: LoaderService,
              private router: Router) {}

  ngOnInit(): void {
    this.getCollection();
  }

  public isKeywordsRoute(): boolean {
    return this.router.url.includes('/press/categories/keywords');
  }

  /*************************************************
   *
   * Table
   *
   ************************************************/

  private getCollection(): void {
    this.crudService.getDocs().pipe(take(1)).subscribe({
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
      this.categoryId.set(-1);
      this.editRow();
      this.categoryIdUpdateSubject.next(this.categoryId());
    } else if (action.key === 'edit') {
      this.doc = _.cloneDeep(action.record ? action.record as PRESS_CATEGORY_TYPE : this.emptyDoc);
      this.categoryId.set(this.doc.id);
      this.editRow();
      this.categoryIdUpdateSubject.next(this.categoryId());
    } else if (action.key === 'view') {
      this.doc = _.cloneDeep(action.record ? action.record as PRESS_CATEGORY_TYPE : this.emptyDoc);
      this.categoryId.set(this.doc.id);
      this.categoryIdUpdateSubject.next(this.categoryId());
    } else if (action.key === 'delete') {
      this.deletedDoc = _.cloneDeep(action.record ? action.record as PRESS_CATEGORY_TYPE : this.emptyDoc);
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
      data: {
        title: 'Cancellazione Argomento',
        message: `Sei sicuro di voler eliminare l\'argomento <strong>${this.deletedDoc.name}</strong>?`
      }
    });

    dialogRef.afterClosed().subscribe(async (doc: boolean | null) => {
      if (doc) {
        if (this.deletedDoc.VIEW_KEYWORDS_COUNT && this.deletedDoc.VIEW_KEYWORDS_COUNT > 0) {
          // TODO notify
          return;
        }

        this.loaderService.setComponentLoader(PressCategoryComponent.name);
        await this.crudService.deleteDoc(this.deletedDoc.id);

        this.getCollection();
        this.categoryId.set(-1);
        this.categoryIdUpdateSubject.next(this.categoryId());

        this.loaderService.setComponentLoaded(PressCategoryComponent.name);
      }
    })
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

    await this.crudService.saveKeywordsBatch(result);
    this.getCollection();
    this.categoryIdUpdateSubject.next(this.categoryId());
  }

}
