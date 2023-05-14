import * as moment from 'moment-timezone'
export class Text {
    static formatText(text: string) {
      return text
        .toLocaleLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    }
  
    static formatTextDb(text: string) {
      return `unaccent(LOWER(${text}))`;
    }
  }
  

  export class LocalDate {
    static getNow() {
      return moment.tz('America/Mexico_City').format();
    }
    static getYearNow() {
      return moment.tz('America/Mexico_City').year();
    }
    static getCustom(data: any, format?: string) {
      return moment(data).tz('America/Mexico_City').format(format);
    }
  }
  
