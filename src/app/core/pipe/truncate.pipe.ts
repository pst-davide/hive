import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  name: 'truncate'
})
export class TruncatePipe implements PipeTransform {

  transform(value: string, limit: number = 20, ellipsis: string = '...', mode: 'words' | 'letters' = 'words'): string {
    if (!value) return '';

    // Troncamento basato su lettere
    if (mode === 'letters') {
      return value.length > limit ? value.slice(0, limit) + ellipsis : value;
    }

    if (mode === 'words') {
      const words: string[] = value.split(' ');
      return words.length > limit ? words.slice(0, limit).join(' ') + ellipsis : value;
    }

    return value;
  }

}
