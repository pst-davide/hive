import {CrudModel, EMPTY_CRUD} from '../../../core/model/crud.model';

export interface ShiftModel {
  id: string | null;
  code: string | null;
  name: string | null;
  color: string | null;
  crud: CrudModel;
}

export const EMPTY_SHIFT: ShiftModel = {
  id: null,
  code: null,
  name: null,
  color: null,
  crud: EMPTY_CRUD
};
