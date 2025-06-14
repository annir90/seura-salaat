
import { PrayerTime } from "./prayerTimeService";

interface ScheduledNotification {
  prayerId: string;
  timeoutId: number;
  scheduledTime: string;
}

class NotificationService {
  private scheduledNotifications: Map<string, ScheduledNotification> = new Map();
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
  private audioContext: AudioContext | null = null;

  constructor() {
    this.initializeServiceWorker();
    this.initializeAudioContext();
  }

  private async initializeServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully');
        
        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'PRAYER_NOTIFICATION') {
            this.handleBackgroundNotification(event.data);
          }
        });
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  private async initializeAudioContext() {
    try {
      // Create AudioContext only when needed and after user interaction
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log('AudioContext initialized');
    } catch (error) {
      console.warn('AudioContext not supported:', error);
    }
  }

  private async handleBackgroundNotification(data: any) {
    try {
      await this.playAdhanSoundMobile(data.soundId);
      this.triggerHapticFeedback();
    } catch (error) {
      console.error('Error handling background notification:', error);
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

    // Get global notification setting
    const globalNotificationsEnabled = localStorage.getItem('prayer-notifications-enabled') !== 'false';

    if (!globalNotificationsEnabled) {
      console.log('Prayer notifications are disabled globally');
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
      await this.schedulePrayerNotification(prayer);
    }

    // Mark as scheduled for today
    localStorage.setItem('last-scheduled-date', today);
    console.log('All prayer notifications scheduled for today');
  }

  private async schedulePrayerNotification(prayer: PrayerTime): Promise<void> {
    try {
      // Check if notifications are enabled for this specific prayer
      const prayerNotificationEnabled = localStorage.getItem(`prayer-notification-${prayer.id}`) !== 'false';
      
      if (!prayerNotificationEnabled) {
        console.log(`Notifications disabled for ${prayer.name}`);
        return;
      }

      // Get timing for this specific prayer (default to 10 if not set)
      const minutesBefore = parseInt(localStorage.getItem(`prayer-timing-${prayer.id}`) || '10', 10);
      
      const now = new Date();
      const [hours, minutes] = prayer.time.split(':').map(Number);
      
      const prayerDate = new Date();
      prayerDate.setHours(hours, minutes - minutesBefore, 0, 0);

      // If notification time has passed today, schedule for tomorrow
      if (prayerDate <= now) {
        prayerDate.setDate(prayerDate.getDate() + 1);
      }

      const delay = prayerDate.getTime() - now.getTime();
      console.log(`Scheduling ${prayer.name} notification in ${Math.round(delay / 1000)} seconds (${minutesBefore} min before prayer)`);

      // Get user's selected sound for this prayer
      const selectedSound = localStorage.getItem(`prayer_adhan_${prayer.id}`) || 'traditional-adhan';

      // Use service worker for background notifications that work when app is closed
      if (this.serviceWorkerRegistration && this.serviceWorkerRegistration.active) {
        this.serviceWorkerRegistration.active.postMessage({
          type: 'SCHEDULE_PRAYER_NOTIFICATION',
          prayerName: prayer.name,
          prayerId: prayer.id,
          time: prayer.time,
          delay: delay,
          soundId: selectedSound,
          minutesBefore: minutesBefore,
          scheduledFor: prayerDate.getTime()
        });

        console.log(`Background notification scheduled for ${prayer.name} at ${prayerDate.toLocaleString()}`);
      }

      // Also schedule in main thread as fallback for when app is open
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
      await this.playAdhanSoundMobile(soundId);

      // Trigger haptic feedback
      this.triggerHapticFeedback();

      // Show notification with proper settings for background operation
      const notificationOptions: NotificationOptions = {
        body: `${prayer.name} prayer is in ${minutesBefore} minutes (${prayer.time})`,
        icon: '/favicon.ico',
        tag: `prayer-${prayer.id}`,
        requireInteraction: true,
        badge: '/favicon.ico',
        silent: false,
        data: {
          prayerId: prayer.id,
          time: prayer.time,
          soundId: soundId
        }
      };

      if ('serviceWorker' in navigator && this.serviceWorkerRegistration) {
        // Use service worker to show notification for better background support
        await this.serviceWorkerRegistration.showNotification(
          `${prayer.name} Prayer Time`,
          notificationOptions
        );
      } else {
        // Fallback to regular notification
        const notification = new Notification(`${prayer.name} Prayer Time`, notificationOptions);
        
        // Handle notification click
        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        // Auto-close after 30 seconds
        setTimeout(() => {
          notification.close();
        }, 30000);
      }

      // Trigger vibration after showing notification
      this.triggerHapticFeedback();

    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  private triggerHapticFeedback(): void {
    try {
      // Vibration API for haptic feedback
      if ('vibrate' in navigator) {
        // Strong vibration pattern for prayer notification
        navigator.vibrate([300, 100, 300, 100, 300]);
        console.log('Haptic feedback triggered');
      }
    } catch (error) {
      console.error('Haptic feedback failed:', error);
    }
  }

  private async playAdhanSoundMobile(soundId: string): Promise<void> {
    try {
      console.log(`Attempting to play sound: ${soundId}`);

      // Resume AudioContext if suspended (required for mobile)
      if (this.audioContext && this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
        console.log('AudioContext resumed');
      }

      // Stop any currently playing audio
      const existingAudio = document.querySelector('audio.adhan-notification');
      if (existingAudio) {
        (existingAudio as HTMLAudioElement).pause();
        existingAudio.remove();
      }

      // Create audio element with better mobile support
      const audio = new Audio();
      audio.className = 'adhan-notification';
      audio.preload = 'auto';
      audio.volume = 0.9;
      
      // Set the audio source
      audio.src = `/audio/${soundId}.mp3`;

      // Load and play the audio
      await new Promise((resolve, reject) => {
        const handleCanPlay = () => {
          audio.removeEventListener('canplaythrough', handleCanPlay);
          audio.removeEventListener('error', handleError);
          resolve(void 0);
        };

        const handleError = () => {
          audio.removeEventListener('canplaythrough', handleCanPlay);
          audio.removeEventListener('error', handleError);
          reject(new Error(`Failed to load audio: ${audio.src}`));
        };

        audio.addEventListener('canplaythrough', handleCanPlay);
        audio.addEventListener('error', handleError);
        
        audio.load();
      });

      // Play the audio
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        await playPromise;
        console.log(`Successfully played ${soundId} for prayer notification`);
      }

    } catch (error) {
      console.error('Error playing adhan sound:', error);
      
      // Fallback: Try to play a simple beep sound
      try {
        if (this.audioContext) {
          const oscillator = this.audioContext.createOscillator();
          const gainNode = this.audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(this.audioContext.destination);
          
          oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
          gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1);
          
          oscillator.start(this.audioContext.currentTime);
          oscillator.stop(this.audioContext.currentTime + 1);
          
          console.log('Fallback beep sound played');
        }
      } catch (fallbackError) {
        console.error('Fallback sound also failed:', fallbackError);
      }
      
      throw error;
    }
  }

  // Public method to test sound playback with haptic feedback
  async testSound(soundId: string = 'traditional-adhan'): Promise<void> {
    try {
      console.log('Testing sound playback and haptic feedback...');
      await this.playAdhanSoundMobile(soundId);
      this.triggerHapticFeedback();
    } catch (error) {
      console.error('Sound test failed:', error);
      throw error;
    }
  }

  clearAllNotifications(): void {
    // Clear all scheduled timeouts
    this.scheduledNotifications.forEach((notification) => {
      clearTimeout(notification.timeoutId);
    });
    this.scheduledNotifications.clear();

    // Clear service worker notifications
    if (this.serviceWorkerRegistration && this.serviceWorkerRegistration.active) {
      this.serviceWorkerRegistration.active.postMessage({
        type: 'CLEAR_ALL_NOTIFICATIONS'
      });
    }

    // Clear any pending browser notifications
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          registration.getNotifications().then(notifications => {
            notifications.forEach(notification => notification.close());
          });
        });
      });
    }

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
