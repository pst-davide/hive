import {CrudModel, EMPTY_CRUD} from '../../../core/model/crud.model';

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

export interface NewsletterSubscriptionModel {
  id: number | null;
  userId: string | null;
  channelId: number | null;
  subscriptionDate: Date | null;
}

export type NEWSLETTER_SUBSCRIBERS_TYPE = NewsletterSubscriptionModel & {
  VIEW_CHANNEL_NAME?: string | null;
  VIEW_USER_NAME?: string | null;
  VIEW_USER_LASTNAME?: string | null;
}

export const EMPTY_NEWSLETTER_SUBSCRIBER: NEWSLETTER_SUBSCRIBERS_TYPE = {
  id: null,
  userId: null,
  channelId: null,
  subscriptionDate: null,
};
