import {AddressModel, EMPTY_ADDRESS} from '../../../core/model/address.model';
import {CrudModel, EMPTY_CRUD} from '../../../core/model/crud.model';

export interface RoomModel {
  id: string | null;
  code: string | null;
  name: string | null;
  description: string | null;
  capacity: number;
  owners: string[];
  floor: number;
  enabled: boolean;
  address: AddressModel;
  crud: CrudModel;
}

export const EMPTY_ROOM: RoomModel = {
  id: null,
  code: null,
  name: null,
  description: null,
  capacity: 0,
  owners: [],
  floor: 0,
  enabled: true,
  address: EMPTY_ADDRESS,
  crud: EMPTY_CRUD
};