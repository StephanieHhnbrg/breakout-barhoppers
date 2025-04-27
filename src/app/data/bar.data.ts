import {Quest} from './quest.data';

export interface Bar {
  id: string,
  name: string,
  address: string,
  lat: number,
  lng: number,

  openingHours: {day: number, start: number, end: number}[],
  happyHours: {day: number, start: number, end: number}[],

  quests: Quest[],
}
