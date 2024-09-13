import {DEFAULT_LOCATION_COLOR} from "app/core/functions/environments";
import {AddressModel, EMPTY_ADDRESS} from "app/core/model/address.model";
import {CrudModel, EMPTY_CRUD} from "app/core/model/crud.model";

export interface LocationModel {
  id: string | null;
  code: string | null;
  name: string | null;
  description: string | null;
  color: string | null;
  phone: string | null;
  email: string | null;
  enabled: boolean;
  address: AddressModel;
  crud: CrudModel;
}

export type LOCATION_TYPE = LocationModel & {
  VIEW_STREET?: string | null;
  VIEW_ZIP?: string | null;
  VIEW_CITY?: string | null;
  VIEW_PROVINCE?: string | null;
};

export const EMPTY_LOCATION: LOCATION_TYPE = {
  id: null,
  code: null,
  name: null,
  description: null,
  phone: null,
  email: null,
  color: DEFAULT_LOCATION_COLOR,
  enabled: true,
  address: EMPTY_ADDRESS,
  crud: EMPTY_CRUD
};
