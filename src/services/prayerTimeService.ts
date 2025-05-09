
// Mock prayer time service (in a real app, this would integrate with an API)
export interface PrayerTime {
  id: string;
  name: string;
  time: string;
  isNext: boolean;
}

export const getPrayerTimes = (date: Date = new Date()): PrayerTime[] => {
  // In a real app, these would come from an API based on location
  const formattedDate = date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  // Determine which prayer is next based on current time
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentTime = hours * 60 + minutes;
  
  const prayers = [
    { id: "fajr", name: "Fajr", time: "05:23", timeInMinutes: 5 * 60 + 23 },
    { id: "sunrise", name: "Sunrise", time: "06:45", timeInMinutes: 6 * 60 + 45 },
    { id: "dhuhr", name: "Dhuhr", time: "12:35", timeInMinutes: 12 * 60 + 35 },
    { id: "asr", name: "Asr", time: "16:10", timeInMinutes: 16 * 60 + 10 },
    { id: "maghrib", name: "Maghrib", time: "19:24", timeInMinutes: 19 * 60 + 24 },
    { id: "isha", name: "Isha", time: "20:45", timeInMinutes: 20 * 60 + 45 }
  ];
  
  let nextPrayerIndex = prayers.findIndex(prayer => prayer.timeInMinutes > currentTime);
  if (nextPrayerIndex === -1) nextPrayerIndex = 0; // If past Isha, Fajr is next
  
  return prayers.map((prayer, index) => ({
    ...prayer,
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
  // In a real app, this would use geolocation and trigonometric calculations
  return 137; // Mock direction in degrees
};
