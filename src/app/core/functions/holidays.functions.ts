import moment from 'moment';

export const HOLIDAYS: string[] = ['1-1', '1-6', '4-25', '5-1', '6-2', '6-29', '8-15', '11-1', '12-8', '12-25', '12-26'];

export function getEaster(year: number): Date {
  const C = Math.floor(year / 100);
  const N = year - 19 * Math.floor(year / 19);
  const K = Math.floor((C - 17) / 25);
  let I = C - Math.floor(C / 4) - Math.floor((C - K) / 3) + 19 * N + 15;
  I = I - 30 * Math.floor((I / 30));
  I = I - Math.floor(I / 28 ) * ( 1 - Math.floor(I / 28) * Math.floor(29 / (I + 1)) * Math.floor((21 - N) / 11));
  let J = year + Math.floor(year / 4) + I + 2 - C + Math.floor(C / 4);
  J = J - 7 * Math.floor(J / 7);
  const L = I - J;
  const month = 3 + Math.floor((L + 40) / 44);
  const  day = L + 28 - 31 * Math.floor(month / 4);
  const sunday = moment(year + ' ' + month + ' ' + day, 'YYYY M D').toDate();
  return moment(sunday).add(1, 'days').toDate();
}