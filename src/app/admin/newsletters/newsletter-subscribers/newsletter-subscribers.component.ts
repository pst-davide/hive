import {Component, EventEmitter, model, ModelSignal, OnDestroy, OnInit, Output} from '@angular/core';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import _ from 'lodash';
import {EMPTY_NEWSLETTER_SUBSCRIBER, NEWSLETTER_SUBSCRIBERS_TYPE} from '../model/newsletter.model';
import {LoaderService} from '../../../core/services/loader.service';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {NewsletterChannelsComponent} from '../newsletter-channels/newsletter-channels.component';
import {DeleteDialogComponent} from '../../../core/dialog/delete-dialog/delete-dialog.component';
import {NewsletterService} from '../service/newsletter.service';
import {ColumnModel} from '../../../core/model/column.model';
import {displayedColumns} from './newsletter-subscribers.table';
import {TableTemplateComponent} from '../../../core/shared/table-template/table-template.component';

@Component({
  selector: 'app-newsletter-subscribers',
  standalone: true,
  imports: [
    TableTemplateComponent
  ],
  templateUrl: './newsletter-subscribers.component.html',
  styleUrl: './newsletter-subscribers.component.scss'
})
export class NewsletterSubscribersComponent implements OnInit, OnDestroy {

  /* loading */
  public isLoading$!: Observable<boolean>;

  /* channel */
  public channelId: ModelSignal<number | null> = model<number | null>(-1);

  /* doc */
  public doc: NEWSLETTER_SUBSCRIBERS_TYPE = _.cloneDeep(EMPTY_NEWSLETTER_SUBSCRIBER);
  public emptyDoc: NEWSLETTER_SUBSCRIBERS_TYPE = _.cloneDeep(EMPTY_NEWSLETTER_SUBSCRIBER);
  public deletedDoc: NEWSLETTER_SUBSCRIBERS_TYPE = _.cloneDeep(EMPTY_NEWSLETTER_SUBSCRIBER);

  /* columns */
  public displayedColumns: ColumnModel[] = displayedColumns;

  /* change subscribers */
  @Output() subscriberChanged: EventEmitter<void> = new EventEmitter<void>();

  /****************************
   * table
   * *************************/
  public docs: NEWSLETTER_SUBSCRIBERS_TYPE[] = [];
  public dataSource: BehaviorSubject<NEWSLETTER_SUBSCRIBERS_TYPE[]> = new BehaviorSubject<NEWSLETTER_SUBSCRIBERS_TYPE[]>([]);

  /* filter */
  public filters: Record<string, string> = {};

  /* subscription */
  private channelIdUpdateSubscription!: Subscription;

  constructor(private loaderService: LoaderService,  public dialog: MatDialog,
              private parentComponent: NewsletterChannelsComponent, private crudService: NewsletterService) {
    this.channelIdUpdateSubscription = this.parentComponent.channelIdUpdateSubject
      .subscribe((newCategoryId: number | null) => {
        this.getCollection(newCategoryId).then(() => {
        });
      });
  }

  ngOnInit(): void {
    this._reloadCollection().then(() => {
    });
  }

  ngOnDestroy() {
    this.channelIdUpdateSubscription.unsubscribe();
  }

  /*************************************************
   *
   * Table
   *
   ************************************************/

  private async getCollection(id: number | null = null): Promise<void> {
    try {
      this.docs = await this.crudService.getSubscriptionsDocs(id);
      this.dataSource.next(this.docs);
    } catch (error) {
      console.error('Errore durante il caricamento dei documenti:', error);
    }
  }

  public _rowAction(action: { record: any; key: string }): void {
    if (action.key === 'new') {
      this.doc = _.cloneDeep(this.emptyDoc);
      this.editRow();
    } else if (action.key === 'edit') {
      this.doc = _.cloneDeep(action.record ? action.record as NEWSLETTER_SUBSCRIBERS_TYPE : this.emptyDoc);
      this.editRow();
    } else if (action.key === 'view') {
      this.doc = _.cloneDeep(action.record ? action.record as NEWSLETTER_SUBSCRIBERS_TYPE : this.emptyDoc);
    } else if (action.key === 'delete') {
      this.deletedDoc = _.cloneDeep(action.record ? action.record as NEWSLETTER_SUBSCRIBERS_TYPE : this.emptyDoc);
      this.deleteRow();
    }
  }

  public async _reloadCollection(): Promise<void> {
    try {
      this.loaderService.setComponentLoader(NewsletterSubscribersComponent.name);
      await this.getCollection(this.channelId());
    } finally {
      this.loaderService.setComponentLoaded(NewsletterSubscribersComponent.name);
    }
  }

  /*************************************************
   *
   * Edit
   *
   ************************************************/

  private editRow(): void {

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
        message: `Sei sicuro di voler eliminare l\iscrizione di <strong>${this.deletedDoc.userId}</strong>?`
      }
    });

    dialogRef.afterClosed().subscribe(async (del: boolean | null) => {
      if (del && this.deletedDoc.id) {
        this.loaderService.setComponentLoader(NewsletterSubscribersComponent.name);

        await this.crudService.deleteSubscriptionDoc(this.deletedDoc.id);
        await this.getCollection(this.channelId());
        this.subscriberChanged.next();

        this.loaderService.setComponentLoaded(NewsletterSubscribersComponent.name);
      }
    })
  }

}
