import { PrayerTime } from "./prayerTimeService";
import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export interface NotificationOptions {
  body: string;
  icon: string;
  tag: string;
  requireInteraction: boolean;
  badge: string;
  silent: boolean;
  actions: { action: string; title: string; }[];
  data: any;
  title: string;
}

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

  private getSoundFileName(soundId: string): string {
    // Map sound IDs to actual .wav filenames for native Android
    switch (soundId) {
      case 'adhan-mecca':
        return 'adhan_mecca.wav';
      case 'notification-tone':
        return 'notification_tone.wav';
      case 'adhan-traditional':
      default:
        return 'adhan_traditional.wav';
    }
  }

  private isNotificationEnabledForPrayer(prayerId: string): boolean {
    // Check if notifications are enabled globally
    const globalNotificationState = localStorage.getItem('prayer-notifications-enabled');
    if (globalNotificationState === 'false') {
      return false;
    }

    // Check if notifications are enabled for this specific prayer
    const prayerNotificationState = localStorage.getItem(`prayer-notification-${prayerId}`);
    return prayerNotificationState !== 'false'; // Default to true if not set
  }

  private getNotificationTimingForPrayer(prayerId: string): number {
    const prayerTiming = localStorage.getItem(`prayer-timing-${prayerId}`);
    return prayerTiming ? parseInt(prayerTiming, 10) : 10; // Default to 10 minutes
  }

  private getSoundForPrayer(prayerId: string): string {
    const prayerSound = localStorage.getItem(`prayer_adhan_${prayerId}`);
    return prayerSound || 'adhan-traditional'; // Default to traditional adhan
  }

  async scheduleNotification(prayer: PrayerTime, minutesBefore?: number, soundId?: string): Promise<void> {
    if (!this.permission) {
      console.warn('Notification permission has not been granted.');
      return;
    }

    // Check if notifications are enabled for this prayer
    if (!this.isNotificationEnabledForPrayer(prayer.id)) {
      console.log(`Notifications disabled for ${prayer.name}, skipping.`);
      return;
    }

    // Use prayer-specific settings if not provided
    const actualMinutesBefore = minutesBefore || this.getNotificationTimingForPrayer(prayer.id);
    const actualSoundId = soundId || this.getSoundForPrayer(prayer.id);

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
        // Use Capacitor local notifications for native apps
        const notificationId = parseInt(prayer.id.replace(/\D/g, '') || '0') + Date.now() % 1000;
        
        const soundFileName = this.getSoundFileName(actualSoundId);
        
        const notification: ScheduleOptions = {
          notifications: [{
            title: `${prayer.name} Prayer Reminder`,
            body: `${prayer.name} prayer starts in ${minutesLeft} minutes at ${prayer.time}`,
            id: notificationId,
            schedule: { at: notificationTime },
            sound: soundFileName, // Use the selected .wav filename
            smallIcon: 'ic_stat_icon_config_sample',
            iconColor: '#488AFF',
            attachments: [],
            actionTypeId: '',
            extra: {
              prayerId: prayer.id,
              soundId: actualSoundId,
              time: prayer.time,
              prayerName: prayer.name,
              minutesLeft: minutesLeft
            }
          }]
        };

        await LocalNotifications.schedule(notification);
        this.scheduledNotificationIds.add(notificationId);
        
        console.log(`Native notification scheduled for ${prayer.name} at ${notificationTime.toLocaleString()} with sound: ${soundFileName}`);
      } else {
        // Web fallback - immediate notification
        try {
          new Notification(`${prayer.name} Prayer Reminder`, {
            body: `${prayer.name} prayer starts in ${minutesLeft} minutes at ${prayer.time}`,
            icon: '/favicon.ico',
            tag: `prayer-${prayer.id}`,
            requireInteraction: true,
            badge: '/favicon.ico',
            silent: false
          });

          this.playNotificationSound(actualSoundId);
          this.vibrateDevice();
        } catch (error) {
          console.error('Error showing web notification:', error);
        }
      }
      
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  async cancelNotification(prayerId: string): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      try {
        // For native apps, we need to find and cancel the specific notification
        const pending = await LocalNotifications.getPending();
        const notificationToCancel = pending.notifications.find(
          notification => notification.extra?.prayerId === prayerId
        );
        
        if (notificationToCancel) {
          await LocalNotifications.cancel({ notifications: [{ id: notificationToCancel.id }] });
          this.scheduledNotificationIds.delete(notificationToCancel.id);
          console.log(`Native notification cancelled for prayer ID: ${prayerId}`);
        }
      } catch (error) {
        console.error('Error cancelling native notification:', error);
      }
    } else {
      console.log(`Web notification cancellation not implemented for prayer ID: ${prayerId}`);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      try {
        const pending = await LocalNotifications.getPending();
        if (pending.notifications.length > 0) {
          await LocalNotifications.cancel({ 
            notifications: pending.notifications.map(n => ({ id: n.id }))
          });
        }
        this.scheduledNotificationIds.clear();
        console.log('All native notifications cancelled.');
      } catch (error) {
        console.error('Error cancelling all native notifications:', error);
      }
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
      let soundFile: string;
      switch (soundId) {
        case 'adhan-mecca':
          soundFile = 'adhan-mecca.mp3';
          break;
        case 'notification-tone':
          soundFile = 'notification-tone.mp3';
          break;
        case 'adhan-traditional':
        default:
          soundFile = 'adhan-traditional.mp3';
          break;
      }
      
      const audio = new Audio(`/audio/${soundFile}`);
      audio.play()
        .catch(error => console.error("Error playing sound:", error));
    }
  }

  vibrateDevice(): void {
    if (!Capacitor.isNativePlatform() && navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
    // Native apps handle vibration automatically with notifications
  }
}

export const notificationService = new NotificationService();
