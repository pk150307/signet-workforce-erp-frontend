class DateTimeHelper {
    public static readonly systemTimeFormat = 'YYYY-MM-DDTHH:mm:ssZ';
    public static get dateFormat(): string {
      return  localStorage.getItem('program_date_format') ? JSON.parse((localStorage.getItem('program_date_format') ?? '[]')):'DD/MM/YYYY';
    }
    public static get dateTimeFormat(): string {
      return this.dateFormat + ' hh:mm A';
    }
    public static get timeZone(): string {
      const formatedData = JSON.parse(
        localStorage.getItem('programInfo') ?? '[]'
      );
      return formatedData?.[0]?.timezone?? 'UTC';
    }
  }
  
  export { DateTimeHelper };
  