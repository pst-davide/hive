import {ALIGN_OPTIONS, ColumnModel, TYPE_OPTIONS} from '../../../core/model/column.model';
import {COLUMN_DELETE, COLUMN_EDIT, COLUMN_ID} from '../../../core/functions/default-columns';

export const displayedColumns: ColumnModel[] = [
  COLUMN_ID,
  {
    key: 'VIEW_CATEGORY_NAME',
    name: 'Argomento',
    hide: false,
    type: TYPE_OPTIONS.STRING,
    isFilterable: false,
    isSortable: true,
    isExportable: true,
  },
  {
    key: 'word',
    name: 'Parola Chiave',
    hide: false,
    type: TYPE_OPTIONS.STRING,
    isFilterable: false,
    isSortable: true,
    isExportable: true,
  },
  {
    key: 'VIEW_IMPORTANCE',
    name: 'Importanza',
    hide: false,
    type: TYPE_OPTIONS.BADGE,
    align: ALIGN_OPTIONS.CENTER,
    isFilterable: false,
    isSortable: true,
    isExportable: true,
    dependency: 'VIEW_COLOR',
  },
  {
    key: 'VIEW_COLOR',
    name: 'Colore',
    hide: true,
    type: TYPE_OPTIONS.STRING,
    isFilterable: false,
    isSortable: false,
    isExportable: false,
  },
  COLUMN_EDIT,
  COLUMN_DELETE
];
