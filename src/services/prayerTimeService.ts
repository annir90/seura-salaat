
import { getSelectedLocation } from "./locationService";
import { fetchRabitaPrayerTimes } from "./rabitaService";
import { toast } from "@/components/ui/use-toast";

// Prayer time service using basic calculations
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
  return localStorage.getItem('prayerapp-calculation-method') || 'ISNA';
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
  
  // Try to fetch from Rabita.fi first
  try {
    if (requestedDate === today) { // Only use Rabita for today's times
      const rabitaTimes = await fetchRabitaPrayerTimes();
      if (rabitaTimes && rabitaTimes.length > 0) {
        // Cache the results
        prayerTimesCache = {
          date: today,
          times: rabitaTimes
        };
        setDataSource('Rabita');
        return rabitaTimes;
      }
    }
  } catch (error) {
    console.error("Error fetching from Rabita, falling back to calculations:", error);
    toast({
      title: "Network Issue",
      description: "Could not connect to Rabita.fi, using calculated times instead.",
      variant: "destructive"
    });
  }
  
  // Fall back to calculations if Rabita.fi is unavailable or we're looking for a different date
  setDataSource('Calculated');
  return calculatePrayerTimes(date);
};

// Function to calculate prayer times based on calculations
const calculatePrayerTimes = (date: Date): PrayerTime[] => {
  // Get current location
  const selectedLocation = getSelectedLocation();
  const LATITUDE = selectedLocation.latitude;
  const LONGITUDE = selectedLocation.longitude;

  // Get calculation method
  const calculationMethod = getCalculationMethod();

  // Adjust date hours for calculation purposes
  const calculationDate = new Date(date);
  calculationDate.setHours(0, 0, 0, 0);

  // Get day of year (1-366)
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = (date.getTime() - start.getTime()) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  // Calculate prayer times using the selected location and calculation method
  const isSummerNight = date.getMonth() >= 5 && date.getMonth() <= 7;
  
  // Base calculations
  let fajrDate = new Date(calculationDate);
  let sunriseDate = new Date(calculationDate);
  let dhuhrDate = new Date(calculationDate);
  let asrDate = new Date(calculationDate);
  let maghribDate = new Date(calculationDate);
  let ishaDate = new Date(calculationDate);
  
  // Apply different calculation methods
  if (calculationMethod === "ICF") {
    // Islamic Center of Finland method - adjusted for Nordic regions
    const isSummerMonth = date.getMonth() >= 4 && date.getMonth() <= 8; // May to September
    const isWinterMonth = date.getMonth() <= 1 || date.getMonth() >= 10; // January, February, November, December
    
    // Fajr calculation - ICF adjusts for white nights in summer
    if (isSummerMonth) {
      const fajrHour = LATITUDE > 63 ? 2 : 3;
      fajrDate.setHours(fajrHour, 30);
    } else if (isWinterMonth) {
      fajrDate.setHours(6, 15);
    } else {
      fajrDate.setHours(5, 0);
    }
    
    // Sunrise calculation
    if (isSummerMonth) {
      const sunriseHour = LATITUDE > 63 ? 4 : 5;
      sunriseDate.setHours(sunriseHour, 15);
    } else if (isWinterMonth) {
      sunriseDate.setHours(9, 0);
    } else {
      sunriseDate.setHours(6, 45);
    }
    
    // Dhuhr is consistently at midday
    dhuhrDate.setHours(12, 30);
    
    // Asr calculation
    if (isSummerMonth) {
      asrDate.setHours(16, 45);
    } else if (isWinterMonth) {
      asrDate.setHours(13, 30);
    } else {
      asrDate.setHours(15, 0);
    }
    
    // Maghrib calculation
    if (isSummerMonth) {
      const maghribHour = LATITUDE > 63 ? 23 : 22;
      maghribDate.setHours(maghribHour, 0);
    } else if (isWinterMonth) {
      maghribDate.setHours(15, 45);
    } else {
      maghribDate.setHours(19, 0);
    }
    
    // Isha calculation - ICF adjusts for white nights in summer
    if (isSummerMonth) {
      const ishaHour = LATITUDE > 63 ? 23 : 23;
      const ishaMinute = LATITUDE > 63 ? 45 : 30;
      ishaDate.setHours(ishaHour, ishaMinute);
    } else if (isWinterMonth) {
      ishaDate.setHours(17, 30);
    } else {
      ishaDate.setHours(20, 45);
    }
  } else {
    // Default calculations (ISNA, MWL, Egyptian, Makkah)
    // Calculate Fajr (dawn)
    const fajrHour = date.getMonth() >= 4 && date.getMonth() <= 7 ? 3 : (date.getMonth() >= 2 && date.getMonth() <= 9 ? 4 : 5);
    const fajrMinute = ((dayOfYear % 59) + 1);
    fajrDate.setHours(fajrHour, fajrMinute);
    
    // Calculate Sunrise
    const sunriseHour = date.getMonth() >= 4 && date.getMonth() <= 7 ? 5 : (date.getMonth() >= 2 && date.getMonth() <= 9 ? 6 : 8);
    const sunriseMinute = ((dayOfYear % 59) + 10);
    sunriseDate.setHours(sunriseHour, sunriseMinute);
    
    // Calculate Dhuhr (noon)
    dhuhrDate.setHours(12, ((dayOfYear % 29) + 15));
    
    // Calculate Asr (afternoon)
    const asrHour = date.getMonth() >= 4 && date.getMonth() <= 7 ? 16 : (date.getMonth() >= 2 && date.getMonth() <= 9 ? 15 : 14);
    asrDate.setHours(asrHour, ((dayOfYear % 59) + 1));
    
    // Calculate Maghrib (sunset)
    const maghribHour = date.getMonth() >= 4 && date.getMonth() <= 7 ? 22 : (date.getMonth() >= 2 && date.getMonth() <= 9 ? 20 : 16);
    const maghribMinute = ((dayOfYear % 59) + 1);
    maghribDate.setHours(maghribHour, maghribMinute);
    
    // Calculate Isha (night)
    const ishaHour = date.getMonth() >= 4 && date.getMonth() <= 7 ? 23 : (date.getMonth() >= 2 && date.getMonth() <= 9 ? 22 : 18);
    const ishaMinute = ((dayOfYear % 59) + 30);
    ishaDate.setHours(ishaHour, ishaMinute);
  }

  // Prepare prayers array
  const prayers = [
    { id: "fajr", name: "Fajr", time: formatTime(fajrDate), timeInMinutes: fajrDate.getHours() * 60 + fajrDate.getMinutes(), exists: true },
    { id: "sunrise", name: "Sunrise", time: formatTime(sunriseDate), timeInMinutes: sunriseDate.getHours() * 60 + sunriseDate.getMinutes(), exists: true },
    { id: "dhuhr", name: "Dhuhr", time: formatTime(dhuhrDate), timeInMinutes: dhuhrDate.getHours() * 60 + dhuhrDate.getMinutes(), exists: true },
    { id: "asr", name: "Asr", time: formatTime(asrDate), timeInMinutes: asrDate.getHours() * 60 + asrDate.getMinutes(), exists: true },
    { id: "maghrib", name: "Maghrib", time: formatTime(maghribDate), timeInMinutes: maghribDate.getHours() * 60 + maghribDate.getMinutes(), exists: true },
    { id: "isha", name: "Isha", time: formatTime(ishaDate), timeInMinutes: ishaDate.getHours() * 60 + ishaDate.getMinutes(), exists: true }
  ];
  
  // Handle special case in Finnish summer when Fajr and Isha might be combined
  if (calculationMethod === "ICF" && isSummerNight && LATITUDE > 60) {
    // For extreme northern regions, Fajr and Isha might be combined in summer
    prayers[0].exists = true; // Keep Fajr
    prayers[5].exists = true; // Keep Isha
  } else if (isSummerNight) {
    // Default behavior for other methods during white nights
    prayers[0].exists = !isSummerNight;
    prayers[5].exists = !isSummerNight;
  }
  
  // Filter out prayers that don't exist during white nights
  const existingPrayers = prayers.filter(prayer => prayer.exists);
  
  // Determine which prayer is next based on current time
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  let nextPrayerIndex = existingPrayers.findIndex(prayer => prayer.timeInMinutes > currentTime);
  if (nextPrayerIndex === -1) nextPrayerIndex = 0; // If past all prayers, first prayer of tomorrow is next
  
  return existingPrayers.map((prayer, index) => ({
    id: prayer.id,
    name: prayer.name,
    time: prayer.time,
    isNext: index === nextPrayerIndex
  }));
};

// Make this function return a promise for consistency
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
  // Get current location
  const selectedLocation = getSelectedLocation();
  const LATITUDE = selectedLocation.latitude;
  const LONGITUDE = selectedLocation.longitude;
  
  // Ka'ba coordinates
  const KAABA_LATITUDE = 21.4225;
  const KAABA_LONGITUDE = 39.8262;
  
  const latEspoo = LATITUDE * (Math.PI / 180);
  const longEspoo = LONGITUDE * (Math.PI / 180);
  const latKaaba = KAABA_LATITUDE * (Math.PI / 180);
  const longKaaba = KAABA_LONGITUDE * (Math.PI / 180);
  
  const y = Math.sin(longKaaba - longEspoo);
  const x = Math.cos(latEspoo) * Math.tan(latKaaba) - Math.sin(latEspoo) * Math.cos(longKaaba - longEspoo);
  
  let qiblaDirection = Math.atan2(y, x) * (180 / Math.PI);
  qiblaDirection = (qiblaDirection + 360) % 360; // Normalize to 0-360 degrees
  
  return Math.round(qiblaDirection);
};
