import {CrudModel, EMPTY_CRUD} from '../../../core/model/crud.model';
import {DEFAULT_LOCATION_COLOR} from '../../../core/functions/environments';

export interface RoomModel {
  id: string | null;
  code: string | null;
  name: string | null;
  description: string | null;
  capacity: number;
  owners: string[];
  floor: number;
  color: string | null;
  enabled: boolean;
  branchId: string | null;
  crud: CrudModel;
}

export type ROOM_TYPE = RoomModel & {
  VIEW_LOCATION_NAME?: string | null;
  VIEW_COLOR?: string | null;
}

export const EMPTY_ROOM: ROOM_TYPE = {
  id: null,
  code: null,
  name: null,
  description: null,
  capacity: 0,
  owners: [],
  floor: 0,
  enabled: true,
  branchId: null,
  color: DEFAULT_LOCATION_COLOR,
  crud: EMPTY_CRUD
};
