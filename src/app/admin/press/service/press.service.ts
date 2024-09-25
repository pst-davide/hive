import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {firstValueFrom, map, Observable} from 'rxjs';
import {PressCategory} from '../../../../server/entity/press-category.entity';
import {PRESS_CATEGORY_TYPE} from '../model/press-category.model';
import {IMPORTANCE_BADGE, PRESS_KEYWORD_TYPE} from '../model/press-keyword.model';
import {PressKeyword} from '../../../../server/entity/press-keyword.entity';
import axios, {AxiosResponse} from 'axios';

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

  private toEntity(model: PRESS_CATEGORY_TYPE): PressCategory {
    const doc: PressCategory = new PressCategory();
    doc.id = model.id && model.id !== 0 ? model.id : 0;
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

  public async getDocs(): Promise<PRESS_CATEGORY_TYPE[]> {
  try {
    const response: AxiosResponse<any, any> = await axios.get<PRESS_CATEGORY_TYPE[]>(`${this.apiCategoryUrl}?countKeywords=true`);
    return response.data.map((entity: any) => this.toModel(entity));
  } catch (error) {
    console.error('Errore durante il fetch dei documenti:', error);
    throw error;
  }
}

  public getById(id: string): Observable<PRESS_CATEGORY_TYPE> {
    return this.http.get<PRESS_CATEGORY_TYPE>(`${this.apiCategoryUrl}/${id}`)
      .pipe(map((entity: any) => this.toModel(entity)));
  }

  public async createDoc(doc: PRESS_CATEGORY_TYPE): Promise<PRESS_CATEGORY_TYPE> {
    const entity: PressCategory = this.toEntity(doc);

    try {
      const response: AxiosResponse<any, any> = await axios.post(`${this.apiCategoryUrl}`, entity);
      return this.toModel(response.data);
    } catch (error) {
      console.log(error)
      throw error;
    }
  }

  public async updateDoc(id: number, doc: PRESS_CATEGORY_TYPE): Promise<PRESS_CATEGORY_TYPE> {
    const entity: PressCategory = this.toEntity(doc);
    try {
      const response: AxiosResponse<any, any> = await axios.put(`${this.apiCategoryUrl}/${id}`, entity);
      return this.toModel(response.data);
    } catch (error) {
      throw error;
    }
  }

  public async deleteDoc(id: number): Promise<any> {
    try {
      const response: PRESS_CATEGORY_TYPE = await firstValueFrom(
        this.http.delete<PRESS_CATEGORY_TYPE>(`${this.apiCategoryUrl}/delete/${id}`)
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
   * Keywords
   *
   ************************************************/

  private toKeywordModel(entity: any): PRESS_KEYWORD_TYPE {
    const model: PRESS_KEYWORD_TYPE = {} as PRESS_KEYWORD_TYPE;
    model.id = entity.id;
    model.word = entity.word;
    model.importance = entity.importance;
    model.category = entity.categoryId;
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

    model.VIEW_CATEGORY_NAME = entity?.category?.name ?? null;
    model.VIEW_CATEGORY_COLOR = entity?.category?.color ?? null;

    return model;
  }

  private toKeywordEntity(model: PRESS_KEYWORD_TYPE): PressKeyword {
    const doc: PressKeyword = new PressKeyword();
    doc.id = model.id && model.id !== 0 ? model.id : 0;
    doc.word = model.word ?? '';
    doc.importance = model.importance ?? 'low';
    doc.categoryId = model.category ?? 0;
    doc.createdAt = model.crud.createAt ?? new Date();
    doc.createdBy = model.crud.createBy ?? null;
    doc.modifiedAt = model.crud.modifiedAt ?? new Date();
    doc.modifiedBy = model.crud.modifiedBy ?? null;

    return doc;
  }

  public getKeywordsDocs(id: number | null = null): Observable<PRESS_KEYWORD_TYPE[]> {
    return this.http.get<PRESS_KEYWORD_TYPE[]>(`${this.apiKeywordUrl}${(id ? '?categoryId=' + id : '')}`)
      .pipe(map((entities: any[]) => entities.map((entity: any) => this.toKeywordModel(entity))));
  }

  public async saveKeywordsBatch(keywords: PRESS_KEYWORD_TYPE[]): Promise<void> {
    try {
      const entities: PressKeyword[] = keywords.map((keyword: PRESS_KEYWORD_TYPE) => this.toKeywordEntity(keyword));
      const response: AxiosResponse<any, any> = await axios.post(`${this.apiKeywordUrl}/batch`, entities);
      console.log('Keywords salvate:', response.data);
    } catch (error) {
      console.error('Errore durante il salvataggio delle keywords:', error);
    }
  }

  public async createKeywordDoc(doc: PRESS_KEYWORD_TYPE): Promise<PRESS_KEYWORD_TYPE> {
    const entity: PressKeyword = this.toKeywordEntity(doc);

    try {
      const response: AxiosResponse<any, any> = await axios.post(`${this.apiKeywordUrl}`, entity);
      return this.toKeywordModel(response.data);
    } catch (error) {
      console.log(error)
      throw error;
    }
  }

  public async updateKeywordDoc(id: number, doc: PRESS_KEYWORD_TYPE): Promise<PRESS_KEYWORD_TYPE> {
    const entity: PressKeyword = this.toKeywordEntity(doc);
    try {
      const response: AxiosResponse<any, any> = await axios.put(`${this.apiKeywordUrl}/${id}`, entity);
      return this.toKeywordModel(response.data);
    } catch (error) {
      throw error;
    }
  }

  public async deleteKeywordDoc(id: number): Promise<any> {
    try {
      const response: PRESS_KEYWORD_TYPE = await firstValueFrom(
        this.http.delete<PRESS_KEYWORD_TYPE>(`${this.apiKeywordUrl}/delete/${id}`)
      );
      console.log('Delete successful:', response);
      return response;
    } catch (error) {
      console.error('Delete failed:', error);
      throw error;
    }
  }
}
