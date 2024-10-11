import {ALIGN_OPTIONS, ColumnModel, TYPE_OPTIONS} from '../../core/model/column.model';
import {COLUMN_DELETE, COLUMN_EDIT, COLUMN_ID} from '../../core/functions/default-columns';

export const displayedColumns: ColumnModel[] = [
  COLUMN_ID,
  {
    key: 'code',
    name: 'Codice',
    hide: false,
    type: TYPE_OPTIONS.COLOR,
    align: ALIGN_OPTIONS.CENTER,
    isFilterable: true,
    isSortable: true,
    isExportable: true,
  },
  {
    key: 'name',
    name: 'Sede',
    hide: false,
    type: TYPE_OPTIONS.STRING,
    isFilterable: true,
    isSortable: true,
    isExportable: true,
  },
  COLUMN_EDIT,
  COLUMN_DELETE
];
