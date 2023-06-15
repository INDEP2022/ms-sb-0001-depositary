import * as moment from "moment-timezone";

export class LocalDate {
    static getNow(format?: any) {
        return moment.tz('America/Mexico_City').format(format);
    }
    
    static getNowPlusUnit(unit: moment.unitOfTime.DurationConstructor, amount: number, format: string = 'DD/MM/YYYY') {
        return moment().tz('America/Mexico_City').add(amount, unit).format(format)
    }

    static getNextDay(date: any, format?: string) {
        return moment(date).tz('America/Mexico_City').add(1, 'day').format(format);
    }

    static getYearNow() {
        return moment.tz('America/Mexico_City').year();
    }

    static getCustom(data: any, format?: any) {
        return moment(data).tz('America/Mexico_City').add(1, 'day').format(format);
    }

    static isAfter(date:any = new Date(), dateToCompare:any = new Date()) {
        return moment(date).tz('America/Mexico_City').isAfter(dateToCompare);
    }

    static isBefore(date:any = new Date(), dateToCompare:any = new Date()) {
        return moment(date).tz('America/Mexico_City').isBefore(dateToCompare);
    }

    static isBetween(dateToCheck: string, date1: string, date2: string) {
        let isValid = false;
        if(moment(dateToCheck).isSame(date1) || moment(dateToCheck).isSame(date2)) {
            isValid = true;
         } else {
            isValid = moment(dateToCheck).tz('America/Mexico_City').isBetween(date1, date2);
         }
        
        return isValid;
    }
}