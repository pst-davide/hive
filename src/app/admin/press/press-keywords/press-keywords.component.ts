import {
  Component,
  EventEmitter,
  model,
  ModelSignal,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import _ from 'lodash';
import {EMPTY_PRESS_KEYWORD, PRESS_KEYWORD_TYPE} from '../model/press-keyword.model';
import {BehaviorSubject, Subscription, take} from 'rxjs';
import {ColumnModel} from '../../../core/model/column.model';
import {displayedColumns} from './press-keywords.table';
import {PressService} from '../service/press.service';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {TableTemplateComponent} from '../../../core/shared/table-template/table-template.component';
import {DeleteDialogComponent} from '../../../core/dialog/delete-dialog/delete-dialog.component';
import {PressCategoriesComponent} from '../press-categories/press-categories.component';
import {PressKeywordComponent} from './edit/press-keyword/press-keyword.component';
import {LoaderService} from '../../../core/services/loader.service';

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
  public doc: PRESS_KEYWORD_TYPE = _.cloneDeep(EMPTY_PRESS_KEYWORD);
  public emptyDoc: PRESS_KEYWORD_TYPE = _.cloneDeep(EMPTY_PRESS_KEYWORD);
  public deletedDoc: PRESS_KEYWORD_TYPE = _.cloneDeep(EMPTY_PRESS_KEYWORD);

  /* change keywords */
  @Output() keywordsChanged: EventEmitter<void> = new EventEmitter<void>();

  /****************************
   * table
   * *************************/
  public docs: PRESS_KEYWORD_TYPE[] = [];
  public dataSource: BehaviorSubject<PRESS_KEYWORD_TYPE[]> = new BehaviorSubject<PRESS_KEYWORD_TYPE[]>([]);

  /* filter */
  public filters: Record<string, string> = {};

  /* columns */
  public displayedColumns: ColumnModel[] = displayedColumns;

  private categoryIdUpdateSubscription!: Subscription;

  constructor(private crudService: PressService, public dialog: MatDialog,
              private parentComponent: PressCategoriesComponent, private loaderService: LoaderService) {
    this.categoryIdUpdateSubscription = this.parentComponent.categoryIdUpdateSubject
      .subscribe((newCategoryId: number | null) => {
      this.getCollection(newCategoryId);
    });
  }

  ngOnInit(): void {
    this.loaderService.setComponentLoader(PressKeywordComponent.name);
    this.getCollection(this.categoryId());
    this.loaderService.setComponentLoaded(PressKeywordComponent.name);
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
    this.crudService.getKeywordsDocs(id).pipe(take(1)).subscribe({
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
      this.deletedDoc = _.cloneDeep(action.record ? action.record as PRESS_KEYWORD_TYPE : this.emptyDoc);
      this.deleteRow();
    }
  }

  /*************************************************
   *
   * Edit
   *
   ************************************************/

  private editRow(): void {
    const dialogRef: MatDialogRef<PressKeywordComponent> = this.dialog.open(PressKeywordComponent, {
      width: '100%',
      height: '100%',
      data: {doc: this.doc, categoryId: this.categoryId()}
    });

    dialogRef.afterClosed().subscribe(async (doc: PRESS_KEYWORD_TYPE | null) => {

      if (doc) {
        this.loaderService.setComponentLoader(PressKeywordComponent.name);

        this.getCollection(this.categoryId());
        this.keywordsChanged.next();

        this.loaderService.setComponentLoaded(PressKeywordComponent.name);
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
        title: 'Cancellazione Parola Chiave',
        message: `Sei sicuro di voler eliminare la parola chiave <strong>${this.deletedDoc.word}</strong>?`
      }
    });

    dialogRef.afterClosed().subscribe(async (doc: boolean | null) => {
        if (doc) {
          this.loaderService.setComponentLoader(PressKeywordComponent.name);

          await this.crudService.deleteKeywordDoc(this.deletedDoc.id);
          this.getCollection(this.categoryId());
          this.keywordsChanged.next();

          this.loaderService.setComponentLoaded(PressKeywordComponent.name);
        }
    })
  }
}
