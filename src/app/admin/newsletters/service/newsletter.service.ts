import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CrudService} from '../../../core/services/crud.service';
import axios, {AxiosResponse} from 'axios';
import {NEWSLETTER_CHANNEL_TYPE, NEWSLETTER_SUBSCRIBERS_TYPE} from '../model/newsletter.model';
import {firstValueFrom} from 'rxjs';
import {Channel} from '../../../../server/entity/newsletter-channel.entity';

@Injectable({
  providedIn: 'root'
})
export class NewsletterService {

  private channelApiUrl: string = 'http://localhost:3000/api/newsletters/channels';
  private userApiUrl: string = 'http://localhost:3000/api/newsletters/users';
  private subscriptionApiUrl: string = 'http://localhost:3000/api/newsletters/subscriptions';

  constructor(private http: HttpClient, private crud: CrudService) { }

  private toEntity(model: NEWSLETTER_CHANNEL_TYPE): Channel {
    let doc: Channel = new Channel();
    doc.id = model.id && model.id !== 0 ? model.id : 0;
    doc.name = model.name ?? '';
    doc.description = model.description ?? '';
    doc = this.crud.setCrudEntity(model, doc);

    return doc;
  }

  private toModel(entity: any): NEWSLETTER_CHANNEL_TYPE {
    console.log(entity)
    const model: NEWSLETTER_CHANNEL_TYPE = {} as NEWSLETTER_CHANNEL_TYPE;
    model.id = entity.id;
    model.name = entity.name;
    model.description = entity.description ?? null;
    model.crud = {
      createAt: entity.createdAt,
      createBy: entity.createdBy,
      modifiedAt: entity.modifiedAt,
      modifiedBy: entity.modifiedBy,
    };

    model.VIEW_SUBSCRIBERS_COUNT = entity?.subscriberCount ?? 0;
    model.VIEW_OWNERS = '';

    return model;
  }

  public async getChannelDocs(): Promise<NEWSLETTER_CHANNEL_TYPE[]> {
    try {
      const response: AxiosResponse<any, any> = await axios.get(`${this.channelApiUrl}?countSubscribers=true`);
      return response.data.map((entity: any) => this.toModel(entity));
    } catch (error) {
      console.error('Errore durante il fetch dei documenti:', error);
      throw error;
    }
  }

  public async createChannelDoc(doc: NEWSLETTER_CHANNEL_TYPE): Promise<NEWSLETTER_CHANNEL_TYPE> {
    const entity: Channel = this.toEntity(doc);

    try {
      const response: AxiosResponse<any, any> = await axios.post(`${this.channelApiUrl}`, entity);
      return this.toModel(response.data);
    } catch (error) {
      console.log(error)
      throw error;
    }
  }

  public async updateChannelDoc(id: number, doc: NEWSLETTER_CHANNEL_TYPE): Promise<NEWSLETTER_CHANNEL_TYPE> {
    const entity: Channel = this.toEntity(doc);
    try {
      const response: AxiosResponse<any, any> = await axios.put(`${this.channelApiUrl}/${id}`, entity);
      return this.toModel(response.data);
    } catch (error) {
      throw error;
    }
  }

  public async deleteChannelDoc(id: number): Promise<any> {
    try {
      const response: NEWSLETTER_CHANNEL_TYPE = await firstValueFrom(
        this.http.delete<NEWSLETTER_CHANNEL_TYPE>(`${this.channelApiUrl}/delete/${id}`)
      );
      console.log('Delete successful:', response);
      return response;
    } catch (error) {
      console.error('Delete failed:', error);
      throw error;
    }
  }

  /*************************************************
   *
   * Subscribers
   *
   ************************************************/

  private toSubscriptionModel(entity: any): NEWSLETTER_SUBSCRIBERS_TYPE {
    const model: NEWSLETTER_SUBSCRIBERS_TYPE = {} as NEWSLETTER_SUBSCRIBERS_TYPE;
    model.id = entity.id;
    model.userId = entity.userId;
    model.channelId = entity.channelId;
    model.subscriptionDate = entity.subscriptionDate;

    return model;
  }

  public async getSubscriptionsDocs(id: number | null = null): Promise<NEWSLETTER_SUBSCRIBERS_TYPE[]> {
    try {
      const response: AxiosResponse<any, any> = await axios.get(`${this.subscriptionApiUrl}${(id ? '?channelId=' + id : '')}`);
      return response.data.map((entity: any) => this.toSubscriptionModel(entity));
    } catch (error) {
      console.error('Errore durante il fetch dei documenti:', error);
      throw error;
    }
  }

  public async deleteSubscriptionDoc(id: number): Promise<any> {
    try {
      const response: NEWSLETTER_SUBSCRIBERS_TYPE = await firstValueFrom(
        this.http.delete<NEWSLETTER_SUBSCRIBERS_TYPE>(`${this.subscriptionApiUrl}/delete/${id}`)
      );
      console.log('Delete successful:', response);
      return response;
    } catch (error) {
      console.error('Delete failed:', error);
      throw error;
    }
  }
}
