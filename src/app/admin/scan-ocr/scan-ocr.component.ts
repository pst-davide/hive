import {Component} from '@angular/core';
import {FullCalendarModule} from '@fullcalendar/angular';
import { OcrService } from './service/ocr.service';
import { UploadService } from 'app/core/services/upload.service';

@Component({
  selector: 'app-scan-ocr',
  standalone: true,
  imports: [
    FullCalendarModule,
  ],
  templateUrl: './scan-ocr.component.html',
  styleUrl: './scan-ocr.component.scss'
})
export class ScanOcrComponent {

  selectedFiles: FileList | null = null;
  progress: number[] = [];
  errorMessage: string = '';
  successMessage: string = '';
  allowedTypes: string[] = ['image/png', 'image/jpeg', 'application/pdf'];

  constructor(private uploadService: UploadService) {}

  public onFileChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.selectedFiles = target.files;

    if (this.selectedFiles) {
      this.errorMessage = '';
      this.successMessage = '';
      this.progress = Array(this.selectedFiles.length).fill(0);

      if (this.validateFiles(this.selectedFiles)) {
        this.uploadFiles(this.selectedFiles);
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
      const file = files[i];
      this.uploadFile(file, i);
    }
  }

  private uploadFile(file: File, index: number): void {
    const formData = new FormData();
    formData.append('file', file, file.name);

    this.uploadService.uploadFile(formData).subscribe({
      next: (progress) => {
        this.progress[index] = progress;
        if (progress === 100) {
          this.successMessage += `Immagine ${file.name} caricata e riconosciuta con successo!\n`;
        }
      },
      error: (error) => {
        console.error('Errore nel caricamento dell\'immagine:', error);
        this.errorMessage += `Errore durante il caricamento dell'immagine ${file.name}.\n`;
      }
    });
  }

}
