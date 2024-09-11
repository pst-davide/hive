import {Component, OnInit, ViewChild} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import { EMPTY_LOCATION, LocationModel } from './model/location.model';
import _ from 'lodash';
import { LocationService } from './service/location.service';
import { LocationComponent } from './edit/location/location.component';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';

@Component({
  selector: 'app-locations',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule],
  templateUrl: './locations.component.html',
  styleUrl: './locations.component.scss'
})
export class LocationsComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'progress', 'fruit'];
  dataSource!: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  public doc: LocationModel = _.cloneDeep(EMPTY_LOCATION);
  public docs: LocationModel[] = [];

  constructor(private crudService: LocationService, public dialog: MatDialog) {}

  ngOnInit(): void {
      this.getCollection();
  }

  private getCollection(): void {
    this.crudService.getDocs().subscribe({
      next: (data: LocationModel[]) => {
        this.docs = data;
        console.log(data);
      },
      error: (error) => {
        console.error('Errore durante il recupero dei documenti:', error);
      },
      complete: () => {
        console.log('Recupero documenti completato');
      }
    });
  }

  public openDialog(doc: LocationModel): void {

    let dialogRef: MatDialogRef<LocationComponent> = this.dialog.open(LocationComponent, {
      width: '100%',
      height: '100%',
      data: doc
    });

    dialogRef.afterClosed().subscribe((doc: LocationModel | null) => {
      console.log(doc);
    })
  }

}
