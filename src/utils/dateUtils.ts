
import { getTranslation } from '@/services/translationService';

export const formatTranslatedDate = (date: Date): string => {
  const t = getTranslation();
  
  const weekdayNames = [
    t.weekdays.sunday,
    t.weekdays.monday,
    t.weekdays.tuesday,
    t.weekdays.wednesday,
    t.weekdays.thursday,
    t.weekdays.friday,
    t.weekdays.saturday
  ];
  
  const monthNames = [
    t.months.january,
    t.months.february,
    t.months.march,
    t.months.april,
    t.months.may,
    t.months.june,
    t.months.july,
    t.months.august,
    t.months.september,
    t.months.october,
    t.months.november,
    t.months.december
  ];
  
  const weekday = weekdayNames[date.getDay()];
  const month = monthNames[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  
  return `${weekday}, ${day} ${month} ${year}`;
};
