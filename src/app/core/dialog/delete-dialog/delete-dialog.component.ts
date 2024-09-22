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
              @Inject(MAT_DIALOG_DATA) public data: { message: string }) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    const deleteIcon = document.getElementById('delete-icon');

    anime({
      targets: '#delete-icon',
      keyframes: [
        {translateX: -10, rotate: '-3deg'},
        {translateX: 10, rotate: '3deg'},
        {translateX: -10, rotate: '-3deg'},
        {translateX: 10, rotate: '3deg'},
        {translateX: 0, rotate: '0deg'}
      ],
      easing: 'easeInOutQuad',
      duration: 500,
      loop: 2
    });
  }
}
