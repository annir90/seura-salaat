
import { LocalNotifications } from '@capacitor/local-notifications';
import { PrayerTime } from './prayerTimeService';
import { getTranslation } from './translationService';

export interface NotificationSettings {
  enabled: boolean;
  timing: number; // minutes before prayer
  sound: string;
}

export interface PrayerNotificationSettings {
  fajr: NotificationSettings;
  dhuhr: NotificationSettings;
  asr: NotificationSettings;
  maghrib: NotificationSettings;
  isha: NotificationSettings;
}

const DEFAULT_SETTINGS: PrayerNotificationSettings = {
  fajr: { enabled: true, timing: 10, sound: 'adhan-traditional' },
  dhuhr: { enabled: true, timing: 10, sound: 'adhan-traditional' },
  asr: { enabled: true, timing: 10, sound: 'adhan-traditional' },
  maghrib: { enabled: true, timing: 10, sound: 'adhan-traditional' },
  isha: { enabled: true, timing: 10, sound: 'adhan-traditional' }
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
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
      return DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Error loading notification settings:', error);
      return DEFAULT_SETTINGS;
    }
  }

  saveSettings(settings: PrayerNotificationSettings): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
      console.log('Saved notification settings:', settings);
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  }

  updatePrayerSettings(prayerId: keyof PrayerNotificationSettings, settings: NotificationSettings): void {
    const currentSettings = this.getSettings();
    currentSettings[prayerId] = settings;
    this.saveSettings(currentSettings);
  }

  private getNativeSoundName(soundId: string): string {
    // Map sound IDs to native resource names (without extension)
    const soundMap: Record<string, string> = {
      'adhan-traditional': 'adhan',
      'adhan-soft': 'soft', 
      'notification-beep': 'beep'
    };
    
    const nativeSoundName = soundMap[soundId] || 'adhan'; // Default fallback
    console.log(`Mapping sound ID ${soundId} to native sound: ${nativeSoundName}`);
    return nativeSoundName;
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

      console.log('Current notification settings:', settings);

      for (const prayer of prayerTimes) {
        // Skip sunrise as it's not a prayer time for notifications
        if (prayer.id === 'sunrise') continue;

        const prayerId = this.getPrayerIdFromName(prayer.name);
        if (!prayerId) {
          console.warn(`Unknown prayer name: ${prayer.name}`);
          continue;
        }

        const prayerSettings = settings[prayerId];
        
        // CRITICAL FIX: Only schedule if notifications are enabled for this prayer
        if (!prayerSettings.enabled) {
          console.log(`Notifications disabled for ${prayer.name}, skipping`);
          continue;
        }

        console.log(`Processing ${prayer.name} - enabled: ${prayerSettings.enabled}, sound: ${prayerSettings.sound}`);

        try {
          const [hours, minutes] = prayer.time.split(':').map(Number);
          const notificationTime = new Date();
          notificationTime.setHours(hours, minutes - prayerSettings.timing, 0, 0);

          // If the notification time has passed for today, skip it
          if (notificationTime <= new Date()) {
            console.log(`Notification time for ${prayer.name} has passed, skipping`);
            continue;
          }

          const notificationId = parseInt(`${prayerId.charCodeAt(0)}${notificationTime.getHours()}${notificationTime.getMinutes()}`);

          // CRITICAL FIX: Get the correct native sound name for the selected sound
          const nativeSoundName = this.getNativeSoundName(prayerSettings.sound);

          const notification = {
            title: t.prayerReminder || 'Prayer Reminder',
            body: `${prayer.name} ${t.in || 'in'} ${prayerSettings.timing} ${t.minutes || 'minutes'}`,
            id: notificationId,
            schedule: { at: notificationTime },
            sound: nativeSoundName, // Use the correctly mapped native sound name
            actionTypeId: '',
            extra: {
              prayerName: prayer.name,
              prayerId: prayerId,
              selectedSound: prayerSettings.sound // For debugging
            }
          };

          notifications.push(notification);

          console.log(`Scheduled notification for ${prayer.name} at ${notificationTime.toLocaleTimeString()} with sound: ${nativeSoundName} (from user selection: ${prayerSettings.sound})`);
        } catch (error) {
          console.error(`Error scheduling notification for ${prayer.name}:`, error);
        }
      }

      if (notifications.length > 0) {
        await LocalNotifications.schedule({ notifications });
        console.log(`Successfully scheduled ${notifications.length} prayer notifications with correct sounds`);
      } else {
        console.log('No notifications scheduled - all prayers either disabled or times have passed');
      }
    } catch (error) {
      console.error('Error scheduling prayer notifications:', error);
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
      const settings = this.getSettings();
      
      // Use the Fajr sound setting for test notification with native sound name
      const testNativeSoundName = this.getNativeSoundName(settings.fajr.sound);
      
      await LocalNotifications.schedule({
        notifications: [
          {
            title: t.prayerReminder || 'Prayer Reminder',
            body: t.testNotificationSent || 'This is a test notification',
            id: 999999,
            schedule: { at: new Date(Date.now() + 1000) }, // 1 second from now
            sound: testNativeSoundName, // Use native sound name
            actionTypeId: '',
            extra: {
              isTest: true,
              selectedSound: settings.fajr.sound // For debugging
            }
          }
        ]
      });
      console.log(`Test notification scheduled with native sound: ${testNativeSoundName} (from user selection: ${settings.fajr.sound})`);
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  }
}

export const notificationService = new NotificationService();
