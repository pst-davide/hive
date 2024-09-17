import {Component, input, InputSignal, model, ModelSignal} from '@angular/core';
import {TableTemplateComponent} from '../../core/shared/table-template/table-template.component';
import {FormControl, FormGroup} from "@angular/forms";
import {ALIGN_OPTIONS, ColumnModel, TYPE_OPTIONS} from "../../core/model/column.model";

@Component({
  selector: 'app-press-categories',
  standalone: true,
  imports: [
    TableTemplateComponent
  ],
  templateUrl: './press-categories.component.html',
  styleUrl: './press-categories.component.scss'
})
export class PressCategoriesComponent {

  public dataSourceInput: InputSignal<any> = input([{id: 1, name: 'ciao', modify: '', delete: ''}]);
  public dataSourceModel: ModelSignal<any> = model([{id: 1, name: 'ciao', modify: '', delete: ''}]);
  public dataSource: any =[{id: 1, name: 'ciao', modify: '', delete: ''}];
  /****************************
   * table
   * *************************/

  // filter
  public filters: Record<string, string> = {};
  public filterForm: FormGroup = new FormGroup({name: new FormControl('')});

  // columns
  public displayedColumns: ColumnModel[] = [
    {
      key: 'id',
      name: '#',
      hide: false,
      type: TYPE_OPTIONS.ID,
      align: ALIGN_OPTIONS.CENTER,
      search: false,
      isSortable: false
    },
    {
      key: 'name',
      name: 'Categoria',
      hide: false,
      type: TYPE_OPTIONS.STRING,
      search: false,
      isSortable: true
    },
    {
      key: 'edit',
      name: 'Modifica',
      hide: false,
      type: TYPE_OPTIONS.STRING,
      search: false,
      isSortable: false,
      align: ALIGN_OPTIONS.CENTER,
      stickyEnd: true,
    },
    {
      key: 'delete',
      name: 'Elimina',
      hide: false,
      type: TYPE_OPTIONS.STRING,
      search: false,
      isSortable: false,
      align: ALIGN_OPTIONS.CENTER,
      stickyEnd: true,
    }
  ];
}
