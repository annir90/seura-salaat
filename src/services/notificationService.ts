
import { LocalNotifications } from '@capacitor/local-notifications';
import { PrayerTime, getPrayerTimes } from './prayerTimeService';
import { getTranslation } from './translationService';

export interface NotificationSettings {
  enabled: boolean;
  timing: number; // minutes before prayer
}

export interface PrayerNotificationSettings {
  fajr: NotificationSettings;
  dhuhr: NotificationSettings;
  asr: NotificationSettings;
  maghrib: NotificationSettings;
  isha: NotificationSettings;
}

const DEFAULT_SETTINGS: PrayerNotificationSettings = {
  fajr: { enabled: true, timing: 10 },
  dhuhr: { enabled: true, timing: 10 },
  asr: { enabled: true, timing: 10 },
  maghrib: { enabled: true, timing: 10 },
  isha: { enabled: true, timing: 10 }
};

class NotificationService {
  private readonly STORAGE_KEY = 'prayer-notification-settings';

  async requestPermissions(): Promise<boolean> {
    try {
      const result = await LocalNotifications.requestPermissions();
      return result.display === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  async checkPermissions(): Promise<boolean> {
    try {
      const result = await LocalNotifications.checkPermissions();
      return result.display === 'granted';
    } catch (error) {
      console.error('Error checking notification permissions:', error);
      return false;
    }
  }

  getSettings(): PrayerNotificationSettings {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      let settings = stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
      
      // Load individual prayer timings from localStorage for precise control
      const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
      prayers.forEach(prayer => {
        const storedTiming = localStorage.getItem(`prayer-timing-${prayer}`);
        if (storedTiming !== null) {
          settings[prayer].timing = parseInt(storedTiming);
          console.log(`Loaded ${prayer} timing from localStorage: ${storedTiming} minutes`);
        }
      });
      
      return settings;
    } catch (error) {
      console.error('Error loading notification settings:', error);
      return DEFAULT_SETTINGS;
    }
  }

  saveSettings(settings: PrayerNotificationSettings): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
      
      // Also save individual prayer timings for precise control
      Object.entries(settings).forEach(([prayer, setting]) => {
        localStorage.setItem(`prayer-timing-${prayer}`, setting.timing.toString());
      });
      
      console.log('Saved notification settings with individual timings:', settings);
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  }

  updatePrayerSettings(prayerId: keyof PrayerNotificationSettings, settings: NotificationSettings): void {
    const currentSettings = this.getSettings();
    currentSettings[prayerId] = settings;
    this.saveSettings(currentSettings);
  }

  private getPrayerIdFromName(prayerName: string): keyof PrayerNotificationSettings | null {
    const nameMap: Record<string, keyof PrayerNotificationSettings> = {
      'Fajr': 'fajr',
      'Dhuhr': 'dhuhr', 
      'Asr': 'asr',
      'Maghrib': 'maghrib',
      'Isha': 'isha'
    };
    
    // Try direct lookup first
    if (nameMap[prayerName]) {
      return nameMap[prayerName];
    }
    
    // Try case-insensitive lookup
    const lowerName = prayerName.toLowerCase();
    for (const [key, value] of Object.entries(nameMap)) {
      if (key.toLowerCase() === lowerName) {
        return value;
      }
    }
    
    return null;
  }

