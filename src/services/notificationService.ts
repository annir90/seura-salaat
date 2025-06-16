
import { PrayerTime } from "./prayerTimeService";
import { Capacitor } from '@capacitor/core';
import { isNotificationEnabledForPrayer, getNotificationTimingForPrayer, getSoundForPrayer } from './notification/settingsHelper';
import { showWebNotification, playNotificationSound, vibrateDevice } from './notification/webNotifications';
import { scheduleNativeNotification, cancelNativeNotification, cancelAllNativeNotifications } from './notification/nativeNotifications';

export class NotificationService {
  private isSupported: boolean = false;
  private permission: boolean = false;
  private scheduledNotificationIds: Set<number> = new Set();

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      this.isSupported = true;
      await this.requestPermission();
    } else {
      // Fallback to web notifications for PWA
      this.isSupported = 'Notification' in window;
      if (this.isSupported) {
        const permission = await Notification.requestPermission();
        this.permission = permission === 'granted';
      }
    }
  }

  async requestPermission(): Promise<boolean> {
    if (Capacitor.isNativePlatform()) {
      try {
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        const permission = await LocalNotifications.requestPermissions();
        this.permission = permission.display === 'granted';
        return this.permission;
      } catch (error) {
        console.error('Failed to request notification permission:', error);
        return false;
      }
    } else {
      // Web fallback
      if (!this.isSupported) {
        console.warn('Notifications are not supported in this browser.');
        return false;
      }

      try {
        const permission = await Notification.requestPermission();
        this.permission = permission === 'granted';
        return this.permission;
      } catch (error) {
        console.error('Failed to request notification permission:', error);
        return false;
      }
    }
  }

  async scheduleNotification(prayer: PrayerTime, minutesBefore?: number, soundId?: string): Promise<void> {
    if (!this.permission) {
      console.warn('Notification permission has not been granted.');
      return;
    }

    // Check if notifications are enabled for this prayer
    if (!isNotificationEnabledForPrayer(prayer.id)) {
      console.log(`Notifications disabled for ${prayer.name}, skipping.`);
      return;
    }

    // Use prayer-specific settings if not provided
    const actualMinutesBefore = minutesBefore || getNotificationTimingForPrayer(prayer.id);
    const actualSoundId = soundId || getSoundForPrayer(prayer.id);

    console.log(`Scheduling notification for ${prayer.name} with sound: ${actualSoundId}`);

    try {
      // Calculate notification time
      const now = new Date();
      const [hours, minutes] = prayer.time.split(':').map(Number);
      const prayerTime = new Date();
      prayerTime.setHours(hours, minutes, 0, 0);
      
      // If prayer time is tomorrow, add a day
      if (prayerTime <= now) {
        prayerTime.setDate(prayerTime.getDate() + 1);
      }
      
      const notificationTime = new Date(prayerTime.getTime() - (actualMinutesBefore * 60 * 1000));

      if (notificationTime <= now) {
        console.log(`Time for ${prayer.name} notification is in the past, skipping.`);
        return;
      }

      // Calculate remaining time until prayer
      const timeDiff = prayerTime.getTime() - notificationTime.getTime();
      const minutesLeft = Math.round(timeDiff / (1000 * 60));

      if (Capacitor.isNativePlatform()) {
        await scheduleNativeNotification(prayer, notificationTime, minutesLeft, actualSoundId, this.scheduledNotificationIds);
      } else {
        // Web fallback - immediate notification
        showWebNotification(
          `${prayer.name} Prayer Reminder`,
          `${prayer.name} prayer starts in ${minutesLeft} minutes at ${prayer.time}`,
          actualSoundId
        );
      }
      
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  async cancelNotification(prayerId: string): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      await cancelNativeNotification(prayerId, this.scheduledNotificationIds);
    } else {
      console.log(`Web notification cancellation not implemented for prayer ID: ${prayerId}`);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      await cancelAllNativeNotifications(this.scheduledNotificationIds);
    } else {
      console.log('All web notifications cancelled.');
    }
  }

  async scheduleAllPrayerNotifications(prayers: PrayerTime[]): Promise<void> {
    // Cancel existing notifications first
    await this.cancelAllNotifications();

    console.log(`Scheduling notifications for ${prayers.length} prayers`);

    for (const prayer of prayers) {
      try {
        // Each prayer will use its own settings
        await this.scheduleNotification(prayer);
      } catch (error) {
        console.error(`Failed to schedule notification for ${prayer.name}:`, error);
      }
    }
  }

  playNotificationSound(soundId: string = 'adhan-traditional'): void {
    if (!Capacitor.isNativePlatform()) {
      // Only play sound on web, native notifications handle sound automatically
      playNotificationSound(soundId);
    }
  }

  vibrateDevice(): void {
    if (!Capacitor.isNativePlatform()) {
      vibrateDevice();
    }
    // Native apps handle vibration automatically with notifications
  }
}

export const notificationService = new NotificationService();
