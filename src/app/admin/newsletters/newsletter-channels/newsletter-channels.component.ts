import {Component, model, ModelSignal, OnInit} from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import {TableTemplateComponent} from '../../../core/shared/table-template/table-template.component';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {LoaderService} from '../../../core/services/loader.service';
import {NewsletterService} from '../service/newsletter.service';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {EMPTY_NEWSLETTER_CHANNEL, NEWSLETTER_CHANNEL_TYPE} from '../model/newsletter.model';
import {ColumnModel} from '../../../core/model/column.model';
import {displayedColumns} from './newsletter-channels.table';
import _ from 'lodash';
import {PRESS_CATEGORY_TYPE} from '../../press/model/press-category.model';
import {DeleteDialogComponent} from '../../../core/dialog/delete-dialog/delete-dialog.component';
import {NewsletterChannelComponent} from './edit/newsletter-channel/newsletter-channel.component';
import {PressKeywordsComponent} from '../../press/press-keywords/press-keywords.component';
import {NewsletterSubscribersComponent} from '../newsletter-subscribers/newsletter-subscribers.component';

@Component({
  selector: 'app-newsletter-channels',
  standalone: true,
  imports: [
    RouterOutlet,
    TableTemplateComponent,
    PressKeywordsComponent,
    NewsletterSubscribersComponent
  ],
  templateUrl: './newsletter-channels.component.html',
  styleUrl: './newsletter-channels.component.scss'
})
export class NewsletterChannelsComponent implements OnInit {

  /* loading */
  public isLoading$!: Observable<boolean>;

  /* doc */
  public doc: NEWSLETTER_CHANNEL_TYPE = _.cloneDeep(EMPTY_NEWSLETTER_CHANNEL);
  public emptyDoc: NEWSLETTER_CHANNEL_TYPE = _.cloneDeep(EMPTY_NEWSLETTER_CHANNEL);
  public deletedDoc: NEWSLETTER_CHANNEL_TYPE = _.cloneDeep(EMPTY_NEWSLETTER_CHANNEL);

  /* channel */
  public channelId: ModelSignal<number | null> = model<number | null>(-1);
  public channelIdUpdateSubject: Subject<number | null> = new Subject<number | null>();

  /****************************
   * table
   * *************************/
  public docs: NEWSLETTER_CHANNEL_TYPE[] = [];
  public dataSource: BehaviorSubject<NEWSLETTER_CHANNEL_TYPE[]> = new BehaviorSubject<NEWSLETTER_CHANNEL_TYPE[]>([]);

  /* filter */
  public filters: Record<string, string> = {};

  /* columns */
  public displayedColumns: ColumnModel[] = displayedColumns;

  constructor(private crudService: NewsletterService, public dialog: MatDialog, private loaderService: LoaderService,
              private router: Router) {
  }

  ngOnInit(): void {
    this._reloadCollection().then(() => {
    });
  }

  public isUsersRoute(): boolean {
    return this.router.url.includes('/newsletters/channels/users');
  }

  /*************************************************
   *
   * Table
   *
   ************************************************/

  private async getCollection(): Promise<void> {
    try {
      this.docs = await this.crudService.getChannelDocs();
      this.dataSource.next(this.docs);
    } catch (error) {
      console.error('Errore durante il caricamento dei documenti:', error);
    }
  }

  public _rowAction(action: { record: any; key: string }): void {
    if (action.key === 'new') {
      this.doc = _.cloneDeep(this.emptyDoc);
      this.channelId.set(-1);
      this.editRow();
      this.channelIdUpdateSubject.next(this.channelId());
    } else if (action.key === 'edit') {
      this.doc = _.cloneDeep(action.record ? action.record as NEWSLETTER_CHANNEL_TYPE : this.emptyDoc);
      this.channelId.set(this.doc.id);
      this.editRow();
      this.channelIdUpdateSubject.next(this.channelId());
    } else if (action.key === 'view') {
      this.doc = _.cloneDeep(action.record ? action.record as NEWSLETTER_CHANNEL_TYPE : this.emptyDoc);
      this.channelId.set(this.doc.id);
      this.channelIdUpdateSubject.next(this.channelId());
    } else if (action.key === 'delete') {
      this.deletedDoc = _.cloneDeep(action.record ? action.record as NEWSLETTER_CHANNEL_TYPE : this.emptyDoc);
      this.deleteRow();
    }
  }

  public async _reloadCollection(): Promise<void> {
    try {
      this.loaderService.setComponentLoader(NewsletterChannelsComponent.name);
      await this.getCollection();
    } finally {
      this.loaderService.setComponentLoaded(NewsletterChannelsComponent.name);
    }
  }

  /*************************************************
   *
   * Edit
   *
   ************************************************/

  private editRow(): void {
    const dialogRef: MatDialogRef<NewsletterChannelComponent> = this.dialog.open(NewsletterChannelComponent, {
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
        title: 'Cancellazione Lista',
        message: `Sei sicuro di voler eliminare la lista <strong>${this.deletedDoc.name}</strong>?`
      }
    });

    dialogRef.afterClosed().subscribe(async (confirmed: boolean | null) => {
      if (confirmed && this.deletedDoc.id
        && (!this.deletedDoc.VIEW_SUBSCRIBERS_COUNT || this.deletedDoc.VIEW_SUBSCRIBERS_COUNT === 0)) {
        this.loaderService.setComponentLoader(NewsletterChannelsComponent.name);
        await this.crudService.deleteChannelDoc(this.deletedDoc.id);
        await this.getCollection();
        this.channelId.set(-1);
        this.channelIdUpdateSubject.next(this.channelId());
        this.loaderService.setComponentLoaded(NewsletterChannelsComponent.name);
      }
    });
  }
}
