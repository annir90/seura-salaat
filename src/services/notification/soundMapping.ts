
export const getSoundFileName = (soundId: string): string => {
  console.log('Getting sound filename for soundId:', soundId);
  
  // Get the selected sound from localStorage
  const selectedSound = localStorage.getItem('prayerapp-notification-sound') || soundId || 'adhan';
  console.log('Selected sound from localStorage:', selectedSound);
  
  switch (selectedSound) {
    case 'adhan':
    case 'adhan-traditional':
      return 'traditional_adhan.wav';
    case 'soft':
    case 'adhan-soft':
      return 'soft_notification.wav';
    case 'beep':
    case 'notification-beep':
      return 'makkah_adhan.wav';
    case 'makkah_adhan':
      return 'makkah_adhan.wav';
    case 'soft_notification':
      return 'soft_notification.wav';
    case 'traditional_adhan':
      return 'traditional_adhan.wav';
    default:
      console.log('Using default sound for unknown soundId:', selectedSound);
      return 'traditional_adhan.wav';
  }
};

export const getWebSoundFile = (soundId: string): string => {
  // Get the selected sound from localStorage
  const selectedSound = localStorage.getItem('prayerapp-notification-sound') || soundId || 'adhan';
  
  switch (selectedSound) {
    case 'adhan':
    case 'adhan-traditional':
    case 'traditional_adhan':
      return 'traditional-adhan.mp3';
    case 'soft':
    case 'adhan-soft':
    case 'soft_notification':
      return 'soft-notification.mp3';
    case 'beep':
    case 'notification-beep':
    case 'makkah_adhan':
      return 'makkah-adhan.mp3';
    default:
      return 'traditional-adhan.mp3';
  }
};
