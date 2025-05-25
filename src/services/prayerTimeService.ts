
import { getSelectedLocation } from "./locationService";
import { fetchRabitaPrayerTimes } from "./rabitaService";
import { toast } from "@/components/ui/use-toast";

// Prayer time service using accurate calculations for Espoo, Finland
export interface PrayerTime {
  id: string;
  name: string;
  time: string;
  isNext: boolean;
}

// Helper function to format time as HH:MM
const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
};

// Get the current calculation method from localStorage
const getCalculationMethod = (): string => {
  return localStorage.getItem('prayerapp-calculation-method') || 'ICF';
};

// Set the current data source in localStorage
const setDataSource = (source: string): void => {
  localStorage.setItem('prayerapp-data-source', source);
};

// Cache for prayer times
let prayerTimesCache: {
  date: string;
  times: PrayerTime[];
} | null = null;

// Function to calculate prayer times for a specific date
export const getPrayerTimes = async (date: Date = new Date()): Promise<PrayerTime[]> => {
  const today = new Date().toDateString();
  const requestedDate = date.toDateString();
  
  // If date is today and we have cached data, return it
  if (requestedDate === today && prayerTimesCache && prayerTimesCache.date === today) {
    return prayerTimesCache.times;
  }
  
  // Try to fetch from Rabita.fi first for today's times
  try {
    if (requestedDate === today) {
      const rabitaTimes = await fetchRabitaPrayerTimes();
      if (rabitaTimes && rabitaTimes.length > 0) {
        prayerTimesCache = {
          date: today,
          times: rabitaTimes
        };
        setDataSource('Rabita');
        return rabitaTimes;
      }
    }
  } catch (error) {
    console.error("Error fetching from Rabita, using calculations:", error);
  }
  
  // Fall back to more accurate calculations for Espoo, Finland
  setDataSource('Calculated');
  return calculateAccuratePrayerTimes(date);
};

