import {Injectable} from '@angular/core';
import axios, {AxiosResponse} from 'axios';

export interface GeoResponse {
  lat: number;
  lng: number;
}

@Injectable({
  providedIn: 'root'
})
export class GeoService {

  private BASE_URL: string = 'https://nominatim.openstreetmap.org/search';

  constructor() {
  }

  public async geocodeAddress(address: string): Promise<GeoResponse | null> {
    try {

      const response: AxiosResponse<any, any> = await axios.get(this.BASE_URL, {
        params: {
          q: address,
          format: 'json',
          addressdetails: 1
        }
      });

      // Estrai il primo risultato
      const result = response.data[0];

      if (result) {
        // Ritorna le coordinate
        return {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon)
        };
      } else {
        console.warn('Nessun risultato trovato per l\'indirizzo');
        return null;
      }
    } catch (error) {
      console.error('Errore durante la geocodifica:', error);
      return null;
    }
  }
}
