import {CrudModel, EMPTY_CRUD} from '../../core/model/crud.model';
import {LabelModel} from '../../core/model/label.model';

export enum USER_ROLES_ENUM {
  'Amministratore' = 1,
  'Dirigente' = 10,
  'Utente' = 50
}

export interface UserModel {
  id: string | null;
  name: string | null;
  lastname: string | null;
  email: string | null;
  password: string | null;
  role: number;
  phone: string | null;
  refreshToken: string | null;
  currentToken: string | null;
  birthDate: Date | null;
  birthCity: string | null;
  birthProvince: string | null;
  cf: string | null;
  enabled: boolean;
  crud: CrudModel;
}

export const EMPTY_USER: UserModel = {
  id: null,
  name: null,
  lastname: null,
  email: null,
  password: null,
  phone: null,
  role: USER_ROLES_ENUM.Utente,
  birthDate: null,
  birthCity: null,
  birthProvince: null,
  cf: null,
  refreshToken: null,
  currentToken: null,
  enabled: true,
  crud: EMPTY_CRUD
}

export const USER_ROLES: LabelModel[] = [
  {id: USER_ROLES_ENUM.Amministratore, value: 'Amministratore'},
  {id: USER_ROLES_ENUM.Dirigente, value: 'Dirigente'},
  {id: USER_ROLES_ENUM.Utente, value: 'Utente'},
];
