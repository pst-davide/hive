import {IconDefinition} from '@fortawesome/angular-fontawesome';

export const ALIGN_OPTIONS = {
  LEFT: 'left',
  CENTER: 'center',
  RIGHT: 'right'
};


export const TYPE_OPTIONS = {
  STRING: 'string',
  ID: 'id',
  NUMBER: 'number',
  ICON: 'icon',
  COLOR: 'color',
}

export interface ColumnModel {
  key: string;
  name: string;
  type: typeof TYPE_OPTIONS[keyof typeof TYPE_OPTIONS];
  hide: boolean;
  format?: string;
  stickyEnd?: boolean;
  align?: typeof ALIGN_OPTIONS[keyof typeof ALIGN_OPTIONS];
  selectableName?: string;
  className?: string;
  icon?: IconDefinition;
  isSelectable?: boolean;
  isFilterable?: boolean;
  isSortable?: boolean;
  isExportable?: boolean;
}
