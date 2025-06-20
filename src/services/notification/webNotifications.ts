
// This file is kept for compatibility but contains no web functionality
// since this app is Android-only

export const showWebNotification = (title: string, body: string, soundId: string): void => {
  console.warn('Web notifications are not supported - this app is Android-only');
};

export const playNotificationSound = (soundId: string = 'adhan'): void => {
  console.warn('Web sound playback is not supported - this app is Android-only');
};

export const vibrateDevice = (): void => {
  console.warn('Web vibration is not supported - this app is Android-only');
};
