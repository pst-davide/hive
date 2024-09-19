import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {firstValueFrom, map, Observable} from 'rxjs';
import {PressCategory} from '../../../../server/entity/press-category.entity';
import {PRESS_CATEGORY_TYPE, PressCategoryModel} from '../model/press-category.model';

@Injectable({
  providedIn: 'root'
})
export class PressService {

  private apiUrl: string = 'http://localhost:3000/api/press/categories';

  constructor(private http: HttpClient) {
  }

  private toEntity(model: PressCategoryModel): PressCategory {
    const doc: PressCategory = new PressCategory();
    doc.id = model.id ?? '';
    doc.name = model.name ?? '';
    doc.color = model.color ?? '';
    doc.createdAt = model.crud.createAt ?? new Date();
    doc.createdBy = model.crud.createBy ?? null;
    doc.modifiedAt = model.crud.modifiedAt ?? new Date();
    doc.modifiedBy = model.crud.modifiedBy ?? null;

    return doc;
  }

  private toModel(entity: any): PRESS_CATEGORY_TYPE {
    const model: PRESS_CATEGORY_TYPE = {} as PRESS_CATEGORY_TYPE;
    model.id = entity.id;
    model.name = entity.name;
    model.color = entity.color ?? '';
    model.crud = {
      createAt: entity.createdAt,
      createBy: entity.createdBy,
      modifiedAt: entity.modifiedAt,
      modifiedBy: entity.modifiedBy,
    };

    model.VIEW_KEYWORDS_COUNT = entity?.keywordsCount ?? 0;
    model.VIEW_KEYWORDS = entity.keywords ? entity.keywords.join(',') : '';

    return model;
  }

  public getDocs(): Observable<PRESS_CATEGORY_TYPE[]> {
    return this.http.get<PRESS_CATEGORY_TYPE[]>(this.apiUrl + '?countKeywords=true')
      .pipe(map((entities: any[]) => entities.map((entity: any) => this.toModel(entity))));
  }

  public getById(id: string): Observable<PressCategoryModel> {
    return this.http.get<PressCategoryModel>(`${this.apiUrl}/${id}`);
  }

  public async createDoc(doc: PressCategoryModel): Promise<PressCategoryModel> {
    const entity: PressCategory = this.toEntity(doc);
    try {
      const savedEntity: PressCategory = await firstValueFrom(this.http.post<PressCategory>(this.apiUrl, entity));
      return this.toModel(savedEntity);
    } catch (error) {
      throw error;
    }
  }

  public async updateDoc(id: number, doc: PressCategoryModel): Promise<PressCategoryModel> {
    const entity: PressCategory = this.toEntity(doc);
    try {
      const savedEntity: PressCategory = await firstValueFrom(this.http.put<PressCategory>(`${this.apiUrl}/${id}`, entity));
      return this.toModel(savedEntity);
    } catch (error) {
      throw error;
    }
  }

  public deleteDoc(id: string): Observable<PressCategoryModel> {
    return this.http.delete<PressCategoryModel>(`${this.apiUrl}/${id}`);
  }
}
