
import { getWebSoundFile } from './soundMapping';

export const showWebNotification = (title: string, body: string, soundId: string): void => {
  try {
    new Notification(title, {
      body,
      icon: '/favicon.ico',
      tag: `prayer-notification`,
      requireInteraction: true,
      badge: '/favicon.ico',
      silent: false
    });

    playNotificationSound(soundId);
    vibrateDevice();
  } catch (error) {
    console.error('Error showing web notification:', error);
  }
};

export const playNotificationSound = (soundId: string = 'adhan-traditional'): void => {
  const soundFile = getWebSoundFile(soundId);
  const audio = new Audio(`/audio/${soundFile}`);
  audio.play()
    .catch(error => console.error("Error playing sound:", error));
};

export const vibrateDevice = (): void => {
  if (navigator.vibrate) {
    navigator.vibrate([200, 100, 200]);
  }
};
