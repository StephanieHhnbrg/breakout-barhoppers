export function getOpeningHoursString(hours: {day: number, start: number, end: number}[]): string {
  if (hours.length == 0) {
    return "&emsp;No hours set!";
  }

  hours = hours.sort((a,b) => a.day - b.day);
  let start = hours[0].day;
  let end = start;
  let result = "&emsp;";
  hours.forEach((h, index) => {
    if (index < hours.length - 1) {
      let next = hours[index+1];
      if (h.start == next.start && h.end == next.end) {
        end = next.day;
        if (h.day + 1 != next.day) {
          if (start != h.day) {
            result += `${getDayString(start)} - `;
          }
          result += `${getDayString(h.day)}, `;
          start = next.day;
        }
      } else {
        result += `${getHourString(start, h.day, h.start, h.end)} <br />&emsp;`;
        start = next.day;
        end = start;
      }
    } else {
      end = h.day;
      result += getHourString(start, end, h.start, h.end);
    }
  });
  return result;
}

function getHourString(startDay: number, endDay: number, startHour: number, endHour: number): string {
  let hourRange = `${addAMPMsuffixToHour(startHour)} - ${addAMPMsuffixToHour(endHour)}`;
  if (startDay == endDay) {
    return `${getDayString(startDay)}: ${hourRange}`;
  }
  return `${getDayString(startDay)} - ${getDayString(endDay)}: ${hourRange}`;
}

export function addAMPMsuffixToHour(h: number): string {
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12} ${suffix}`;
}

export function getDayString(day: number): string {
  switch(day) {
    case 1: return 'Mon';
    case 2: return 'Tue';
    case 3: return 'Wed';
    case 4: return 'Thu';
    case 5: return 'Fri';
    case 6: return 'Sat';
    case 7: case 0: return 'Sun';
  }
  return '';
}
