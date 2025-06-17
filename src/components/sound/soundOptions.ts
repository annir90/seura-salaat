
export interface SoundOption {
  id: string;
  name: string;
  file: string;
  description: string;
}

export const soundOptions: SoundOption[] = [
  {
    id: "adhan-traditional",
    name: "Adhan",
    file: "/audio/traditional-adhan.mp3",
    description: "Traditional Adhan sound"
  },
  {
    id: "adhan-soft", 
    name: "Soft",
    file: "/audio/soft-notification.mp3",
    description: "Soft notification sound"
  },
  {
    id: "notification-beep",
    name: "Beep",
    file: "/audio/makkah-adhan.mp3", 
    description: "Simple beep notification"
  }
];
