
import { PrayerTime } from "./prayerTimeService";

interface ScheduledNotification {
  prayerId: string;
  timeoutId: number;
  scheduledTime: string;
}

class NotificationService {
  private scheduledNotifications: Map<string, ScheduledNotification> = new Map();
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

  constructor() {
    this.initializeServiceWorker();
  }

  private async initializeServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  async scheduleAllPrayerNotifications(prayerTimes: PrayerTime[]): Promise<void> {
    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      console.warn('Notification permission not granted');
      return;
    }

    // Clear all existing notifications
    this.clearAllNotifications();

    // Get user preferences
    const notificationsEnabled = localStorage.getItem('prayer-notifications-enabled') !== 'false';
    const notificationTiming = parseInt(localStorage.getItem('prayer-notification-timing') || '5', 10);

    if (!notificationsEnabled) {
      console.log('Prayer notifications are disabled');
      return;
    }

    const now = new Date();
    const today = now.toDateString();

    // Check if we already scheduled for today
    const lastScheduledDate = localStorage.getItem('last-scheduled-date');
    if (lastScheduledDate === today) {
      console.log('Notifications already scheduled for today');
      return;
    }

    for (const prayer of prayerTimes) {
      await this.schedulePrayerNotification(prayer, notificationTiming);
    }

    // Mark as scheduled for today
    localStorage.setItem('last-scheduled-date', today);
    console.log('All prayer notifications scheduled for today');
  }

  private async schedulePrayerNotification(prayer: PrayerTime, minutesBefore: number): Promise<void> {
    try {
      const now = new Date();
      const [hours, minutes] = prayer.time.split(':').map(Number);
      
      const prayerDate = new Date();
      prayerDate.setHours(hours, minutes - minutesBefore, 0, 0);

      // If the notification time has passed, skip
      if (prayerDate <= now) {
        console.log(`Notification time has passed for ${prayer.name}`);
        return;
      }

      const delay = prayerDate.getTime() - now.getTime();
      console.log(`Scheduling ${prayer.name} notification in ${Math.round(delay / 1000)} seconds`);

      // Get user's selected sound for this prayer
      const selectedSound = localStorage.getItem(`prayer_adhan_${prayer.id}`) || 'traditional-adhan';
      const notificationEnabled = localStorage.getItem(`prayer-notification-${prayer.id}`) !== 'false';

      if (!notificationEnabled) {
        console.log(`Notifications disabled for ${prayer.name}`);
        return;
      }

      const timeoutId = setTimeout(async () => {
        await this.showNotification(prayer, minutesBefore, selectedSound);
        this.scheduledNotifications.delete(prayer.id);
      }, delay);

      // Store the scheduled notification
      this.scheduledNotifications.set(prayer.id, {
        prayerId: prayer.id,
        timeoutId: timeoutId as any,
        scheduledTime: prayerDate.toISOString()
      });

    } catch (error) {
      console.error(`Error scheduling notification for ${prayer.name}:`, error);
    }
  }

  private async showNotification(prayer: PrayerTime, minutesBefore: number, soundId: string): Promise<void> {
    try {
      console.log(`Showing notification for ${prayer.name} prayer`);

      // Play sound first
      await this.playAdhanSound(soundId);

      // Show notification
      const notification = new Notification(`${prayer.name} Prayer Time`, {
        body: `${prayer.name} prayer is in ${minutesBefore} minutes (${prayer.time})`,
        icon: '/favicon.ico',
        tag: `prayer-${prayer.id}`,
        requireInteraction: true,
        badge: '/favicon.ico',
        data: {
          prayerId: prayer.id,
          time: prayer.time,
          soundId: soundId
        }
      });

      // Handle notification click
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto-close after 30 seconds
      setTimeout(() => {
        notification.close();
      }, 30000);

    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  private async playAdhanSound(soundId: string): Promise<void> {
    try {
      // Stop any currently playing audio
      const existingAudio = document.querySelector('audio.adhan-notification');
      if (existingAudio) {
        (existingAudio as HTMLAudioElement).pause();
        existingAudio.remove();
      }

      const audio = new Audio(`/audio/${soundId}.mp3`);
      audio.className = 'adhan-notification';
      audio.volume = 0.8;
      
      return new Promise((resolve, reject) => {
        const handleCanPlay = () => {
          audio.play()
            .then(() => {
              console.log(`Successfully played ${soundId} for prayer notification`);
              resolve();
            })
            .catch(reject);
        };

        const handleError = () => {
          reject(new Error('Audio failed to load'));
        };

        const handleEnded = () => {
          resolve();
        };

        audio.addEventListener('canplaythrough', handleCanPlay);
        audio.addEventListener('error', handleError);
        audio.addEventListener('ended', handleEnded);
        
        // Load and play
        audio.load();
      });

    } catch (error) {
      console.error('Error playing adhan sound:', error);
      throw error;
    }
  }

  clearAllNotifications(): void {
    // Clear all scheduled timeouts
    this.scheduledNotifications.forEach((notification) => {
      clearTimeout(notification.timeoutId);
    });
    this.scheduledNotifications.clear();
    console.log('All scheduled notifications cleared');
  }

  clearNotificationForPrayer(prayerId: string): void {
    const notification = this.scheduledNotifications.get(prayerId);
    if (notification) {
      clearTimeout(notification.timeoutId);
      this.scheduledNotifications.delete(prayerId);
      console.log(`Cleared notification for prayer: ${prayerId}`);
    }
  }

  getScheduledNotifications(): ScheduledNotification[] {
    return Array.from(this.scheduledNotifications.values());
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
