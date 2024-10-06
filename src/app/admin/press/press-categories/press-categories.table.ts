import {ALIGN_OPTIONS, ColumnModel, TYPE_OPTIONS} from '../../../core/model/column.model';
import {COLUMN_DELETE, COLUMN_EDIT, COLUMN_ID, COLUMN_VIEW} from '../../../core/functions/default-columns';

export const displayedColumns: ColumnModel[] = [
  COLUMN_ID,
  {
    key: 'name',
    name: 'Argomento',
    hide: false,
    type: TYPE_OPTIONS.COLOR,
    isFilterable: false,
    isSortable: true,
    isExportable: true,
  },
  {
    key: 'VIEW_KEYWORDS_COUNT',
    name: 'Nr. Parole Chiave',
    hide: false,
    type: TYPE_OPTIONS.NUMBER,
    align: ALIGN_OPTIONS.CENTER,
    isFilterable: false,
    isSortable: true,
    isExportable: true,
  },
  COLUMN_VIEW,
  COLUMN_EDIT,
  COLUMN_DELETE
];
