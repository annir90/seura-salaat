
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

      // Play sound first - with better mobile support
      await this.playAdhanSoundMobile(soundId);

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
      audio.volume = 0.8;
      
      // Add multiple source formats for better compatibility
      const audioSources = [
        `/audio/${soundId}.mp3`,
        `/audio/${soundId}.wav`,
        `/audio/${soundId}.ogg`
      ];

      // Try different audio sources
      let audioLoaded = false;
      for (const source of audioSources) {
        try {
          audio.src = source;
          await new Promise((resolve, reject) => {
            const handleCanPlay = () => {
              audio.removeEventListener('canplaythrough', handleCanPlay);
              audio.removeEventListener('error', handleError);
              audioLoaded = true;
              resolve(void 0);
            };

            const handleError = () => {
              audio.removeEventListener('canplaythrough', handleCanPlay);
              audio.removeEventListener('error', handleError);
              reject(new Error(`Failed to load audio: ${source}`));
            };

            audio.addEventListener('canplaythrough', handleCanPlay);
            audio.addEventListener('error', handleError);
            
            audio.load();
          });
          
          if (audioLoaded) break;
        } catch (error) {
          console.warn(`Failed to load audio source: ${source}`, error);
          continue;
        }
      }

      if (!audioLoaded) {
        throw new Error('No audio sources could be loaded');
      }

      // Play the audio with mobile-friendly approach
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        await playPromise;
        console.log(`Successfully played ${soundId} for prayer notification`);
      }

      // Add vibration for mobile devices
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
        console.log('Vibration triggered');
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

  // Public method to test sound playback
  async testSound(soundId: string = 'traditional-adhan'): Promise<void> {
    try {
      console.log('Testing sound playback...');
      await this.playAdhanSoundMobile(soundId);
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
