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
}

export interface ColumnModel {
  key: string;
  name: string;
  type: typeof TYPE_OPTIONS[keyof typeof TYPE_OPTIONS];
  hide: boolean;
  search?: boolean;
  format?: string;
  align?: typeof ALIGN_OPTIONS[keyof typeof ALIGN_OPTIONS];
  isSortable?: boolean;
  selectable?: boolean; // is in selectable combo
  selectableName?: string; // name in the combo
  stickyEnd?: boolean;
}
