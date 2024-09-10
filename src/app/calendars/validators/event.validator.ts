import { Time } from "@angular/common";
import { minNumber, minTime, prop, required, time } from "@rxweb/reactive-form-validators";
import { Moment } from "moment";

export class CalendarValidator {
    @prop() hidden!: string;
    @prop() allDay!: boolean;
    @prop() status!: number;
    @prop() duration!: number;
    @prop() description!: string;
    @prop() code!: string;
    @prop() color!: string;
    @prop() picker!: string;
    @required()
    title!: string;
    @required()
    typeId!: string;
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
  }