import { getSelectedLocation } from "./locationService";
import { toast } from "@/components/ui/use-toast";
import { getTranslation } from "./translationService";
import { notificationService } from "./notificationService";

// Prayer time service using local JSON file
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

// Function to fetch prayer times from local JSON file
const fetchPrayerTimesFromFile = async (date: Date): Promise<PrayerTime[]> => {
  try {
    const dayOfMonth = date.getDate();
    console.log("Fetching prayer times for day:", dayOfMonth);
    
    const response = await fetch('/data/july-2025.json');
    
    if (!response.ok) {
      throw new Error(`Failed to load JSON file: ${response.status}`);
    }
    
    const monthlyData = await response.json();
    console.log("Loaded monthly data:", monthlyData);
    
    // Find the data for the specific day
    const dayData = monthlyData.find((day: any) => day.day === dayOfMonth);
    
    if (!dayData) {
      throw new Error(`No data found for day ${dayOfMonth}`);
    }
    
    console.log("Day data found:", dayData);
    
    const t = getTranslation();
    
    // Map JSON data to our format with translations
    const prayers: PrayerTime[] = [
      { id: "fajr", name: t.fajr, time: formatTime(dayData.fajr) },
      { id: "sunrise", name: t.sunrise, time: formatTime(dayData.sunrise) },
      { id: "dhuhr", name: t.dhuhr, time: formatTime(dayData.dhuhr) },
      { id: "asr", name: t.asr, time: formatTime(dayData.asr) },
      { id: "maghrib", name: t.maghrib, time: formatTime(dayData.maghrib) },
      { id: "isha", name: t.isha, time: formatTime(dayData.isha) }
    ];
    
    // Determine which prayer is next based on current time
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMinute;
    
    let nextPrayerFound = false;
    
    for (const prayer of prayers) {
      const [prayerHour, prayerMinute] = prayer.time.split(':').map(Number);
      const prayerTimeMinutes = prayerHour * 60 + prayerMinute;
      
      if (!nextPrayerFound && prayerTimeMinutes > currentTimeMinutes) {
        prayer.isNext = true;
        nextPrayerFound = true;
      }
    }
    
    // If no prayer is next today, mark Fajr as next (for tomorrow)
    if (!nextPrayerFound && prayers.length > 0) {
      prayers[0].isNext = true;
    }
    
    console.log("Processed prayers with next prayer marked:", prayers);
    
    return prayers;
    
  } catch (error) {
    console.error("Error fetching from local JSON file:", error);
    throw error;
  }
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
    // Fetch from local JSON file
    const localTimes = await fetchPrayerTimesFromFile(date);
    
    if (requestedDate === today) {
      prayerTimesCache = {
        date: today,
        times: localTimes
      };
      
      // Schedule notifications for today's prayers
      try {
        await notificationService.scheduleAllPrayerNotifications(localTimes);
      } catch (error) {
        console.error("Error scheduling notifications:", error);
      }
    }
    
    return localTimes;
  } catch (error) {
    console.error("Error fetching prayer times:", error);
    
    // Return empty array if file loading fails
    console.warn("Local JSON file loading failed, returning empty array");
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
