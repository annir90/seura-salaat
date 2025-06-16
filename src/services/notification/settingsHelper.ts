
export const isNotificationEnabledForPrayer = (prayerId: string): boolean => {
  // Check if notifications are enabled globally
  const globalNotificationState = localStorage.getItem('prayer-notifications-enabled');
  if (globalNotificationState === 'false') {
    return false;
  }

  // Check if notifications are enabled for this specific prayer
  const prayerNotificationState = localStorage.getItem(`prayer-notification-${prayerId}`);
  return prayerNotificationState !== 'false'; // Default to true if not set
};

export const getNotificationTimingForPrayer = (prayerId: string): number => {
  const prayerTiming = localStorage.getItem(`prayer-timing-${prayerId}`);
  return prayerTiming ? parseInt(prayerTiming, 10) : 10; // Default to 10 minutes
};

export const getSoundForPrayer = (prayerId: string): string => {
  const prayerSound = localStorage.getItem(`prayer_adhan_${prayerId}`);
  console.log(`Retrieved sound for prayer ${prayerId}:`, prayerSound);
  return prayerSound || 'adhan-traditional'; // Default to traditional adhan
};
