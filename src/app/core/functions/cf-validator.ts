import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CfValidator {
  static validateCF(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const cf = control.value;

      if (!cf || cf === '') {
        return null;
      }

      // Regex per validare il CF (Codice Fiscale Italiano)
      const cfRegex = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/i;

      if (!cfRegex.test(cf)) {
        return { invalidCf: 'Codice Fiscale non valido' };
      }

      // Verifica il carattere di controllo
      const expectedControlChar: string = CfValidator.getCheckCode(cf);
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
  static getCheckCode (cf: string): string {
    cf = cf.toUpperCase();

    const CHECK_CODE_EVEN: any = {
      0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, A: 0, B: 1, C: 2, D: 3, E: 4, F: 5, G: 6, H: 7,
      I: 8, J: 9, K: 10, L: 11, M: 12, N: 13, O: 14, P: 15, Q: 16, R: 17, S: 18, T: 19, U: 20, V: 21, W: 22,
      X: 23, Y: 24, Z: 25
    };
    const CHECK_CODE_ODD: any = {
      0: 1, 1: 0, 2: 5, 3: 7, 4: 9, 5: 13, 6: 15, 7: 17, 8: 19, 9: 21, A: 1, B: 0, C: 5, D: 7, E: 9, F: 13,
      G: 15, H: 17, I: 19, J: 21, K: 2, L: 4, M: 18, N: 20, O: 11, P: 3, Q: 6, R: 8, S: 12, T: 14, U: 16,
      V: 10, W: 22, X: 25, Y: 24, Z: 23
    };

    const CHECK_CODE_CHARS: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    let val: number = 0
    for (let i = 0; i < 15; i = i + 1) {
      const c: string = cf[i]
      val += i % 2 !== 0 ? CHECK_CODE_EVEN[c] : CHECK_CODE_ODD[c]
    }
    val = val % 26
    return CHECK_CODE_CHARS.charAt(val)
  }
}
