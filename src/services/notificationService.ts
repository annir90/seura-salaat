
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

  async scheduleNotification(prayer: PrayerTime, minutesBefore: number = 5, soundId: string = 'soft'): Promise<void> {
    if (!this.permission) {
      console.warn('Notification permission has not been granted.');
      return;
    }

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
      
      const notificationTime = new Date(prayerTime.getTime() - (minutesBefore * 60 * 1000));

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
        
        const notification: ScheduleOptions = {
          notifications: [{
            title: `${prayer.name} Prayer Reminder`,
            body: `${prayer.name} prayer starts in ${minutesLeft} minutes at ${prayer.time}`,
            id: notificationId,
            schedule: { at: notificationTime },
            sound: soundId === 'loud' ? 'adhan-loud.wav' : 'adhan-soft.wav',
            attachments: [],
            actionTypeId: '',
            extra: {
              prayerId: prayer.id,
              soundId: soundId,
              time: prayer.time,
              prayerName: prayer.name,
              minutesLeft: minutesLeft
            }
          }]
        };

        await LocalNotifications.schedule(notification);
        this.scheduledNotificationIds.add(notificationId);
        
        console.log(`Native notification scheduled for ${prayer.name} at ${notificationTime.toLocaleString()}`);
      } else {
        // Web fallback using setTimeout
        const delay = notificationTime.getTime() - now.getTime();
        
        setTimeout(async () => {
          try {
            new Notification(`${prayer.name} Prayer Reminder`, {
              body: `${prayer.name} prayer starts in ${minutesLeft} minutes at ${prayer.time}`,
              icon: '/favicon.ico',
              tag: `prayer-${prayer.id}`,
              requireInteraction: true,
              badge: '/favicon.ico',
              silent: false
            });

            this.playNotificationSound(soundId);
            this.vibrateDevice();
          } catch (error) {
            console.error('Error showing web notification:', error);
          }
        }, delay);
      }
      
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  async cancelNotification(prayerId: string): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      try {
        // For native apps, we need to find and cancel the specific notification
        // Since we can't easily track individual prayer notifications by prayer ID,
        // we'll get all pending notifications and cancel those that match
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
        await LocalNotifications.cancel({ notifications: [] }); // Cancel all
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
    const storedMinutesBefore = localStorage.getItem('prayerapp-notification-minutes-before');
    const minutesBefore = storedMinutesBefore ? parseInt(storedMinutesBefore, 10) : 5;
    const soundId = localStorage.getItem('prayerapp-notification-sound') || 'soft';

    // Cancel existing notifications first
    await this.cancelAllNotifications();

    for (const prayer of prayers) {
      try {
        await this.scheduleNotification(prayer, minutesBefore, soundId);
      } catch (error) {
        console.error(`Failed to schedule notification for ${prayer.name}:`, error);
      }
    }
  }

  playNotificationSound(soundId: string = 'soft'): void {
    if (!Capacitor.isNativePlatform()) {
      // Only play sound on web, native notifications handle sound automatically
      const soundFile = soundId === 'loud' ? 'adhan-loud.mp3' : 'adhan-soft.mp3';
      const audio = new Audio(`/sounds/${soundFile}`);
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
