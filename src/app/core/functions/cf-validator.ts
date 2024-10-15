import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CfValidator {
  static validateCF(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const cf = control.value;

      // Regex per validare il CF (Codice Fiscale Italiano)
      const cfRegex = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/i;

      if (!cf || !cfRegex.test(cf)) {
        return { invalidCf: 'Codice Fiscale non valido' };
      }

      // Verifica il carattere di controllo
      const expectedControlChar: string = CfValidator.calculateControlChar(cf);
      const actualControlChar: string = cf.charAt(15).toUpperCase();

      if (expectedControlChar !== actualControlChar) {
        return { invalidCf: 'Carattere di controllo non valido' };
      }

      // Estrai data di nascita e codice del comune
      const birthDate: Date | null = CfValidator.extractBirthDate(cf);
      const birthPlaceCode: string | null = CfValidator.extractComuneCode(cf);

      if (!birthDate || !birthPlaceCode) {
        return { invalidCf: 'Errore nell\'estrazione dei dati' };
      }

      return null; // Se il CF è valido
    };
  }

  // Estrai la data di nascita dal CF
  static extractBirthDate(cf: string): Date | null {
    const year: number = parseInt(cf.substring(6, 8), 10);
    const monthCode: string = cf.charAt(8);
    const day: number = parseInt(cf.substring(9, 11), 10);

    // Decodifica l'anno di nascita (assumendo che sia nel 1900-1999 per semplicità)
    const birthYear: number = year > new Date().getFullYear() % 100 ? 1900 + year : 2000 + year;

    // Mesi mappati dalla lettera (A-L)
    const monthMapping: any = {
      'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'H': 6,
      'L': 7, 'M': 8, 'P': 9, 'R': 10, 'S': 11, 'T': 12
    };

    const birthMonth: any = monthMapping[monthCode.toUpperCase()];
    const birthDay: number = day > 40 ? day - 40 : day; // Per il sesso (donne hanno 40+)

    if (!birthMonth || birthDay < 1 || birthDay > 31) {
      return null;
    }

    return new Date(birthYear, birthMonth - 1, birthDay);
  }

  // Estrai il codice del comune di nascita
  static extractComuneCode(cf: string): string | null {
    return cf.substring(11, 15); // Codice del comune dal CF
  }

  // Funzione per calcolare il carattere di controllo
  static calculateControlChar(cf: string): string {
    const evenMap: string = 'BAFHJNPRTVCESULDGIMOQKWZYX';

    const oddTable: any = {
      '0': 1, '1': 0, '2': 5, '3': 7, '4': 9, '5': 13, '6': 15, '7': 17, '8': 19, '9': 21,
      'A': 1, 'B': 0, 'C': 5, 'D': 7, 'E': 9, 'F': 13, 'G': 15, 'H': 17, 'I': 19, 'J': 21,
      'K': 1, 'L': 0, 'M': 5, 'N': 7, 'O': 9, 'P': 13, 'Q': 15, 'R': 17, 'S': 19,
      'T': 21, 'U': 1, 'V': 0, 'W': 5, 'X': 7, 'Y': 9, 'Z': 13
    };

    let sum: number = 0;

    for (let i = 0; i < 15; i++) {
      const c: string = cf.charAt(i).toUpperCase();
      if (i % 2 === 0) {
        sum += oddTable[c];
      } else {
        const n: number = c >= '0' && c <= '9' ? c.charCodeAt(0) - '0'.charCodeAt(0) : c.charCodeAt(0) - 'A'.charCodeAt(0);
        sum += evenMap.charCodeAt(n) - 'A'.charCodeAt(0);
      }
    }

    const alphabet: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return alphabet.charAt(sum % 26);
  }
}
