import {MatPaginatorIntl} from "@angular/material/paginator";

export class ItPaginator extends MatPaginatorIntl {
  constructor() {
    super();


    this.itemsPerPageLabel = '';

    this.getRangeLabel = (page, pageSize, length) => {
      if (length === 0 || pageSize === 0) {
        return 'Nessun elemento';
      }

      const from: number = page * pageSize + 1;
      const to: number = Math.min(from + pageSize - 1, length);
      return `${from} - ${to} di ${length}`;
    };
  }
}
