
import { PrayerTime } from "./prayerTimeService";

// Interface for the prayer times returned from rabita.fi
export interface RabitaPrayerTime {
  name: string;
  time: string;
}

// Function to fetch prayer times from rabita.fi
export const fetchRabitaPrayerTimes = async (): Promise<PrayerTime[]> => {
  try {
    // Use a CORS proxy to avoid cross-origin issues
    const proxyUrl = "https://corsproxy.io/?";
    const targetUrl = "https://rabita.fi/wp-content/themes/rabita-v3/prayer-times.php";
    const response = await fetch(`${proxyUrl}${encodeURIComponent(targetUrl)}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch prayer times: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Map the response to our PrayerTime format
    // Rabita.fi usually returns prayer times in this order: Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha
    const prayerIds = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"];
    const prayerNames = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];
    
    // Extract today's prayer times
    const todayData = data.length > 0 ? data[0] : null;
    if (todayData && todayData.prayer_times) {
      const times = todayData.prayer_times;
      
      // Create prayer times array
      const mappedPrayers: PrayerTime[] = times.map((time: string, index: number): PrayerTime => {
        return {
          id: prayerIds[index] || `prayer-${index}`,
          name: prayerNames[index] || `Prayer ${index + 1}`,
          time: time
        };
      });
      
      return mappedPrayers;
    }
    
    // Return empty array if no data
    return [];
  } catch (error) {
    console.error("Error fetching prayer times from rabita.fi:", error);
    // Return empty array on error
    return [];
  }
};
