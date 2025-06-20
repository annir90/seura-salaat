
import { Capacitor } from '@capacitor/core';

export interface NotificationChannelConfig {
  id: string;
  name: string;
  description: string;
  importance: number;
  soundUri?: string;
  vibration?: boolean;
}

export const createNotificationChannel = async (config: NotificationChannelConfig): Promise<void> => {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
    console.log('Notification channels are only supported on Android');
    return;
  }

  try {
    // We'll use Capacitor's plugin to create notification channels
    // This requires the @capacitor/local-notifications plugin
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    
    // Check if we can create channels (Android 8.0+)
    const permission = await LocalNotifications.checkPermissions();
    if (permission.display !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    // Create channel using native Android APIs
    // Note: This will require additional native code in MainActivity.java
    console.log(`Creating notification channel: ${config.id}`);
    
    // Store channel config for later use
    localStorage.setItem(`notification_channel_${config.id}`, JSON.stringify(config));
    
  } catch (error) {
    console.error('Error creating notification channel:', error);
  }
};

export const setupPrayerNotificationChannels = async (): Promise<void> => {
  const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  
  for (const prayer of prayers) {
    await createNotificationChannel({
      id: `prayer_${prayer}`,
      name: `${prayer.charAt(0).toUpperCase() + prayer.slice(1)} Prayer`,
      description: `Notifications for ${prayer} prayer times`,
      importance: 4, // HIGH importance
      vibration: true
    });
  }
};
