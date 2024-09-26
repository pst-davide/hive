import {Component, OnInit} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {EMPTY_LOCATION, LOCATION_TYPE, LocationModel} from './model/location.model';
import _ from 'lodash';
import {LocationService} from './service/location.service';
import {LocationComponent} from './edit/location/location.component';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatTableModule} from '@angular/material/table';
import {BehaviorSubject, catchError, of, Subject, takeUntil, tap} from 'rxjs';
import {AddressService, CityModel, ProvinceModel} from '../../core/services/address.service';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import 'animate.css';
import {MapComponent} from '../../core/dialog/map/map.component';
import {OpenaiService} from '../../core/services/openai.service';
import {TableTemplateComponent} from '../../core/shared/table-template/table-template.component';
import {ColumnModel} from '../../core/model/column.model';
import {displayedColumns} from './locations.table';
import {LoaderService} from '../../core/services/loader.service';
import {DeleteDialogComponent} from '../../core/dialog/delete-dialog/delete-dialog.component';


@Component({
  selector: 'app-locations',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatTableModule,
    FormsModule, ReactiveFormsModule, TableTemplateComponent],
  templateUrl: './locations.component.html',
  styleUrl: './locations.component.scss'
})
export class LocationsComponent implements OnInit {

  /* columns */
  public displayedColumns: ColumnModel[] = displayedColumns;

  /* table */
  public docs: LOCATION_TYPE[] = [];
  public dataSource: BehaviorSubject<LOCATION_TYPE[]> = new BehaviorSubject<LOCATION_TYPE[]>([]);

  /* filter */
  public filters: Record<string, any> = {
    code: '',
    name: '',
    description: '',
    enabled: 'Tutti'
  };

  /* doc */
  public doc: LOCATION_TYPE = _.cloneDeep(EMPTY_LOCATION);
  public emptyDoc: LOCATION_TYPE = _.cloneDeep(EMPTY_LOCATION);
  public deletedDoc: LOCATION_TYPE = _.cloneDeep(EMPTY_LOCATION);

  /* cities */
  public cities: CityModel[] = [];

  /* provinces */
  public provinces: ProvinceModel[] = [];

  /* Subject */
  private destroy$: Subject<void> = new Subject<void>();

  private userMessage: string = '';

  private text: string = "Luna Rossa ko: American Magic accorcia ed è 4-1. Poco vento, il match point slitta a mercoledì\n" +
    "\n" +
    "La quinta regata sorride ai newyorkesi che riaprono la semifinale: decisivo l'ingresso al quarto gate con la barca italiana che perde il volo e si ferma\n" +
    "\n" +
    "Nulla da fare. Luna Rossa fallisce il primo match point di giornata e rimanda al secondo la possibilità di raggiungere la finale di Louis Vuitton Cup. I fantastici 8 del team Prada Pirelli – Bruni e Spithill timonieri, Molineris e Tesei trimmer, Voltolini, Gabbia, Liuzzi e Rosetti cyclor – non sono riusciti a capitalizzare i primi due lati di regata condotti con un discreto vantaggio (17”). Dal 3° lato American Magic ha ingaggiato un testa a testa che ha pagato. La seconda bolina è stata condotta praticamente alle pari con i due challenger che si sono alternati al comando prima della manovra che ha compromesso il quinto round della semifinale tra Luna Rossa e American Magic.\n" +
    "\n" +
    "Al termine della seconda poppa, con mure a dritta e quindi il diritto di precedenza, la barca italiana ha cercato di virare sulla boa “sopra” al team statunitense. Ma l’azzardo non ha pagato perché il team del New York Yacht Club non ha commesso infrazioni (ovvero non è andata nel diamante di manovra italiano) mentre Prada Pirelli è caduta dai foil regalando il successo ad American Magic. Errori in manovra che si erano già palesati nel terzo lato – il secondo di bolina – con Luna Rossa per due volte penalizzata per violazione del diamante a un incrocio.\n" +
    "\n" +
    "IL COMMENTO—  “Abbiamo fatto qualche errore ma non c’è nulla di compromesso” l’analisi dopo il ko di Checco Bruni, timoniere di Luna Rossa.\n" +
    "rinvio a mercoledì—  C'è pochissimo vento a Barcellona e la giornata si chiude qui (il campo di regata è considerato praticabile sono fino alle 17.30). Si torna in acqua mercoledì. ";
  chatMessages: { sender: string, message: string }[] = [];

  constructor(private crudService: LocationService, public dialog: MatDialog, private addressService: AddressService,
              private openAiService: OpenaiService, private loaderService: LoaderService) {
  }

