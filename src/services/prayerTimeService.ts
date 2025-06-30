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
  isNext: boolean;
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

// Function to determine next prayer with accurate transition
const determineNextPrayer = (prayers: PrayerTime[]): PrayerTime[] => {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  console.log(`Current time: ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')} (${currentTime} minutes)`);
  
  // Filter out sunrise as it's not a prayer
  const actualPrayers = prayers.filter(prayer => prayer.id !== 'sunrise');
  
  // Convert all prayer times to minutes and handle midnight crossing
  const prayerTimesWithMinutes = actualPrayers.map(prayer => {
    if (!prayer.time || prayer.time === "00:00") {
      return { ...prayer, timeInMinutes: -1 };
    }
    
    const [hours, minutes] = prayer.time.split(":").map(Number);
    let prayerTime = hours * 60 + minutes;
    
    // Handle prayers that cross midnight (like Isha and next day's Fajr)
    // If prayer time is very early (00:xx to 05:xx), treat it as next day
    if (hours >= 0 && hours < 6) {
      prayerTime += 24 * 60; // Add 24 hours in minutes
    }
    
    return { ...prayer, timeInMinutes: prayerTime };
  });
  
  // Debug: Log all prayer times
  prayerTimesWithMinutes.forEach(prayer => {
    if (prayer.timeInMinutes > 0) {
      const isAfterMidnight = prayer.timeInMinutes > 24 * 60;
      console.log(`${prayer.name}: ${prayer.time} (${prayer.timeInMinutes} minutes)${isAfterMidnight ? ' [next day]' : ''} - ${prayer.timeInMinutes > currentTime ? 'FUTURE' : 'PAST'}`);
    }
  });
  
  // Find the next prayer that hasn't passed yet
  let nextPrayerIndex = -1;
  
  for (let i = 0; i < prayerTimesWithMinutes.length; i++) {
    const prayer = prayerTimesWithMinutes[i];
    if (prayer.timeInMinutes <= 0) {
      console.log(`Skipping ${prayer.name} - invalid time: ${prayer.time}`);
      continue;
    }
    
    // Check if this prayer is still upcoming
    if (prayer.timeInMinutes > currentTime) {
      nextPrayerIndex = i;
      console.log(`Next prayer found: ${prayer.name} at ${prayer.time}`);
      break;
    }
  }
  
  // If no prayer found for today, the first prayer (Fajr) of tomorrow is next
  if (nextPrayerIndex === -1) {
    nextPrayerIndex = 0; // Fajr is always first in actualPrayers
    console.log('All prayers have passed today, next prayer is tomorrow\'s Fajr');
  }
  
  // Mark the next prayer in the original prayers array (including sunrise)
  return prayers.map((prayer) => {
    // Find this prayer in the actualPrayers array to get the correct index
    const actualPrayerIndex = actualPrayers.findIndex(ap => ap.id === prayer.id);
    const isNext = actualPrayerIndex === nextPrayerIndex && prayer.id !== 'sunrise';
    
    console.log(`Prayer ${prayer.name} - actualPrayerIndex: ${actualPrayerIndex}, nextPrayerIndex: ${nextPrayerIndex}, isNext: ${isNext}`);
    
    return {
      ...prayer,
      isNext
    };
  });
};

// Function to fetch prayer times from Aladhan API
const fetchPrayerTimesFromAPI = async (date: Date): Promise<PrayerTime[]> => {
  try {
    const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format
    console.log("Fetching prayer times for date:", dateString);
    
    const response = await fetch(`https://api.aladhan.com/v1/timingsByCity/${dateString}?city=Espoo&country=Finland&method=3`);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json(); 
    console.log("API response received:", data);
    
    if (data.code !== 200 || !data.data?.timings) {
      throw new Error('Invalid API response');
    }
    
    const timings = data.data.timings;
    console.log("Prayer timings from API:", timings);
    
    const t = getTranslation();
    
    // Map API response to our format with translations and null checks
    const prayers = [
      { id: "fajr", name: t.fajr, time: formatTime(timings.Fajr), isNext: false },
      { id: "sunrise", name: t.sunrise, time: formatTime(timings.Sunrise), isNext: false },
      { id: "dhuhr", name: t.dhuhr, time: formatTime(timings.Dhuhr), isNext: false },
      { id: "asr", name: t.asr, time: formatTime(timings.Asr), isNext: false },
      { id: "maghrib", name: t.maghrib, time: formatTime(timings.Maghrib), isNext: false },
      { id: "isha", name: t.isha, time: formatTime(timings.Isha), isNext: false }
    ];
    
    console.log("Processed prayers before determining next:", prayers);
    
    // Determine next prayer only for today's times with accurate transition
    const isToday = date.toDateString() === new Date().toDateString();
    if (isToday) {
      const updatedPrayers = determineNextPrayer(prayers);
      console.log("Processed prayers after determining next:", updatedPrayers);
      return updatedPrayers;
    }
    
    return prayers;
    
  } catch (error) {
    console.error("Error fetching from Aladhan API:", error);
    throw error;
  }
};

// Function to calculate prayer times for a specific date
export const getPrayerTimes = async (date: Date = new Date()): Promise<PrayerTime[]> => {
  const today = new Date().toDateString();
  const requestedDate = date.toDateString();
  
  console.log("getPrayerTimes called for date:", requestedDate);
  
  // If date is today and we have cached data, update next prayer status and return
  if (requestedDate === today && prayerTimesCache && prayerTimesCache.date === today) {
    console.log("Returning cached prayer times with updated next prayer status");
    const updatedTimes = determineNextPrayer(prayerTimesCache.times);
    prayerTimesCache.times = updatedTimes;
    return updatedTimes;
  }
  
  try {
    // Fetch from Aladhan API
    const apiTimes = await fetchPrayerTimesFromAPI(date);
    
    if (requestedDate === today) {
      prayerTimesCache = {
        date: today,
        times: apiTimes
      };
      
      // Schedule notifications for today's prayers
      try {
        await notificationService.scheduleAllPrayerNotifications(apiTimes);
      } catch (error) {
        console.error("Error scheduling notifications:", error);
      }
    }
    
    return apiTimes;
  } catch (error) {
    console.error("Error fetching prayer times:", error);
    
    // Try Rabita.fi as fallback for today only
    if (requestedDate === today) {
      try {
        console.log("Trying Rabita fallback");
        const rabitaTimes = await fetchRabitaPrayerTimes();
        if (rabitaTimes && rabitaTimes.length > 0) {
          const updatedRabitaTimes = determineNextPrayer(rabitaTimes);
          // Schedule notifications for fallback times too
          try {
            await notificationService.scheduleAllPrayerNotifications(updatedRabitaTimes);
          } catch (error) {
            console.error("Error scheduling notifications for fallback times:", error);
          }
          return updatedRabitaTimes;
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
