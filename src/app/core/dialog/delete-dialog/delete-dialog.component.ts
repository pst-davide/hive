import {AfterViewInit, Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import anime from 'animejs/lib/anime.es.js';

@Component({
  selector: 'app-delete-dialog',
  standalone: true,
  imports: [],
  templateUrl: './delete-dialog.component.html',
  styleUrl: './delete-dialog.component.scss'
})
export class DeleteDialogComponent implements OnInit, AfterViewInit {
  constructor(public dialogRef: MatDialogRef<DeleteDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: { title: string, message: string }) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    const deleteIcon = document.getElementById('delete-icon');

    anime({
      targets: '#delete-icon',
      scale: [
        {value: 0.2, duration: 0},
        {value: 1.2, duration: 300, easing: 'easeInOutQuad'},
        {value: 0.7, duration: 200, easing: 'easeInOutQuad'},
        {value: 1.3, duration: 200, easing: 'easeInOutQuad'},
        {value: 1, duration: 200, easing: 'easeInOutQuad'},
      ],
      opacity: [
        {value: 0, duration: 0},
        {value: 0.9, duration: 300, easing: 'easeInOutQuad'},
        {value: 0.6, duration: 200, easing: 'easeInOutQuad'},
        {value: 0.8, duration: 200, easing: 'easeInOutQuad'},
        {value: 1, duration: 200, easing: 'easeInOutQuad'},
      ],
      loop: 1
    });
  }

  public close(): void {
    this.dialogRef.close(false);
  }

  public confirmDelete(): void {
    this.dialogRef.close(true);
  }
}
