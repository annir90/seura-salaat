
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

// More accurate Islamic calendar conversion
export const getIslamicDate = (gregorianDate: Date = new Date()): IslamicDate => {
  try {
    // Improved calculation using more precise Islamic calendar constants
    const hijriEpoch = new Date(622, 6, 16); // July 16, 622 CE (start of Islamic calendar)
    const daysSinceEpoch = Math.floor((gregorianDate.getTime() - hijriEpoch.getTime()) / (1000 * 60 * 60 * 24));
    
    // More accurate Islamic year calculation (using 354.367 days per year)
    const islamicYearLength = 354.367;
    const hijriYear = Math.floor(daysSinceEpoch / islamicYearLength) + 1;
    
    // Calculate remaining days in the current year
    const dayInYear = Math.floor(daysSinceEpoch % islamicYearLength);
    
    // Islamic months alternate between 30 and 29 days, with some variation
    const monthLengths = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29];
    
    let totalDays = 0;
    let month = 1;
    
    // Find the correct month
    for (let i = 0; i < 12; i++) {
      if (totalDays + monthLengths[i] > dayInYear) {
        month = i + 1;
        break;
      }
      totalDays += monthLengths[i];
    }
    
    const day = Math.max(1, dayInYear - totalDays + 1);
    const monthIndex = Math.min(Math.max(month - 1, 0), 11);
    
    return {
      day: Math.min(day, 30),
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
