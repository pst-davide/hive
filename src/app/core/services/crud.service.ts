import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CrudService {

  constructor() { }

  public setCrudEntity(model: any, doc: any): any {
    const userId: string | null = localStorage.getItem('userId') || null;

    doc.createdAt = model.crud.createAt ?? new Date();
    doc.createdBy = model.crud.createBy ?? userId;
    doc.modifiedAt = new Date();
    doc.modifiedBy = userId;
    return doc;
  }
}
