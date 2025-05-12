export interface Quest {
  id: string,
  barId: string,
  name: string,
  description: string,

  regularDays?: number[];
  startHour: number,
  endHour: number,

  dates?: Date[],
}
