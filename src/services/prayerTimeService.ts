
import { getSelectedLocation } from "./locationService";
import { fetchRabitaPrayerTimes } from "./rabitaService";
import { toast } from "@/components/ui/use-toast";
import { getTranslation } from "./translationService";
import { notificationService } from "./notificationService";

// Prayer time service using API for Espoo, Finland
export interface PrayerTime {
  id: string;
  name: string;
  time: string;
  isNext?: boolean;
}

// Helper function to format time as HH:MM with null checks
const formatTime = (time: string | null | undefined): string => {
  console.log("formatTime called with:", time);
  if (!time || typeof time !== 'string') {
    console.warn("formatTime received null/undefined/invalid time:", time);
    return "00:00";
  }
  try {
    return time.substring(0, 5); // Extract HH:MM from HH:MM format
  } catch (error) {
    console.error("Error formatting time:", error, "Input:", time);
    return "00:00";
  }
};

// Cache for prayer times
let prayerTimesCache: {
  date: string;
  times: PrayerTime[];
} | null = null;

// Helper function to generate monthly file name
const getMonthlyFileName = (date: Date): string => {
  const months = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${month}-${year}.json`;
};

// Function to fetch prayer times from monthly JSON files
const fetchPrayerTimesFromJSON = async (date: Date): Promise<PrayerTime[]> => {
  try {
    const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format
    const monthlyFileName = getMonthlyFileName(date);
    
    console.log("Loading prayer times for date:", dateString);
    console.log("Monthly file:", monthlyFileName);
    
    const response = await fetch(`/data/${monthlyFileName}`);
    if (!response.ok) {
      throw new Error(`Failed to load prayer schedule: ${response.status} for file: ${monthlyFileName}`);
    }
    
    const schedule = await response.json();
    console.log("Monthly prayer schedule loaded for", monthlyFileName);
    
    const daySchedule = schedule[dateString];
    if (!daySchedule) {
      throw new Error(`No prayer times found for date: ${dateString} in ${monthlyFileName}`);
    }
    
    console.log("Prayer timings for today:", daySchedule);
    
    const t = getTranslation();
    
    // Map JSON data to our format with translations and null checks
    const prayers = [
      { id: "fajr", name: t.fajr, time: formatTime(daySchedule.fajr) },
      { id: "sunrise", name: t.sunrise, time: formatTime(daySchedule.sunrise) },
      { id: "dhuhr", name: t.dhuhr, time: formatTime(daySchedule.dhuhr) },
      { id: "asr", name: t.asr, time: formatTime(daySchedule.asr) },
      { id: "maghrib", name: t.maghrib, time: formatTime(daySchedule.maghrib) },
      { id: "isha", name: t.isha, time: formatTime(daySchedule.isha) }
    ].filter(prayer => prayer.time !== "00:00"); // Skip invalid times
    
    console.log("Processed prayers:", prayers);
    
    return prayers;
    
  } catch (error) {
    console.error("Error loading from JSON schedule:", error);
    throw error;
  }
};

// Helper function to convert time string to minutes since midnight
const timeToMinutes = (timeStr: string): number => {
  if (!timeStr || timeStr === "00:00") return -1;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// Function to determine which prayer is next
const markNextPrayer = (prayers: PrayerTime[]): PrayerTime[] => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  console.log("Current time in minutes:", currentMinutes);
  
  // Find the next prayer time
  let nextPrayerIndex = -1;
  
  for (let i = 0; i < prayers.length; i++) {
    const prayerMinutes = timeToMinutes(prayers[i].time);
    
    // Skip sunrise as it's not a prayer
    if (prayers[i].id === 'sunrise') continue;
    if (prayerMinutes === -1) continue; // Skip invalid times
    
    // Handle Isha prayer (next day)
    const adjustedPrayerMinutes = prayers[i].id === 'isha' && prayerMinutes < 60 
      ? prayerMinutes + (24 * 60) // Add 24 hours for next day
      : prayerMinutes;
    
    if (adjustedPrayerMinutes > currentMinutes) {
      nextPrayerIndex = i;
      break;
    }
  }
  
  // If no prayer found for today, Fajr is next (tomorrow)
  if (nextPrayerIndex === -1) {
    const fajrIndex = prayers.findIndex(p => p.id === 'fajr');
    if (fajrIndex !== -1) {
      nextPrayerIndex = fajrIndex;
    }
  }
  
  // Mark the next prayer
  const updatedPrayers = prayers.map((prayer, index) => ({
    ...prayer,
    isNext: index === nextPrayerIndex
  }));
  
  console.log("Next prayer marked:", updatedPrayers.find(p => p.isNext)?.name);
  
  return updatedPrayers;
};

// Function to calculate prayer times for a specific date
export const getPrayerTimes = async (date: Date = new Date()): Promise<PrayerTime[]> => {
  const today = new Date().toDateString();
  const requestedDate = date.toDateString();
  
  console.log("getPrayerTimes called for date:", requestedDate);
  
  // If date is today and we have cached data, return it
  if (requestedDate === today && prayerTimesCache && prayerTimesCache.date === today) {
    console.log("Returning cached prayer times");
    return prayerTimesCache.times;
  }
  
  try {
    // Fetch from JSON schedule
    const jsonTimes = await fetchPrayerTimesFromJSON(date);
    
    // Mark which prayer is next (only for today)
    const timesWithNext = requestedDate === today ? markNextPrayer(jsonTimes) : jsonTimes;
    
    if (requestedDate === today) {
      prayerTimesCache = {
        date: today,
        times: timesWithNext
      };
      
      // Schedule notifications for today's prayers
      try {
        await notificationService.scheduleAllPrayerNotifications(timesWithNext);
      } catch (error) {
        console.error("Error scheduling notifications:", error);
      }
    }
    
    return timesWithNext;
  } catch (error) {
    console.error("Error loading prayer times from JSON:", error);
    
    // Try Rabita.fi as fallback for today only
    if (requestedDate === today) {
      try {
        console.log("Trying Rabita fallback");
        const rabitaTimes = await fetchRabitaPrayerTimes();
        if (rabitaTimes && rabitaTimes.length > 0) {
          // Mark next prayer for fallback times too
          const fallbackWithNext = markNextPrayer(rabitaTimes);
          
          // Schedule notifications for fallback times too
          try {
            await notificationService.scheduleAllPrayerNotifications(fallbackWithNext);
          } catch (error) {
            console.error("Error scheduling notifications for fallback times:", error);
          }
          return fallbackWithNext;
        }
      } catch (rabitaError) {
        console.error("Rabita fallback also failed:", rabitaError);
      }
    }
    
    // Return empty array if all methods fail
    console.warn("All prayer time sources failed, returning empty array");
    return [];
  }
};

export const getDateForHeader = async () => {
  try {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    };
    const dateString = now.toLocaleDateString('en-US', options);
    console.log("Generated date for header:", dateString);
    return dateString;
  } catch (error) {
    console.error("Error generating date for header:", error);
    return "Today";
  }
};

export const getQiblaDirection = () => {
  try {
    const selectedLocation = getSelectedLocation();
    if (!selectedLocation) {
      console.error("No selected location found");
      return 0;
    }
    
    const LATITUDE = selectedLocation.latitude;
    const LONGITUDE = selectedLocation.longitude;
    
    console.log("Calculating Qibla for location:", { LATITUDE, LONGITUDE });
    
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
    
    const roundedDirection = Math.round(qiblaDirection);
    console.log("Calculated Qibla direction:", roundedDirection);
    
    return roundedDirection;
  } catch (error) {
    console.error("Error calculating Qibla direction:", error);
    return 0;
  }
};
