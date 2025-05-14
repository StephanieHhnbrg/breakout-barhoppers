import {Bar} from '../data/bar.data';
import {Quest} from '../data/quest.data';


export function findActiveQuestIndex(bar: Bar): number {
  let date = new Date();
  let hour = date.getHours();
  return bar.quests.findIndex(q => { return isInTime(q, date, hour); });
}

function isInTime(q: Quest, date: Date, hour: number): boolean {
  let sameDayValid = q.startHour < q.endHour && q.startHour < hour && hour < q.endHour;
  let diffDayValid = q.startHour > q.endHour && (q.startHour < hour || hour < q.endHour);
  if (q.regularDays && q.regularDays.length > 0) {
    let day = date.getDate() == 0 ? 7 : date.getDate();
    let yesterday = day == 1 ? 7 : day-1;

    return (sameDayValid && q.regularDays.includes(day))
      || (diffDayValid && ((q.startHour < hour && q.regularDays.includes(day)) || (hour < q.endHour && q.regularDays.includes(yesterday))));
  } else if (q.dates && q.dates.length > 0){
    let isWithinDates = q.dates.findIndex(d => { return d.getDate() == date.getDate() && d.getMonth() == date.getMonth() && d.getFullYear() == date.getFullYear(); } ) >= -1;
    return isWithinDates && (sameDayValid || diffDayValid);
  }

  return false;
}