  async scheduleAllPrayerNotifications(prayerTimes: PrayerTime[]): Promise<void> {
    try {
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        console.log('No notification permission, skipping scheduling');
        return;
      }

      // Cancel existing notifications first
      await this.cancelAllNotifications();

      const settings = this.getSettings();
      const t = getTranslation();
      const notifications = [];

      console.log('Scheduling notifications with precise timing settings:', settings);

      for (const prayer of prayerTimes) {
        // Skip sunrise as it's not a prayer time for notifications
        if (prayer.id === 'sunrise') continue;

        const prayerId = this.getPrayerIdFromName(prayer.name);
        if (!prayerId) {
          console.warn(`Unknown prayer name: ${prayer.name}`);
          continue;
        }

        const prayerSettings = settings[prayerId];
        
        if (!prayerSettings.enabled) {
          console.log(`Notifications disabled for ${prayer.name}, skipping`);
          continue;
        }

        console.log(`Processing ${prayer.name} - enabled: ${prayerSettings.enabled}, timing: ${prayerSettings.timing} minutes before`);

        try {
          const [hours, minutes] = prayer.time.split(':').map(Number);
          const notificationTime = new Date();
          notificationTime.setHours(hours, minutes - prayerSettings.timing, 0, 0);

          // If the notification time has passed for today, schedule for tomorrow
          if (notificationTime <= new Date()) {
            notificationTime.setDate(notificationTime.getDate() + 1);
            console.log(`Notification time for ${prayer.name} has passed, scheduling for tomorrow`);
          }

          const notificationId = parseInt(`${prayerId.charCodeAt(0)}${notificationTime.getHours()}${notificationTime.getMinutes()}`);

          const notificationBody = prayerSettings.timing === 0 
            ? `Time for ${prayer.name} prayer`
            : `${prayer.name} ${t.in || 'in'} ${prayerSettings.timing} ${t.minutes || 'minutes'}`;

          const notification = {
            title: t.prayerReminder || 'Prayer Reminder',
            body: notificationBody,
            id: notificationId,
            schedule: { at: notificationTime },
            sound: 'adhan',
            actionTypeId: '',
            extra: {
              prayerName: prayer.name,
              prayerId: prayerId,
              timing: prayerSettings.timing
            }
          };

          notifications.push(notification);

          console.log(`Scheduled precise notification for ${prayer.name} at ${notificationTime.toLocaleTimeString()} (${prayerSettings.timing} minutes before prayer)`);
        } catch (error) {
          console.error(`Error scheduling notification for ${prayer.name}:`, error);
        }
      }

      if (notifications.length > 0) {
        await LocalNotifications.schedule({ notifications });
        console.log(`Successfully scheduled ${notifications.length} precise prayer notifications`);
      } else {
        console.log('No notifications scheduled - all prayers either disabled or times have passed');
      }
    } catch (error) {
      console.error('Error scheduling prayer notifications:', error);
    }
  }

  // New method to refresh notifications after settings change
  async refreshNotifications(): Promise<void> {
    try {
      const prayerTimes = await getPrayerTimes();
      await this.scheduleAllPrayerNotifications(prayerTimes);
      console.log('Notifications refreshed successfully');
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        const ids = pending.notifications.map(n => ({ id: n.id }));
        await LocalNotifications.cancel({ notifications: ids });
        console.log(`Cancelled ${ids.length} pending notifications`);
      }
    } catch (error) {
      console.error('Error cancelling notifications:', error);
    }
  }

  async cancelPrayerNotification(prayerId: keyof PrayerNotificationSettings): Promise<void> {
    try {
      const pending = await LocalNotifications.getPending();
      const prayerNotifications = pending.notifications.filter(n => 
        n.extra?.prayerId === prayerId
      );
      
      if (prayerNotifications.length > 0) {
        const ids = prayerNotifications.map(n => ({ id: n.id }));
        await LocalNotifications.cancel({ notifications: ids });
        console.log(`Cancelled ${ids.length} notifications for ${prayerId}`);
      }
    } catch (error) {
      console.error(`Error cancelling notifications for ${prayerId}:`, error);
    }
  }

  async sendTestNotification(): Promise<void> {
    try {
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        console.log('No notification permission for test notification');
        return;
      }

      const t = getTranslation();
      
      await LocalNotifications.schedule({
        notifications: [
          {
            title: t.prayerReminder || 'Prayer Reminder',
            body: t.testNotificationSent || 'This is a test notification with adhan sound',
            id: 999999,
            schedule: { at: new Date(Date.now() + 1000) }, // 1 second from now
            sound: 'adhan',
            actionTypeId: '',
            extra: {
              isTest: true
            }
          }
        ]
      });
      console.log(`Test notification scheduled with adhan sound`);
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  }
}

export const notificationService = new NotificationService();
