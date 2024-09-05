import { AddressModel, EMPTY_ADDRESS } from "app/core/model/address.model";
import { CrudModel, EMPTY_CRUD } from "app/core/model/crud.model";

export interface LocationModel {
    id: string | null;
    code: string | null;
    name: string | null;
    description: string | null;
    enabled: boolean;
    address: AddressModel;
    crud: CrudModel;
}
  
export const EMPTY_LOCATION: LocationModel = {
    id: null,
    code: null,
    name: null,
    description: null,
    enabled: true,
    address: EMPTY_ADDRESS,
    crud: EMPTY_CRUD
};