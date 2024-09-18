import moment from 'moment';

export function exporter(data: any[], columns: any[]): any[] {
  const sorter = columns.map(x => {
    return {key: x.key, name: x.name, rowType: x.rowType, format: x.format ? x.format : null};
  });
  return data.map(x => {
    const obj: any = {};
    sorter.forEach(y => {
      Object.keys(x).forEach(z => {
        if (z === y.key) {
          if (typeof x[y.key] === 'boolean') {
            obj[y.name] = x[y.key] ? 'Si' : 'No';
          } else if (y.rowType === 'hour') {
            obj[y.name] = x[y.key] !== 0 ? Math.round((x[y.key] / 60) * 100) / 100 : 0;
          } else if (y.rowType === 'currency') {
            obj[y.name] = x[y.key] !== 0 ? Math.round(x[y.key] * 100) / 100 : 0;
          } else if (y.rowType === 'date') {
            obj[y.name] = x[y.key] > 0 ? moment(x[y.key]).format('DD.MM.YYYY') : '';
          } else {
            obj[y.name] = x[y.key] ? x[y.key] : '';
          }
        }
      });
    });
    return obj;
  });
}
