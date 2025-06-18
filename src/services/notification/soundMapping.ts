
export const getSoundFileName = (soundId: string): string => {
  console.log('Getting sound filename for soundId:', soundId);
  
  switch (soundId) {
    case 'adhan':
    case 'adhan-traditional':
      return 'adhan.wav';
    case 'soft':
    case 'adhan-soft':
      return 'soft.wav';
    case 'beep':
    case 'notification-beep':
      return 'beep.wav';
    default:
      console.log('Using default sound for unknown soundId:', soundId);
      return 'adhan.wav';
  }
};

export const getWebSoundFile = (soundId: string): string => {
  switch (soundId) {
    case 'adhan':
    case 'adhan-traditional':
      return 'traditional-adhan.mp3';
    case 'soft':
    case 'adhan-soft':
      return 'soft-notification.mp3';
    case 'beep':
    case 'notification-beep':
      return 'makkah-adhan.mp3';
    default:
      return 'traditional-adhan.mp3';
  }
};
