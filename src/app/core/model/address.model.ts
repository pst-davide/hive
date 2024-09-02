export interface AddressModel {
  street: string | null;
  city: string | null;
  province: string | null;
  zip: string | null;
  latitude: number;
  longitude: number;
}


export const EMPTY_ADDRESS: AddressModel = {
  street: null,
  city: null,
  province: null,
  zip: null,
  latitude: 0,
  longitude: 0
}