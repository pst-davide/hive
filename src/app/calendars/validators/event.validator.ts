import { minNumber, minTime, prop, required, time } from "@rxweb/reactive-form-validators";
import { Moment } from "moment";

export class CalendarValidator {
  @prop() code!: string;
  @required()
  title!: string;
  @required()
  typeId!: string;
  @prop() status!: number;
  @prop() description!: string;
  @prop() allDay!: boolean;
  @minNumber({value: 1}) resourcesCount!: number;
  @required()
  date!: Moment;
  @time()
  @required()
  from!: Date;
  @time()
  @required()
  @minTime({fieldName: 'from'})
  to!: Date;
  @prop() customerId!: string;
}
