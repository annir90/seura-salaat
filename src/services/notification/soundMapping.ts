
export const getSoundFileName = (soundId: string): string => {
  console.log('Getting sound filename for soundId:', soundId);
  
  // Get the selected sound from localStorage
  const selectedSound = localStorage.getItem('prayerapp-notification-sound') || soundId || 'adhan';
  console.log('Selected sound from localStorage:', selectedSound);
  
  // Map to actual filenames without extension for native notifications
  switch (selectedSound) {
    case 'adhan':
    case 'adhan-traditional':
    case 'traditional_adhan':
      return 'adhan';
    case 'soft':
    case 'adhan-soft':
    case 'soft_notification':
      return 'soft';
    case 'beep':
    case 'notification-beep':
    case 'makkah_adhan':
      return 'beep';
    default:
      console.log('Using default sound for unknown soundId:', selectedSound);
      return 'adhan';
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