  ngOnInit(): void {
    this.loaderService.setComponentLoader(LocationsComponent.name);
    this.getCities();
    this.getProvinces();
    this.getCollection().then(() => {});
    this.loaderService.setComponentLoaded(LocationsComponent.name);

    // this.analyzeText();
  }
  private analyzeText(): void {
    this.openAiService.analyzeText(this.text, [
      {word: 'Serie A', category: 'calcio', importance:'low'},
      {word: 'Champions League', category: 'calcio', importance:'low'},
      {word: 'Inter', category: 'calcio', importance:'high'},
      {word: 'Luna rossa', category: 'vela', importance:'high'},
      {word: 'America\'s Cup', category: 'vela', importance:'high'},
      {word: 'Bruni', category: 'vela', importance:'medium'},
      {word: 'Ferrari', category: 'motori', importance:'high'},
      {word: 'F1', category: 'motori', importance:'medium'},
    ]).subscribe(
      (response) => {
        console.log(response.analysis);
      },
      (error) => {
        console.error('Errore durante l\'analisi:', error);
      }
    );
  }

  private sendMessage(): void {
    this.openAiService.sendMessage(this.userMessage)
    .pipe(
      tap((response) => {
        console.log('Risposta dal server:', response);
        this.chatMessages.push({ sender: 'Bot', message: response.message });
      }),
      catchError((error) => {
        this.chatMessages.push({ sender: 'Bot', message: 'Errore: Impossibile ottenere una risposta.' });
        return of();  // Evita l'errore e ritorna un observable vuoto
      })
    )
    .subscribe();

    this.userMessage = '';
  }

  /*************************************************
   *
   * Table
   *
   ************************************************/

  private mapDoc(doc: LocationModel): LOCATION_TYPE {
    const city: string | null = this.findCity(doc.address?.city ?? null);
    const province: string | null = this.findProvince(doc.address?.province ?? null);

    return {
      ...doc,
      VIEW_STREET: doc.address?.street ?? null,
      VIEW_ZIP: doc.address?.zip ?? null,
      VIEW_CITY: city,
      VIEW_PROVINCE: province
    } as LOCATION_TYPE;
  }

  private async getCollection(): Promise<void> {
    try {
      const docs: LocationModel[] = await this.crudService.getDocs();
      this.docs = docs.map((doc: LocationModel) => this.mapDoc(doc));
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
      this.doc = _.cloneDeep(action.record ? action.record as LOCATION_TYPE : this.emptyDoc);
      this.editRow();
    } else if (action.key === 'map') {
      this.doc = _.cloneDeep(action.record ? action.record as LOCATION_TYPE : this.emptyDoc);
      this.openMap(this.doc);
    } else if (action.key === 'delete') {
      this.deletedDoc = _.cloneDeep(action.record ? action.record as LOCATION_TYPE : this.emptyDoc);
      this.deleteRow();
    }
  }

  /*************************************************
   *
   * Edit
   *
   ************************************************/

  public editRow(): void {
    let dialogRef: MatDialogRef<LocationComponent> = this.dialog.open(LocationComponent, {
      width: '100%',
      height: '100%',
      data: this.doc
    });

    dialogRef.afterClosed().subscribe((doc: LOCATION_TYPE | null) => {
      if (doc) {
        this.loaderService.setComponentLoader(LocationsComponent.name);
        this.getCollection();
        this.loaderService.setComponentLoaded(LocationsComponent.name);
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
        message: `Sei sicuro di voler eliminare la sede <strong>${this.deletedDoc.name}</strong>?`
      }
    });

    dialogRef.afterClosed().subscribe(async (doc: boolean | null) => {
      if (doc) {
        this.loaderService.setComponentLoader(LocationsComponent.name);

        await this.crudService.deleteDoc(this.deletedDoc.id as string);
        await this.getCollection();

        this.loaderService.setComponentLoaded(LocationsComponent.name);
      }
    })
  }

  /*************************************************
   *
   * Cities
   *
   ************************************************/

  private getCities(): void {
    this.addressService.getCities().pipe(takeUntil(this.destroy$)).subscribe(city => {
      this.cities = city.city ?? [];
    });
  }

  private findCity(istat: string | null): string | null {
    if (!istat) {
      return null;
    }
    const city: CityModel | null = this.cities.find((city: CityModel) => city.istat === istat) ?? null;
    return city ? city.comune : null;
  }

  /*************************************************
   *
   * Provinces
   *
   ************************************************/

  private getProvinces(): void {
    this.addressService.getProvincies().pipe(takeUntil(this.destroy$)).subscribe(province => {
      this.provinces = province.province ?? [];
    });
  }

  private findProvince(sigla: string | null): string | null {
    if (!sigla) {
      return null;
    }
    const province: ProvinceModel | null = this.provinces.find((province: ProvinceModel) => province.sigla === sigla) ?? null;
    return province ? province.provincia : null;
  }

  /*************************************************
   *
   * Map
   *
   ************************************************/

  private openMap(doc: LOCATION_TYPE): void {
    const {street = null, province = '', city = null} = doc.address;

    if (street && city) {
      const address: string = `${street} ${this.findCity(city)} ${province}`;

      this.dialog.open(MapComponent, {
        width: '100%',
        height: '100%',
        data: {address: doc.address, title: address}
      });
    }

  }

}
