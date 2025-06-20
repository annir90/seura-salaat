
export const getSoundFileName = (soundId: string, prayerId?: string): string => {
  console.log('Getting sound filename for soundId:', soundId, 'prayerId:', prayerId);
  
  // Check for custom sound first if prayerId is provided
  if (prayerId) {
    const customSoundPath = localStorage.getItem(`custom_sound_${prayerId}`);
    if (customSoundPath) {
      console.log('Using custom sound for prayer:', prayerId, customSoundPath);
      // Extract filename without path and extension for Android
      const fileName = customSoundPath.split('/').pop()?.split('.')[0] || 'adhan';
      return fileName;
    }
  }
  
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

export const saveCustomSoundForPrayer = (prayerId: string, soundPath: string, fileName: string): void => {
  localStorage.setItem(`custom_sound_${prayerId}`, soundPath);
  localStorage.setItem(`custom_sound_filename_${prayerId}`, fileName);
  console.log(`Saved custom sound for prayer ${prayerId}:`, soundPath);
};

export const getCustomSoundForPrayer = (prayerId: string): string | null => {
  return localStorage.getItem(`custom_sound_${prayerId}`);
};

export const removeCustomSoundForPrayer = (prayerId: string): void => {
  localStorage.removeItem(`custom_sound_${prayerId}`);
  localStorage.removeItem(`custom_sound_filename_${prayerId}`);
  console.log(`Removed custom sound for prayer ${prayerId}`);
};
