export interface CrudModel {
  createAt: Date | null;
  createBy: string | null;
  modifiedAt: Date | null;
  modifiedBy: string | null;
}

export const EMPTY_CRUD: CrudModel = {
  createAt: null,
  createBy: null,
  modifiedAt: null,
  modifiedBy: null
};