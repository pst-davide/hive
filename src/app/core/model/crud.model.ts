export interface CrudModel {
  createdAt: Date | null;
  createBy: string | null;
  updatedAt: Date | null;
  modifiedBy: string | null;
}

export const EMPTY_CRUD: CrudModel = {
  createdAt: null,
  createBy: null,
  updatedAt: null,
  modifiedBy: null
};
