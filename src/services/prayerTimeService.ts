
export interface PrayerTime {
  id: string;
  name: string;
  time: string;
  isNext: boolean;
}

// Cache for prayer times to avoid repeated API calls
let cachedPrayerTimes: PrayerTime[] = [];
let lastFetchDate: string = '';

const determineNextPrayer = (prayers: PrayerTime[]): PrayerTime[] => {
  const now = new Date();
  const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();
  
  console.log(`Current time: ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')} (${currentTimeInMinutes} minutes from midnight)`);

  // Filter out sunrise as it's not a prayer time
  const actualPrayers = prayers.filter(prayer => prayer.id !== 'sunrise');
  
  // Convert prayer times to minutes and find next prayer
  const prayerTimesWithMinutes = actualPrayers.map(prayer => {
    const [hours, minutes] = prayer.time.split(':').map(Number);
    const timeInMinutes = hours * 60 + minutes;
    
    console.log(`${prayer.name}: ${prayer.time} (${timeInMinutes} minutes from midnight)`);
    
    return {
      ...prayer,
      timeInMinutes
    };
  });

  // Find the next prayer that hasn't passed yet
  let nextPrayerIndex = -1;
  
  for (let i = 0; i < prayerTimesWithMinutes.length; i++) {
    const prayerTime = prayerTimesWithMinutes[i].timeInMinutes;
    
    if (prayerTime > currentTimeInMinutes) {
      nextPrayerIndex = i;
      console.log(`Next prayer found: ${prayerTimesWithMinutes[i].name} at ${prayerTimesWithMinutes[i].time}`);
      break;
    }
  }
  
  // If no prayer found for today (all prayers have passed), the next prayer is tomorrow's Fajr
  if (nextPrayerIndex === -1) {
    nextPrayerIndex = 0; // Fajr is always first
    console.log(`All prayers passed for today, next prayer is tomorrow's Fajr`);
  }

  // Return the prayers with updated isNext status
  return prayers.map((prayer, index) => {
    // Find the index of this prayer in the actual prayers array (excluding sunrise)
    const actualPrayerIndex = actualPrayers.findIndex(p => p.id === prayer.id);
    const isNext = actualPrayerIndex === nextPrayerIndex && prayer.id !== 'sunrise';
    
    return {
      ...prayer,
      isNext
    };
  });
};

export const getPrayerTimes = async (date?: Date): Promise<PrayerTime[]> => {
  const targetDate = date || new Date();
  const dateString = targetDate.toDateString();
  
  console.log(`getPrayerTimes called for date: ${dateString}`);
  
  // Return cached times if same date, but update next prayer status
  if (cachedPrayerTimes.length > 0 && lastFetchDate === dateString) {
    console.log('Returning cached prayer times with updated next prayer status');
    return determineNextPrayer(cachedPrayerTimes);
  }

  try {
    // Import the rabita service to fetch prayer times
    const { fetchRabitaPrayerTimes } = await import('./rabitaService');
    const times = await fetchRabitaPrayerTimes();
    
    if (times.length > 0) {
      cachedPrayerTimes = times;
      lastFetchDate = dateString;
      console.log(`Cached prayer times for ${dateString}`);
      return determineNextPrayer(times);
    }
    
    // Fallback to default times if API fails
    console.log('Using fallback prayer times');
    const fallbackTimes: PrayerTime[] = [
      { id: 'fajr', name: 'Fajr', time: '05:30', isNext: false },
      { id: 'sunrise', name: 'Sunrise', time: '07:00', isNext: false },
      { id: 'dhuhr', name: 'Dhuhr', time: '12:30', isNext: false },
      { id: 'asr', name: 'Asr', time: '15:30', isNext: false },
      { id: 'maghrib', name: 'Maghrib', time: '18:00', isNext: false },
      { id: 'isha', name: 'Isha', time: '19:30', isNext: false }
    ];
    
    return determineNextPrayer(fallbackTimes);
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    
    // Return fallback times
    const fallbackTimes: PrayerTime[] = [
      { id: 'fajr', name: 'Fajr', time: '05:30', isNext: false },
      { id: 'sunrise', name: 'Sunrise', time: '07:00', isNext: false },
      { id: 'dhuhr', name: 'Dhuhr', time: '12:30', isNext: false },
      { id: 'asr', name: 'Asr', time: '15:30', isNext: false },
      { id: 'maghrib', name: 'Maghrib', time: '18:00', isNext: false },
      { id: 'isha', name: 'Isha', time: '19:30', isNext: false }
    ];
    
    return determineNextPrayer(fallbackTimes);
  }
};

export const getDateForHeader = (): string => {
  const now = new Date();
  return now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const getQiblaDirection = async (): Promise<number> => {
  // Return direction to Mecca from Helsinki, Finland (approximately 145 degrees)
  return 145;
};
