
// Islamic calendar conversion service
export interface IslamicDate {
  day: number;
  month: number;
  year: number;
  monthName: string;
  monthNameArabic: string;
}

const islamicMonths = [
  { en: "Muharram", ar: "محرم" },
  { en: "Safar", ar: "صفر" },
  { en: "Rabi' al-Awwal", ar: "ربيع الأول" },
  { en: "Rabi' al-Thani", ar: "ربيع الثاني" },
  { en: "Jumada al-Awwal", ar: "جمادى الأولى" },
  { en: "Jumada al-Thani", ar: "جمادى الثانية" },
  { en: "Rajab", ar: "رجب" },
  { en: "Sha'ban", ar: "شعبان" },
  { en: "Ramadan", ar: "رمضان" },
  { en: "Shawwal", ar: "شوال" },
  { en: "Dhu al-Qi'dah", ar: "ذو القعدة" },
  { en: "Dhu al-Hijjah", ar: "ذو الحجة" }
];

// Convert Gregorian date to Islamic date (approximation)
export const getIslamicDate = (gregorianDate: Date = new Date()): IslamicDate => {
  try {
    // Simple approximation - Islamic calendar is about 11 days shorter per year
    // This is a basic calculation, for precise dates, an API would be better
    const gregorianYear = gregorianDate.getFullYear();
    const gregorianDayOfYear = Math.floor((gregorianDate.getTime() - new Date(gregorianYear, 0, 0).getTime()) / 86400000);
    
    // Approximate conversion (Hijri epoch: July 16, 622 CE)
    const daysSinceHijriEpoch = Math.floor((gregorianDate.getTime() - new Date(622, 6, 16).getTime()) / 86400000);
    const hijriYear = Math.floor(daysSinceHijriEpoch / 354.367) + 1; // Islamic year is ~354.367 days
    
    const dayInYear = daysSinceHijriEpoch % 354;
    const month = Math.floor(dayInYear / 29.5) + 1; // Islamic months are ~29.5 days
    const day = Math.floor(dayInYear % 29.5) + 1;
    
    const monthIndex = Math.min(Math.max(month - 1, 0), 11);
    
    return {
      day: Math.max(day, 1),
      month: month,
      year: hijriYear,
      monthName: islamicMonths[monthIndex].en,
      monthNameArabic: islamicMonths[monthIndex].ar
    };
  } catch (error) {
    console.error("Error calculating Islamic date:", error);
    // Fallback to a default date
    return {
      day: 1,
      month: 1,
      year: 1446,
      monthName: islamicMonths[0].en,
      monthNameArabic: islamicMonths[0].ar
    };
  }
};

export const formatIslamicDate = (islamicDate: IslamicDate, showArabic: boolean = false): string => {
  if (showArabic) {
    return `${islamicDate.day} ${islamicDate.monthNameArabic} ${islamicDate.year}`;
  }
  return `${islamicDate.day} ${islamicDate.monthName} ${islamicDate.year} AH`;
};
