import {CrudModel, EMPTY_CRUD} from '../../../core/model/crud.model';

export interface PressCategoryModel {
  id: number;
  name: string | null;
  color: string | null;
  crud: CrudModel;
}

export type PRESS_CATEGORY_TYPE = PressCategoryModel & {
  VIEW_KEYWORDS?: string | null;
};


export const EMPTY_PRESS_CATEGORY: PRESS_CATEGORY_TYPE = {
  id: 0,
  name: null,
  color: null,
  crud: EMPTY_CRUD
}
