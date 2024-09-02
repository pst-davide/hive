import {AddressModel} from '../../../core/model/address.model';
import {CrudModel} from '../../../core/model/crud.model';

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
