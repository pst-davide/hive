import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {firstValueFrom, map, Observable} from 'rxjs';
import {PressCategory} from '../../../../server/entity/press-category.entity';
import {PRESS_CATEGORY_TYPE, PressCategoryModel} from '../model/press-category.model';
import {IMPORTANCE_BADGE, PRESS_KEYWORD_TYPE} from '../model/press-keyword.model';

@Injectable({
  providedIn: 'root'
})
export class PressService {

  private apiCategoryUrl: string = 'http://localhost:3000/api/press/categories';
  private apiKeywordUrl: string = 'http://localhost:3000/api/press/keywords';

  constructor(private http: HttpClient) {
  }

  /*************************************************
   *
   * Categories
   *
   ************************************************/

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
    return this.http.get<PRESS_CATEGORY_TYPE[]>(this.apiCategoryUrl + '?countKeywords=true')
      .pipe(map((entities: any[]) => entities.map((entity: any) => this.toModel(entity))));
  }

  public getById(id: string): Observable<PressCategoryModel> {
    return this.http.get<PressCategoryModel>(`${this.apiCategoryUrl}/${id}`);
  }

  public async createDoc(doc: PressCategoryModel): Promise<PressCategoryModel> {
    const entity: PressCategory = this.toEntity(doc);
    try {
      const savedEntity: PressCategory = await firstValueFrom(this.http.post<PressCategory>(this.apiCategoryUrl, entity));
      return this.toModel(savedEntity);
    } catch (error) {
      throw error;
    }
  }

  public async updateDoc(id: number, doc: PressCategoryModel): Promise<PressCategoryModel> {
    const entity: PressCategory = this.toEntity(doc);
    try {
      const savedEntity: PressCategory = await firstValueFrom(this.http.put<PressCategory>(`${this.apiCategoryUrl}/${id}`, entity));
      return this.toModel(savedEntity);
    } catch (error) {
      throw error;
    }
  }

  public deleteDoc(id: string): Observable<PressCategoryModel> {
    return this.http.delete<PressCategoryModel>(`${this.apiCategoryUrl}/${id}`);
  }

  /*************************************************
   *
   * Keywords
   *
   ************************************************/

  private toKeywordModel(entity: any): PRESS_KEYWORD_TYPE {
    console.log(entity);
    const model: PRESS_KEYWORD_TYPE = {} as PRESS_KEYWORD_TYPE;
    model.id = entity.id;
    model.word = entity.word;
    model.importance = entity.importance;
    model.crud = {
      createAt: entity.createdAt,
      createBy: entity.createdBy,
      modifiedAt: entity.modifiedAt,
      modifiedBy: entity.modifiedBy,
    };

    const importance: {id: string; label: string; color: string} | null = IMPORTANCE_BADGE
      .find((badge: {id: string; label: string; color: string}) => badge.id === entity.importance) ?? null;
    model.VIEW_COLOR = importance?.color ?? null;
    model.VIEW_IMPORTANCE = importance?.label ?? null;

    model.VIEW_CATEGORY_NAME = entity?.category.name ?? null;
    model.VIEW_CATEGORY_COLOR = entity?.category.color ?? null;

    return model;
  }

  public getKeywordsDocs(id: number | null = null): Observable<PRESS_KEYWORD_TYPE[]> {
    return this.http.get<PRESS_KEYWORD_TYPE[]>(`${this.apiKeywordUrl}${(id ? '?categoryId=' + id : '')}`)
      .pipe(map((entities: any[]) => entities.map((entity: any) => this.toKeywordModel(entity))));
  }
}
