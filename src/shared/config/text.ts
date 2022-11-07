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
  