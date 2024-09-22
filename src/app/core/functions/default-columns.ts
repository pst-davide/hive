import {ALIGN_OPTIONS, ColumnModel, TYPE_OPTIONS} from '../model/column.model';
import {faEdit, faEye, faTrash} from '@fortawesome/free-solid-svg-icons';

export const COLUMN_VIEW: ColumnModel = {
  key: 'view',
  name: 'Dettaglio',
  hide: false,
  type: TYPE_OPTIONS.ICON,
  isFilterable: false,
  isSortable: false,
  align: ALIGN_OPTIONS.CENTER,
  stickyEnd: true,
  icon: faEye,
  isExportable: false,
};

export const COLUMN_EDIT: ColumnModel = {
  key: 'edit',
  name: 'Modifica',
  hide: false,
  type: TYPE_OPTIONS.ICON,
  isFilterable: false,
  isSortable: false,
  align: ALIGN_OPTIONS.CENTER,
  stickyEnd: true,
  icon: faEdit,
  isExportable: false,
};

export const COLUMN_DELETE: ColumnModel = {
  key: 'delete',
  name: 'Elimina',
  hide: false,
  type: TYPE_OPTIONS.ICON,
  isFilterable: false,
  isSortable: false,
  align: ALIGN_OPTIONS.CENTER,
  stickyEnd: true,
  icon: faTrash,
  isExportable: false,
};

export const COLUMN_ID: ColumnModel = {
  key: 'id',
  name: '#',
  hide: false,
  type: TYPE_OPTIONS.ID,
  align: ALIGN_OPTIONS.CENTER,
  isFilterable: false,
  isSortable: false,
  className: 'text-slate-400 max-w-28 w-28',
  isExportable: true,
};
