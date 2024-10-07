import {ALIGN_OPTIONS, ColumnModel, TYPE_OPTIONS} from '../../../core/model/column.model';
import {COLUMN_DELETE, COLUMN_EDIT, COLUMN_ID, COLUMN_VIEW} from '../../../core/functions/default-columns';

export const displayedColumns: ColumnModel[] = [
  COLUMN_ID,
  {
    key: 'name',
    name: 'Lista',
    hide: false,
    type: TYPE_OPTIONS.STRING,
    isFilterable: false,
    isSortable: true,
    isExportable: true,
  },
  {
    key: 'description',
    name: 'Descrizione',
    hide: true,
    type: TYPE_OPTIONS.TRUNCATE,
    isFilterable: true,
    isSortable: true,
    isExportable: true,
    isSelectable: true,
    truncateConfig: {length: 30, omission: '...', mode: 'words'}
  },
  {
    key: 'VIEW_OWNERS',
    name: 'Amministratori Lista',
    hide: false,
    type: TYPE_OPTIONS.STRING,
    isFilterable: false,
    isSortable: true,
    isExportable: true,
    isSelectable: true,
  },
  {
    key: 'VIEW_SUBSCRIBERS_COUNT',
    name: 'Nr. Iscritti',
    hide: false,
    type: TYPE_OPTIONS.NUMBER,
    align: ALIGN_OPTIONS.CENTER,
    isFilterable: false,
    isSortable: true,
    isExportable: true,
    isSelectable: true,
  },
  COLUMN_VIEW,
  COLUMN_EDIT,
  COLUMN_DELETE
];