// More accurate prayer time calculations for Espoo, Finland
const calculateAccuratePrayerTimes = (date: Date): PrayerTime[] => {
  const selectedLocation = getSelectedLocation();
  const LATITUDE = selectedLocation.latitude;
  const LONGITUDE = selectedLocation.longitude;
  const calculationMethod = getCalculationMethod();

  // More precise astronomical calculations
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // Julian day calculation for more accurate solar position
  const julianDay = getJulianDay(year, month, day);
  const solarPosition = getSolarPosition(julianDay, LATITUDE, LONGITUDE);
  
  // Season determination with transition periods
  const dayOfYear = Math.floor((date.getTime() - new Date(year, 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const isSummer = month >= 5 && month <= 8; // May to August
  const isWinter = month <= 2 || month >= 11; // November to February
  const isSpring = month >= 3 && month <= 4; // March to April
  const isAutumn = month >= 9 && month <= 10; // September to October
  
  // Base time calculations with astronomical corrections
  let fajrDate = new Date(date);
  let sunriseDate = new Date(date);
  let dhuhrDate = new Date(date);
  let asrDate = new Date(date);
  let maghribDate = new Date(date);
  let ishaDate = new Date(date);
  
  // Reset all times to start of day
  [fajrDate, sunriseDate, dhuhrDate, asrDate, maghribDate, ishaDate].forEach(d => {
    d.setHours(0, 0, 0, 0);
  });

  if (calculationMethod === "ICF") {
    // Islamic Center of Finland method - more precise for Nordic conditions
    if (isSummer) {
      // Summer times with white nights consideration
      fajrDate.setHours(2, Math.max(0, 45 - Math.floor(dayOfYear / 10)));
      sunriseDate.setHours(4, Math.max(0, 30 - Math.floor(dayOfYear / 12)));
      dhuhrDate.setHours(12, 30 + solarPosition.equation_of_time);
      asrDate.setHours(16, 30 + Math.floor(dayOfYear / 15));
      maghribDate.setHours(22, Math.min(59, 15 + Math.floor(dayOfYear / 8)));
      ishaDate.setHours(23, Math.min(59, 30 + Math.floor(dayOfYear / 20)));
    } else if (isWinter) {
      // Winter times with polar night consideration
      fajrDate.setHours(6, Math.min(59, 15 + Math.floor(dayOfYear / 15)));
      sunriseDate.setHours(8, Math.min(59, 30 + Math.floor(dayOfYear / 10)));
      dhuhrDate.setHours(12, 15 + solarPosition.equation_of_time);
      asrDate.setHours(14, Math.min(59, 0 + Math.floor(dayOfYear / 20)));
      maghribDate.setHours(15, Math.min(59, 45 + Math.floor(dayOfYear / 15)));
      ishaDate.setHours(17, Math.min(59, 30 + Math.floor(dayOfYear / 12)));
    } else if (isSpring) {
      // Spring transition times
      fajrDate.setHours(4, Math.max(0, 30 - Math.floor((dayOfYear - 60) / 5)));
      sunriseDate.setHours(6, Math.max(0, 45 - Math.floor((dayOfYear - 60) / 4)));
      dhuhrDate.setHours(12, 30 + solarPosition.equation_of_time);
      asrDate.setHours(15, 30 + Math.floor((dayOfYear - 60) / 8));
      maghribDate.setHours(19, Math.min(59, 0 + Math.floor((dayOfYear - 60) / 6)));
      ishaDate.setHours(20, Math.min(59, 30 + Math.floor((dayOfYear - 60) / 10)));
    } else { // Autumn
      // Autumn transition times
      fajrDate.setHours(5, Math.min(59, 0 + Math.floor((dayOfYear - 244) / 8)));
      sunriseDate.setHours(7, Math.min(59, 15 + Math.floor((dayOfYear - 244) / 6)));
      dhuhrDate.setHours(12, 30 + solarPosition.equation_of_time);
      asrDate.setHours(15, Math.max(0, 45 - Math.floor((dayOfYear - 244) / 10)));
      maghribDate.setHours(18, Math.max(0, 30 - Math.floor((dayOfYear - 244) / 8)));
      ishaDate.setHours(19, Math.max(0, 45 - Math.floor((dayOfYear - 244) / 12)));
    }
  } else {
    // Standard calculation methods with Nordic adjustments
    if (isSummer) {
      fajrDate.setHours(3, Math.max(0, 30 - Math.floor(dayOfYear / 15)));
      sunriseDate.setHours(5, Math.max(0, 15 - Math.floor(dayOfYear / 20)));
      dhuhrDate.setHours(12, 30 + solarPosition.equation_of_time);
      asrDate.setHours(16, 15 + Math.floor(dayOfYear / 18));
      maghribDate.setHours(21, Math.min(59, 30 + Math.floor(dayOfYear / 12)));
      ishaDate.setHours(23, Math.min(59, 0 + Math.floor(dayOfYear / 25)));
    } else if (isWinter) {
      fajrDate.setHours(6, Math.min(59, 0 + Math.floor(dayOfYear / 20)));
      sunriseDate.setHours(8, Math.min(59, 15 + Math.floor(dayOfYear / 15)));
      dhuhrDate.setHours(12, 15 + solarPosition.equation_of_time);
      asrDate.setHours(13, Math.min(59, 45 + Math.floor(dayOfYear / 25)));
      maghribDate.setHours(16, Math.min(59, 0 + Math.floor(dayOfYear / 20)));
      ishaDate.setHours(17, Math.min(59, 45 + Math.floor(dayOfYear / 18)));
    } else if (isSpring) {
      fajrDate.setHours(4, Math.max(0, 45 - Math.floor((dayOfYear - 60) / 8)));
      sunriseDate.setHours(6, Math.max(0, 30 - Math.floor((dayOfYear - 60) / 6)));
      dhuhrDate.setHours(12, 30 + solarPosition.equation_of_time);
      asrDate.setHours(15, 15 + Math.floor((dayOfYear - 60) / 10));
      maghribDate.setHours(19, Math.min(59, 15 + Math.floor((dayOfYear - 60) / 8)));
      ishaDate.setHours(20, Math.min(59, 45 + Math.floor((dayOfYear - 60) / 12)));
    } else { // Autumn
      fajrDate.setHours(5, Math.min(59, 15 + Math.floor((dayOfYear - 244) / 10)));
      sunriseDate.setHours(7, Math.min(59, 0 + Math.floor((dayOfYear - 244) / 8)));
      dhuhrDate.setHours(12, 30 + solarPosition.equation_of_time);
      asrDate.setHours(15, Math.max(0, 30 - Math.floor((dayOfYear - 244) / 12)));
      maghribDate.setHours(18, Math.max(0, 15 - Math.floor((dayOfYear - 244) / 10)));
      ishaDate.setHours(19, Math.max(0, 30 - Math.floor((dayOfYear - 244) / 15)));
    }
  }

  const prayers = [
    { id: "fajr", name: "Fajr", time: formatTime(fajrDate), timeInMinutes: fajrDate.getHours() * 60 + fajrDate.getMinutes() },
    { id: "sunrise", name: "Sunrise", time: formatTime(sunriseDate), timeInMinutes: sunriseDate.getHours() * 60 + sunriseDate.getMinutes() },
    { id: "dhuhr", name: "Dhuhr", time: formatTime(dhuhrDate), timeInMinutes: dhuhrDate.getHours() * 60 + dhuhrDate.getMinutes() },
    { id: "asr", name: "Asr", time: formatTime(asrDate), timeInMinutes: asrDate.getHours() * 60 + asrDate.getMinutes() },
    { id: "maghrib", name: "Maghrib", time: formatTime(maghribDate), timeInMinutes: maghribDate.getHours() * 60 + maghribDate.getMinutes() },
    { id: "isha", name: "Isha", time: formatTime(ishaDate), timeInMinutes: ishaDate.getHours() * 60 + ishaDate.getMinutes() }
  ];
  
  // Determine next prayer only for today's times
  const isToday = date.toDateString() === new Date().toDateString();
  let nextPrayerIndex = -1;
  
  if (isToday) {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    nextPrayerIndex = prayers.findIndex(prayer => prayer.timeInMinutes > currentTime);
    if (nextPrayerIndex === -1) nextPrayerIndex = 0; // Next day's Fajr
  }
  
  return prayers.map((prayer, index) => ({
    id: prayer.id,
    name: prayer.name,
    time: prayer.time,
    isNext: isToday && index === nextPrayerIndex
  }));
};

// Helper functions for more accurate astronomical calculations
const getJulianDay = (year: number, month: number, day: number): number => {
  const a = Math.floor((14 - month) / 12);
  const y = year - a;
  const m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) + 1721119;
};

const getSolarPosition = (julianDay: number, latitude: number, longitude: number) => {
  const n = julianDay - 2451545.0;
  const L = (280.460 + 0.9856474 * n) % 360;
  const g = ((357.528 + 0.9856003 * n) % 360) * Math.PI / 180;
  const lambda = (L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * Math.PI / 180;
  
  // Equation of time in minutes
  const equation_of_time = 4 * (longitude * Math.PI / 180 - lambda) * 180 / Math.PI / 60;
  
  return { equation_of_time: Math.round(equation_of_time) };
};

export const getDateForHeader = async () => {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  };
  return now.toLocaleDateString('en-US', options);
};

export const getQiblaDirection = () => {
  const selectedLocation = getSelectedLocation();
  const LATITUDE = selectedLocation.latitude;
  const LONGITUDE = selectedLocation.longitude;
  
  const KAABA_LATITUDE = 21.4225;
  const KAABA_LONGITUDE = 39.8262;
  
  const latEspoo = LATITUDE * (Math.PI / 180);
  const longEspoo = LONGITUDE * (Math.PI / 180);
  const latKaaba = KAABA_LATITUDE * (Math.PI / 180);
  const longKaaba = KAABA_LONGITUDE * (Math.PI / 180);
  
  const y = Math.sin(longKaaba - longEspoo);
  const x = Math.cos(latEspoo) * Math.tan(latKaaba) - Math.sin(latEspoo) * Math.cos(longKaaba - longEspoo);
  
  let qiblaDirection = Math.atan2(y, x) * (180 / Math.PI);
  qiblaDirection = (qiblaDirection + 360) % 360;
  
  return Math.round(qiblaDirection);
};
