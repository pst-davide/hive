import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UserComponent } from './edit/user/user.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent {

  constructor(public dialog: MatDialog) {}
  
  public openDialog(): void {
    this.dialog.open(UserComponent, {
      width: '100%',
      height: '100%'
    });
  }
}
