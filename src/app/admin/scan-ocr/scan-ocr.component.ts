import {Component} from '@angular/core';
import { UploadService } from 'app/core/services/upload.service';
import {UploadModel} from "../../core/model/upload.model";
import {TruncatePipe} from "../../core/pipe/truncate.pipe";
import {FaIconComponent, IconDefinition} from "@fortawesome/angular-fontawesome";
import {
  faFilePdf, faImage
} from '@fortawesome/free-solid-svg-icons';

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

  constructor(private uploadService: UploadService) {}

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
