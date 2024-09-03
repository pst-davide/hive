import {Component, ViewChild} from '@angular/core';
import {FullCalendarModule} from '@fullcalendar/angular';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';

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
  @ViewChild('fileDropContainer', { static: true }) fileDropContainer!: CdkDragDrop<string[]>;
  files: string[] = [];

  public onDrop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.files, event.previousIndex, event.currentIndex);
  }
}
