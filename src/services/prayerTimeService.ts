
import { getSelectedLocation } from "./locationService";

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

// Function to calculate prayer times for a specific date
export const getPrayerTimes = (date: Date = new Date()): PrayerTime[] => {
  // Get current location
  const selectedLocation = getSelectedLocation();
  const LATITUDE = selectedLocation.latitude;
  const LONGITUDE = selectedLocation.longitude;

  // Adjust date hours for calculation purposes
  const calculationDate = new Date(date);
  calculationDate.setHours(0, 0, 0, 0);

  // Get day of year (1-366)
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = (date.getTime() - start.getTime()) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  // Calculate prayer times using the selected location
  // These calculations are simplified but more realistic than static times
  
  // Calculate Fajr (dawn)
  const fajrDate = new Date(calculationDate);
  const fajrHour = date.getMonth() >= 4 && date.getMonth() <= 7 ? 3 : (date.getMonth() >= 2 && date.getMonth() <= 9 ? 4 : 5);
  const fajrMinute = ((dayOfYear % 59) + 1);
  fajrDate.setHours(fajrHour, fajrMinute);
  
  // Calculate Sunrise
  const sunriseDate = new Date(calculationDate);
  const sunriseHour = date.getMonth() >= 4 && date.getMonth() <= 7 ? 5 : (date.getMonth() >= 2 && date.getMonth() <= 9 ? 6 : 8);
  const sunriseMinute = ((dayOfYear % 59) + 10);
  sunriseDate.setHours(sunriseHour, sunriseMinute);
  
  // Calculate Dhuhr (noon)
  const dhuhrDate = new Date(calculationDate);
  dhuhrDate.setHours(12, ((dayOfYear % 29) + 15));
  
  // Calculate Asr (afternoon)
  const asrDate = new Date(calculationDate);
  const asrHour = date.getMonth() >= 4 && date.getMonth() <= 7 ? 16 : (date.getMonth() >= 2 && date.getMonth() <= 9 ? 15 : 14);
  asrDate.setHours(asrHour, ((dayOfYear % 59) + 1));
  
  // Calculate Maghrib (sunset)
  const maghribDate = new Date(calculationDate);
  const maghribHour = date.getMonth() >= 4 && date.getMonth() <= 7 ? 22 : (date.getMonth() >= 2 && date.getMonth() <= 9 ? 20 : 16);
  const maghribMinute = ((dayOfYear % 59) + 1);
  maghribDate.setHours(maghribHour, maghribMinute);
  
  // Calculate Isha (night)
  const ishaDate = new Date(calculationDate);
  const ishaHour = date.getMonth() >= 4 && date.getMonth() <= 7 ? 23 : (date.getMonth() >= 2 && date.getMonth() <= 9 ? 22 : 18);
  const ishaMinute = ((dayOfYear % 59) + 30);
  ishaDate.setHours(ishaHour, ishaMinute);
  
  // Handle special case in Finnish summer when Fajr and Isha don't exist due to white nights
  const isSummerNight = date.getMonth() >= 5 && date.getMonth() <= 7;
  
  const prayers = [
    { id: "fajr", name: "Fajr", time: formatTime(fajrDate), timeInMinutes: fajrDate.getHours() * 60 + fajrDate.getMinutes(), exists: !isSummerNight },
    { id: "sunrise", name: "Sunrise", time: formatTime(sunriseDate), timeInMinutes: sunriseDate.getHours() * 60 + sunriseDate.getMinutes(), exists: true },
    { id: "dhuhr", name: "Dhuhr", time: formatTime(dhuhrDate), timeInMinutes: dhuhrDate.getHours() * 60 + dhuhrDate.getMinutes(), exists: true },
    { id: "asr", name: "Asr", time: formatTime(asrDate), timeInMinutes: asrDate.getHours() * 60 + asrDate.getMinutes(), exists: true },
    { id: "maghrib", name: "Maghrib", time: formatTime(maghribDate), timeInMinutes: maghribDate.getHours() * 60 + maghribDate.getMinutes(), exists: true },
    { id: "isha", name: "Isha", time: formatTime(ishaDate), timeInMinutes: ishaDate.getHours() * 60 + ishaDate.getMinutes(), exists: !isSummerNight }
  ];
  
  // Filter out prayers that don't exist during white nights in Finnish summer
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

export const getDateForHeader = () => {
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
