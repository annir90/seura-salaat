import { PrayerTime } from "./prayerTimeService";
import { t } from "./translationService";

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
  private permission: NotificationPermission = 'default';
  private scheduledNotifications: Map<string, number> = new Map();

  constructor() {
    this.isSupported = 'Notification' in window;
    if (this.isSupported) {
      Notification.requestPermission().then(permission => {
        this.permission = permission;
      });
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('Notifications are not supported in this browser.');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    if (this.permission === 'denied') {
      console.warn('The user has previously denied notifications.');
      return false;
    }

    try {
      this.permission = await Notification.requestPermission();
      return this.permission === 'granted';
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }

  async scheduleNotification(prayer: PrayerTime, minutesBefore: number = 5, soundId: string = 'soft'): Promise<void> {
    if (!this.isSupported) {
      console.warn('Notifications are not supported in this browser.');
      return;
    }

    if (this.permission !== 'granted') {
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
      
      const delay = prayerTime.getTime() - now.getTime() - (minutesBefore * 60 * 1000);
      const notificationTime = new Date(now.getTime() + delay);

      if (delay <= 0) {
        console.log(`Time for ${prayer.name} is in the past, skipping notification.`);
        return;
      }

      const notificationData = {
        type: 'SCHEDULE_PRAYER_NOTIFICATION',
        prayerName: prayer.name,
        prayerId: prayer.id,
        time: prayer.time,
        delay: delay,
        soundId: soundId,
        minutesBefore: minutesBefore,
        scheduledFor: notificationTime.getTime()
      };

      // Send to service worker for background handling
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage(notificationData);
      }

      // Schedule in-app notification as backup
      const timeoutId = setTimeout(async () => {
        try {
          // Calculate remaining time
          const now = new Date();
          const [hours, minutes] = prayer.time.split(':').map(Number);
          const prayerTime = new Date();
          prayerTime.setHours(hours, minutes, 0, 0);
          
          // If prayer time is tomorrow, add a day
          if (prayerTime <= now) {
            prayerTime.setDate(prayerTime.getDate() + 1);
          }
          
          const timeDiff = prayerTime.getTime() - now.getTime();
          const minutesLeft = Math.max(0, Math.round(timeDiff / (1000 * 60)));

          // Show notification
          await this.showNotification({
            title: `${prayer.name} Prayer Reminder`,
            body: `${prayer.name} prayer starts in ${minutesLeft} minutes at ${prayer.time}`,
            icon: '/favicon.ico',
            tag: `prayer-${prayer.id}`,
            requireInteraction: true,
            badge: '/favicon.ico',
            silent: false,
            actions: [
              { action: 'dismiss', title: 'Dismiss' },
              { action: 'open', title: 'Open App' }
            ],
            data: {
              prayerId: prayer.id,
              soundId: soundId,
              time: prayer.time,
              prayerName: prayer.name,
              minutesLeft: minutesLeft
            }
          });

          // Play sound and vibrate
          this.playNotificationSound(soundId);
          this.vibrateDevice();
          
        } catch (error) {
          console.error('Error showing in-app notification:', error);
        }
      }, delay);

      // Store the timeout for potential cancellation
      this.scheduledNotifications.set(prayer.id, timeoutId);
      
      console.log(`Notification scheduled for ${prayer.name} at ${notificationTime.toLocaleString()}`);
      
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  private async showNotification(options: NotificationOptions): Promise<void> {
    try {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        // Use service worker to show notification
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification(options.title, options);
        });
      } else {
        // Show notification directly
        new Notification(options.title, options);
      }
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  async cancelNotification(prayerId: string): Promise<void> {
    if (this.scheduledNotifications.has(prayerId)) {
      clearTimeout(this.scheduledNotifications.get(prayerId));
      this.scheduledNotifications.delete(prayerId);
      console.log(`Notification cancelled for prayer ID: ${prayerId}`);
    } else {
      console.log(`No notification found for prayer ID: ${prayerId}`);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    this.scheduledNotifications.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    this.scheduledNotifications.clear();

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_ALL_NOTIFICATIONS' });
    }

    console.log('All notifications cancelled.');
  }

  async scheduleAllPrayerNotifications(prayers: PrayerTime[]): Promise<void> {
    const storedMinutesBefore = localStorage.getItem('prayerapp-notification-minutes-before');
    const minutesBefore = storedMinutesBefore ? parseInt(storedMinutesBefore, 10) : 5;
    const soundId = localStorage.getItem('prayerapp-notification-sound') || 'soft';

    for (const prayer of prayers) {
      try {
        await this.scheduleNotification(prayer, minutesBefore, soundId);
      } catch (error) {
        console.error(`Failed to schedule notification for ${prayer.name}:`, error);
      }
    }
  }

  playNotificationSound(soundId: string = 'soft'): void {
    const soundFile = soundId === 'loud' ? 'adhan-loud.mp3' : 'adhan-soft.mp3';
    const audio = new Audio(`/sounds/${soundFile}`);
    audio.play()
      .catch(error => console.error("Error playing sound:", error));
  }

  vibrateDevice(): void {
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
  }
}

export const notificationService = new NotificationService();
