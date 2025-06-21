
import { PrayerTime } from "./prayerTimeService";
import { Capacitor } from '@capacitor/core';
import { isNotificationEnabledForPrayer, getNotificationTimingForPrayer } from './notification/settingsHelper';
import { scheduleNativeNotification, cancelNativeNotification, cancelAllNativeNotifications } from './notification/nativeNotifications';
import { setupPrayerNotificationChannels } from './notification/androidChannelManager';

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
      await this.setupChannels();
    } else {
      console.warn('This app is designed for Android only');
      this.isSupported = false;
    }
  }

  private async setupChannels(): Promise<void> {
    try {
      await setupPrayerNotificationChannels();
      console.log('Prayer notification channels setup completed');
    } catch (error) {
      console.error('Error setting up notification channels:', error);
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      console.warn('Notification permission only available on native platforms');
      return false;
    }

    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      const permission = await LocalNotifications.requestPermissions();
      this.permission = permission.display === 'granted';
      console.log('Notification permission:', this.permission ? 'granted' : 'denied');
      return this.permission;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
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

    // Use prayer-specific timing settings and global sound preference
    const actualMinutesBefore = minutesBefore || getNotificationTimingForPrayer(prayer.id);
    const globalSoundPreference = localStorage.getItem('prayerapp-notification-sound') || 'adhan';

    console.log(`Scheduling notification for ${prayer.name} with sound: ${globalSoundPreference}, ${actualMinutesBefore} minutes before`);

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

      await scheduleNativeNotification(prayer, notificationTime, minutesLeft, globalSoundPreference, this.scheduledNotificationIds);
      
    } catch (error) {
      console.error('Error scheduling notification for', prayer.name, ':', error);
    }
  }

  async cancelNotification(prayerId: string): Promise<void> {
    await cancelNativeNotification(prayerId, this.scheduledNotificationIds);
  }

  async cancelAllNotifications(): Promise<void> {
    await cancelAllNativeNotifications(this.scheduledNotificationIds);
  }

  async scheduleAllPrayerNotifications(prayers: PrayerTime[]): Promise<void> {
    // Cancel existing notifications first
    await this.cancelAllNotifications();

    console.log(`Scheduling notifications for ${prayers.length} prayers`);

    for (const prayer of prayers) {
      try {
        await this.scheduleNotification(prayer);
      } catch (error) {
        console.error(`Failed to schedule notification for ${prayer.name}:`, error);
      }
    }
  }
}

export const notificationService = new NotificationService();
