
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
  const currentTime = now.getHours() * 60 + now.getMinutes();

  console.log(`Current time: ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')} (${currentTime} minutes)`);

  // Ignore sunrise
  const actualPrayers = prayers.filter(prayer => prayer.id !== 'sunrise');

  // Track next prayer index
  let nextPrayerIndex = -1;

  actualPrayers.forEach((prayer, i) => {
    if (prayer.time && prayer.time !== "00:00") {
      const [hours, minutes] = prayer.time.split(":").map(Number);
      let prayerTime = hours * 60 + minutes;

      // Handle after-midnight Isha
      if (hours >= 0 && hours < 6 && now.getHours() >= 18) {
        prayerTime += 24 * 60;
      }

      const adjustedCurrentTime = now.getHours() >= 18 ? currentTime + 24 * 60 : currentTime;

      if (prayerTime > adjustedCurrentTime && nextPrayerIndex === -1) {
        nextPrayerIndex = i;
        console.log(`Next prayer found: ${prayer.name} at ${prayer.time}`);
      }

      console.log(`${prayer.name}: ${prayer.time} (${prayerTime} minutes) - ${prayerTime > adjustedCurrentTime ? 'FUTURE' : 'PAST'}`);
    }
  });

  // Fallback: all prayers passed, mark last one (usually Isha)
  if (nextPrayerIndex === -1 && actualPrayers.length > 0) {
    nextPrayerIndex = actualPrayers.length - 1;
    console.log(`All prayers passed, setting next to: ${actualPrayers[nextPrayerIndex].name}`);
  }

  return prayers.map((prayer) => {
    const actualPrayerIndex = actualPrayers.findIndex((p) => p.id === prayer.id);
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
