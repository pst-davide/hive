import {ALIGN_OPTIONS, ColumnModel, TYPE_OPTIONS} from '../core/model/column.model';
import {COLUMN_DELETE, COLUMN_EDIT, COLUMN_ID} from '../core/functions/default-columns';

export const displayedColumns: ColumnModel[] = [
  COLUMN_ID,
  {
    key: 'lastname',
    name: 'Cognome',
    hide: false,
    type: TYPE_OPTIONS.STRING,
    isFilterable: true,
    isSortable: true,
    isExportable: true,
  },
  {
    key: 'name',
    name: 'Nome',
    hide: false,
    type: TYPE_OPTIONS.STRING,
    isFilterable: true,
    isSortable: true,
    isExportable: true,
  },
  {
    key: 'email',
    name: 'Email',
    hide: false,
    type: TYPE_OPTIONS.STRING,
    isFilterable: true,
    isSortable: true,
    isExportable: true,
    isSelectable: true,
  },
  {
    key: 'phone',
    name: 'Telefono',
    hide: true,
    type: TYPE_OPTIONS.STRING,
    isFilterable: true,
    isSortable: true,
    isExportable: true,
    isSelectable: true,
  },
  {
    key: 'cf',
    name: 'Codice Fiscale',
    hide: true,
    type: TYPE_OPTIONS.STRING,
    isFilterable: true,
    isSortable: true,
    isExportable: true,
    isSelectable: true,
  },
  {
    key: 'enabled',
    name: 'Attivo',
    hide: false,
    type: TYPE_OPTIONS.BOOLEAN,
    align: ALIGN_OPTIONS.CENTER,
    isFilterable: true,
    isSortable: true,
    isExportable: true,
    isSelectable: true,
  },
  COLUMN_EDIT,
  COLUMN_DELETE
];
