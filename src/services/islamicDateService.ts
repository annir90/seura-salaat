
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

// Corrected Islamic calendar conversion
export const getIslamicDate = (gregorianDate: Date = new Date()): IslamicDate => {
  try {
    console.log("getIslamicDate called with:", gregorianDate);
    
    // Current Islamic date: 1 Dhū al-Ḥijjah, 1446 AH corresponds to today
    const currentGregorian = new Date(2025, 4, 29); // May 29, 2025 (today)
    const currentIslamic = { day: 1, month: 12, year: 1446 }; // 1 Dhū al-Ḥijjah, 1446 AH
    
    // Calculate difference in days
    const daysDiff = Math.floor((gregorianDate.getTime() - currentGregorian.getTime()) / (1000 * 60 * 60 * 24));
    console.log("Days difference from reference:", daysDiff);
    
    // Start with the current Islamic date
    let islamicDay = currentIslamic.day + daysDiff;
    let islamicMonth = currentIslamic.month;
    let islamicYear = currentIslamic.year;
    
    // Month lengths in Islamic calendar (alternating 30/29 days with some adjustments)
    const getMonthLength = (month: number, year: number) => {
      if (month < 1 || month > 12) {
        console.warn("Invalid month:", month);
        return 29; // Default fallback
      }
      
      // Basic alternating pattern: odd months = 30 days, even months = 29 days
      // With Dhū al-Ḥijjah having 30 days in leap years
      if (month % 2 === 1) return 30; // Odd months: 30 days
      if (month === 12) {
        // Dhū al-Ḥijjah: 29 days normally, 30 in leap years
        // Simplified leap year calculation (11 leap years in 30-year cycle)
        const cycleYear = year % 30;
        const leapYears = [2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29];
        return leapYears.includes(cycleYear) ? 30 : 29;
      }
      return 29; // Even months: 29 days
    };
    
    // Adjust for month overflow
    while (islamicDay > getMonthLength(islamicMonth, islamicYear)) {
      islamicDay -= getMonthLength(islamicMonth, islamicYear);
      islamicMonth++;
      if (islamicMonth > 12) {
        islamicMonth = 1;
        islamicYear++;
      }
    }
    
    // Adjust for negative days (going backwards)
    while (islamicDay < 1) {
      islamicMonth--;
      if (islamicMonth < 1) {
        islamicMonth = 12;
        islamicYear--;
      }
      islamicDay += getMonthLength(islamicMonth, islamicYear);
    }
    
    const monthIndex = Math.min(Math.max(islamicMonth - 1, 0), 11);
    
    const result = {
      day: islamicDay,
      month: islamicMonth,
      year: islamicYear,
      monthName: islamicMonths[monthIndex]?.en || "Unknown",
      monthNameArabic: islamicMonths[monthIndex]?.ar || "غير معروف"
    };
    
    console.log("Calculated Islamic date:", result);
    return result;
    
  } catch (error) {
    console.error("Error calculating Islamic date:", error);
    // Fallback to the current known date
    return {
      day: 1,
      month: 12,
      year: 1446,
      monthName: islamicMonths[11]?.en || "Dhu al-Hijjah",
      monthNameArabic: islamicMonths[11]?.ar || "ذو الحجة"
    };
  }
};

export const formatIslamicDate = (islamicDate: IslamicDate, showArabic: boolean = false): string => {
  try {
    if (!islamicDate) {
      console.error("formatIslamicDate received null islamicDate");
      return "";
    }
    
    const { day, month, year, monthName, monthNameArabic } = islamicDate;
    
    if (showArabic) {
      const arabicName = monthNameArabic || "غير معروف";
      const formatted = `${day} ${arabicName} ${year}`;
      console.log("Formatted Arabic Islamic date:", formatted);
      return formatted;
    }
    
    const englishName = monthName || "Unknown";
    const formatted = `${day} ${englishName} ${year} AH`;
    console.log("Formatted English Islamic date:", formatted);
    return formatted;
    
  } catch (error) {
    console.error("Error formatting Islamic date:", error, "Input:", islamicDate);
    return "Date unavailable";
  }
};
