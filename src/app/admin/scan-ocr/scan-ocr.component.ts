import {Component} from '@angular/core';
import { UploadService } from 'app/core/services/upload.service';
import {UploadModel} from "../../core/model/upload.model";
import {TruncatePipe} from "../../core/pipe/truncate.pipe";
import {FaIconComponent, IconDefinition} from "@fortawesome/angular-fontawesome";
import {
  faFilePdf, faImage
} from '@fortawesome/free-solid-svg-icons';
import {catchError, of, tap} from 'rxjs';
import {OpenaiService} from '../../core/services/openai.service';

@Component({
  selector: 'app-scan-ocr',
  standalone: true,
  imports: [
    TruncatePipe,
    FaIconComponent
  ],
  templateUrl: './scan-ocr.component.html',
  styleUrl: './scan-ocr.component.scss'
})
export class ScanOcrComponent {

  public faImage: IconDefinition = faImage;
  public faPdf: IconDefinition = faFilePdf;

  public progress: UploadModel[] = [];
  public errorMessage: string = '';
  public successMessage: string = '';
  private allowedTypes: string[] = ['image/png', 'image/jpeg', 'application/pdf'];
  public uploadComplete: boolean[] = [];

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

  constructor(private uploadService: UploadService, private openAiService: OpenaiService) {}

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

  /*************************************************************************************************
   *
   * Upload
   *
   * **********************************************************************************************/

  public onFileChange(event: Event): void {
    const target: HTMLInputElement = event.target as HTMLInputElement;
    this.handleFileSelection(target.files);
  }

  public onDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      this.handleFileSelection(event.dataTransfer.files);
    }
  }

  public onDragOver(event: DragEvent): void {
    event.preventDefault(); // prevent default behavior (prevents file from being opened)
  }

  private handleFileSelection(files: FileList | null): void {
    if (files) {
      this.errorMessage = '';
      this.successMessage = '';
      this.progress = Array.from(files).map(file => ({
        progress: 0,
        fileName: file.name,
        fileSize: (file.size / 1024).toFixed(2),
        fileType: file.type,
        filePath: ''
      }));
      this.uploadComplete = Array(files.length).fill(false);

      if (this.validateFiles(files)) {
        this.uploadFiles(files);
      }
    }
  }

  private validateFiles(files: FileList): boolean {
    for (let i = 0; i < files.length; i++) {
      const file: File = files[i];
      const isValid: boolean = this.allowedTypes.includes(file.type);

      if (!isValid) {
        this.errorMessage += `File ${file.name} non valido. Tipi accettati: PNG, JPG, PDF.\n`;
        return false;
      }
    }
    return true;
  }

  private uploadFiles(files: FileList): void {
    for (let i = 0; i < files.length; i++) {
      const file: File = files[i];
      this.uploadFile(file, i);
    }
  }

  private uploadFile(file: File, index: number): void {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);

    this.uploadService.uploadFile(formData, file).subscribe({
      next: (value: UploadModel) => {
        this.progress[index].progress = value.progress;
        this.progress[index].fileName = value.fileName || file.name;
        this.progress[index].fileType = value.fileType || file.type;
        this.progress[index].filePath = value.filePath || '';
        this.progress[index].fileSize = value.fileSize || '';

        if (value.progress === 100) {
          this.successMessage += `Immagine ${file.name} caricata e riconosciuta con successo!\n`;
          this.uploadComplete[index] = true;
        }
      },
      error: (error) => {
        console.error('Errore nel caricamento dell\'immagine:', error);
        this.errorMessage += `Errore durante il caricamento dell'immagine ${file.name}.\n`;
      }
    });
  }

  public allUploadsCompleted(): boolean {
    return this.uploadComplete.every((complete: boolean) => complete);
  }

  public _openFile(url: string): void {
    window.open(url, '_blank');
  }

  private simulateProgress(file: File, index: number): void {
    let simulatedProgress = 0;
    const progressInterval = setInterval(() => {
      simulatedProgress += 10; // Incremento del progresso
      if (simulatedProgress > 100) {
        simulatedProgress = 100;
      }
      this.progress[index] = {progress: simulatedProgress, filePath: '', fileName: '', fileSize: '', fileType: ''};

      if (simulatedProgress === 100) {
        clearInterval(progressInterval);
        this.successMessage += `Immagine ${file.name} caricata e riconosciuta con successo!\n`;
        this.uploadComplete[index] = true;
      }
    }, 1000);
  }

}
