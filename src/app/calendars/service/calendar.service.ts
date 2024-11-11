import { Injectable } from '@angular/core';
import {AuthService} from '../../core/services/auth.service';
import axios, {AxiosInstance, AxiosResponse} from 'axios';
import {CALENDAR} from '../model/calendar.model';
import {AxiosInterceptor} from '../../core/functions/axios.interceptor';
import {Calendar} from '../../../server/entity/event.entity';
import {DateInput} from '@fullcalendar/core';
import moment from 'moment';
import {DEFAULT_CALENDAR_BACKGROUND} from '../../core/functions/environments';
import {CrudService} from '../../core/services/crud.service';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {

  private apiUrl: string = 'http://localhost:3000/api/calendar';
  private apiClient: AxiosInstance;

  constructor(private authService: AuthService, private crud: CrudService) {
    const axiosInterceptor: AxiosInterceptor = new AxiosInterceptor(this.authService);
    this.apiClient = axiosInterceptor.getApiClient();
  }

  private getHeaders():  {Authorization: string} {
    const token: string | null = localStorage.getItem('accessToken');
    return {
      'Authorization': `Bearer ${token}`
    };
  }

  private toModel(entity: Calendar): CALENDAR {
    const d: DateInput = entity.eventDate ?  entity.eventDate as DateInput : moment().startOf('day').toDate() as DateInput;
    const f: DateInput = entity.startDate ?  entity.startDate as DateInput : moment().toDate() as DateInput;
    const t: DateInput = entity.endDate ?  entity.endDate as DateInput : moment().toDate() as DateInput;
    const duration: number = moment(t).diff(moment(f), 'minutes') ?? 0;

    const doc: CALENDAR = {} as CALENDAR;
    doc.id = entity.id;
    doc.code = entity.code;
    doc.title = entity.title;
    doc['description'] = entity.description;
    doc.shiftId = entity.shiftId;
    doc.backgroundColor = entity.color;
    doc.resourceIds = entity.resourceIds;
    doc.customerId = entity.customerId;
    doc.date = d;
    doc.start = f;
    doc.end = t;
    doc.duration = duration;
    doc.status = entity.status;
    doc.serial = entity.serial;
    doc.year = entity.year;
    doc.allDay = entity.allDay;
    doc.editable = true;
    doc.startEditable = true;
    doc.durationEditable = true;

    doc.crud = {
      createAt: entity.createdAt,
      createBy: entity.createdBy,
      modifiedAt: entity.modifiedAt,
      modifiedBy: entity.modifiedBy,
    };

    return doc;
  }

  private toEntity(model: CALENDAR): Calendar {
    let doc: Calendar = new Calendar();

    doc.id = model.id;
    doc.code = model.code ?? '';
    doc.title = model.title ?? '';
    doc['description'] = model['description'];
    doc.shiftId = model.shiftId;
    doc.color = model.backgroundColor ?? DEFAULT_CALENDAR_BACKGROUND;
    doc.resourceIds = model.resourceIds;
    doc.customerId = model.customerId;
    doc.eventDate = moment(model.date).format('YYYY-MM-DD');
    doc.startDate = model.start as Date ?? null;
    doc.endDate = model.end as Date ?? null;
    doc.status = model.status;
    doc.serial = model.serial ?? 0;
    doc.year = model.year ?? 0;
    doc.allDay = model.allDay ?? false;

    doc = this.crud.setCrudEntity(model, doc);

    return doc;

  }

  public async getEventsInRange(startDate: Date, endDate: Date): Promise<CALENDAR[]> {
    const url: string = `${this.apiUrl}/range`;

    const response: AxiosResponse<any, any> = await this.apiClient.post(url, {
      startDate: moment(startDate).format('YYYY-MM-DD HH:mm:ss'),
      endDate: moment(endDate).format('YYYY-MM-DD HH:mm:ss'),
      headers: this.getHeaders()
    });
    return response.data.map((entity: any) => this.toModel(entity));
  }

  public async getMaxSerial(shiftId: string): Promise<{maxSerial: number}> {
    const url: string = `${this.apiUrl}/serial/${shiftId}`;
    const response: AxiosResponse<any, any> = await this.apiClient.get(url, {headers: this.getHeaders()});
    return response.data;
  }

  public async createDoc(doc: CALENDAR): Promise<CALENDAR> {
    const headers: {Authorization: string} = this.getHeaders();

    const entity: Calendar = this.toEntity(doc);
    try {
      console.log(entity);
      const response: AxiosResponse<any, any> = await axios.post(this.apiUrl, entity, { headers })
      return this.toModel(response.data);
    } catch (error) {
      throw error;
    }
  }

  public async updateDoc(id: string, doc: CALENDAR): Promise<CALENDAR> {
    const headers: {Authorization: string} = this.getHeaders();

    const entity: Calendar = this.toEntity(doc);
    try {
      const response: AxiosResponse<any, any> = await axios.put(`${this.apiUrl}/${id}`, entity, { headers });
      return this.toModel(response.data);
    } catch (error) {
      throw error;
    }
  }

}
