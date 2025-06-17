
export const getSoundFileName = (soundId: string): string => {
  console.log('Getting sound filename for soundId:', soundId);
  
  // Handle the global notification sound key
  if (soundId === 'adhan' || soundId === 'adhan-traditional') {
    return 'adhan.wav';
  }
  
  switch (soundId) {
    case 'adhan-traditional':
      return 'adhan.wav';
    case 'adhan-soft':
    case 'soft':
      return 'soft.wav';
    case 'notification-beep':
    case 'beep':
      return 'beep.wav';
    default:
      console.log('Using default sound for unknown soundId:', soundId);
      return 'adhan.wav';
  }
};

export const getWebSoundFile = (soundId: string): string => {
  switch (soundId) {
    case 'adhan-traditional':
      return 'traditional-adhan.mp3';
    case 'adhan-soft':
      return 'soft-notification.mp3';
    case 'notification-beep':
      return 'makkah-adhan.mp3';
    default:
      return 'traditional-adhan.mp3';
  }
};
