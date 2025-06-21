
export const getSoundFileName = (soundId: string, prayerId?: string): string => {
  console.log('Getting sound filename for soundId:', soundId, 'prayerId:', prayerId);
  
  // Get the selected sound from localStorage
  const selectedSound = localStorage.getItem('prayerapp-notification-sound') || soundId || 'adhan';
  console.log('Selected sound from localStorage:', selectedSound);
  
  // Map to actual filenames without extension for native notifications
  switch (selectedSound) {
    case 'adhan':
    case 'adhan-traditional':
    case 'traditional_adhan':
    case 'makkah_adhan':
      return 'adhan';
    case 'soft':
    case 'adhan-soft':
    case 'soft_notification':
      return 'soft';
    case 'beep':
    case 'notification-beep':
      return 'beep';
    default:
      console.log('Using default sound for unknown soundId:', selectedSound);
      return 'adhan';
  }
};
