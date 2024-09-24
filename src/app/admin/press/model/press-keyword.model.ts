import {CrudModel, EMPTY_CRUD} from '../../../core/model/crud.model';

export interface PressKeywordModel {
  id: number;
  word: string | null;
  category: number | null;
  importance: string | null;
  crud: CrudModel;
}

export type PRESS_KEYWORD_TYPE = PressKeywordModel & {
  VIEW_CATEGORY?: string | null;
  VIEW_COLOR?: string | null;
  VIEW_IMPORTANCE?: string | null;
  VIEW_CATEGORY_NAME?: string | null;
  VIEW_CATEGORY_COLOR?: string | null;
}

export const EMPTY_PRESS_KEYWORD: PRESS_KEYWORD_TYPE = {
  id: 0,
  word: null,
  category: null,
  importance: null,
  crud: EMPTY_CRUD
}

export const IMPORTANCE_BADGE: {id: string; label: string; color: string}[] = [
  {id: 'high', label: 'Alta', color: '#ef5350'},
  {id: 'medium', label: 'Media', color: '#ffd54f'},
  {id: 'low', label: 'Bassa', color: '#9ccc65'}
];
