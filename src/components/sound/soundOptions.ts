
export interface SoundOption {
  id: string;
  name: string;
  file: string;
  description: string;
  nativeSound: string; // Add native sound name for notifications
}

export const soundOptions: SoundOption[] = [
  {
    id: "adhan-traditional",
    name: "Adhan",
    file: "/audio/traditional-adhan.mp3",
    description: "Traditional Adhan sound",
    nativeSound: "adhan" // Maps to adhan.wav in res/raw/
  },
  {
    id: "adhan-soft", 
    name: "Soft",
    file: "/audio/soft-notification.mp3",
    description: "Soft notification sound",
    nativeSound: "soft" // Maps to soft.wav in res/raw/
  },
  {
    id: "notification-beep",
    name: "Beep",
    file: "/audio/makkah-adhan.mp3", 
    description: "Simple beep notification",
    nativeSound: "beep" // Maps to beep.wav in res/raw/
  }
];
