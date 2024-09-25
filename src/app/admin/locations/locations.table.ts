import {ALIGN_OPTIONS, ColumnModel, TYPE_OPTIONS} from '../../core/model/column.model';
import {COLUMN_DELETE, COLUMN_EDIT, COLUMN_ID} from '../../core/functions/default-columns';
import {faLocationDot} from '@fortawesome/free-solid-svg-icons';

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
  {
    key: 'description',
    name: 'Descrizione',
    hide: false,
    type: TYPE_OPTIONS.TRUNCATE,
    isFilterable: true,
    isSortable: true,
    isExportable: true,
    truncateConfig: {length: 30, omission: '...', mode: 'words'}
  },
  {
    key: 'enabled',
    name: 'Attiva',
    hide: false,
    type: TYPE_OPTIONS.BOOLEAN,
    align: ALIGN_OPTIONS.CENTER,
    isFilterable: true,
    isSortable: true,
    isExportable: true,
  },
  {
    key: 'map',
    name: 'Mappa',
    hide: false,
    type: TYPE_OPTIONS.ICON,
    isFilterable: false,
    isSortable: false,
    isExportable: false,
    stickyEnd: true,
    icon: faLocationDot
  },
  COLUMN_EDIT,
  COLUMN_DELETE
];
