import {CrudModel, EMPTY_CRUD} from '../../../core/model/crud.model';
import {ROOM_TYPE} from '../../rooms/model/room.model';

export interface NewsletterChannelModel {
  id: number | null;
  name: string | null;
  description: string | null;
  owners: string[];
  crud: CrudModel;
}

export type NEWSLETTER_CHANNEL_TYPE = NewsletterChannelModel & {
  VIEW_OWNERS?: string | null;
  VIEW_SUBSCRIBERS_COUNT?: number;
}

export const EMPTY_NEWSLETTER_CHANNEL: NEWSLETTER_CHANNEL_TYPE = {
  id: null,
  name: null,
  description: null,
  owners: [],
  crud: EMPTY_CRUD
}
