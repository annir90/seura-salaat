
export interface Translation {
  // Navigation
  home: string;
  qibla: string;
  calendar: string;
  quran: string;
  settings: string;
  
  // Home page
  prayerSchedule: string;
  jumaaPrayer: string;
  prayerTime: string;
  joinUsText: string;
  
  // Prayer names
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  
  // Settings page
  userStatus: string;
  signedIn: string;
  visitor: string;
  notSignedIn: string;
  visitorMode: string;
  signOut: string;
  appearance: string;
  theme: string;
  light: string;
  dark: string;
  locationSettings: string;
  autoDetectLocation: string;
  autoDetectLocationDesc: string;
  detect: string;
  selectLocation: string;
  notificationSettings: string;
  prayerNotifications: string;
  prayerNotificationsDesc: string;
  notificationTiming: string;
  minutesBefore: string;
  language: string;
  
  // Quran page
  selectSurahToRead: string;
  continueReading: string;
  endOfSurah: string;
  verses: string;
  
  // Common
  loading: string;
  error: string;
  success: string;
}

const englishTranslations: Translation = {
  // Navigation
  home: "Home",
  qibla: "Qibla",
  calendar: "Calendar", 
  quran: "Quran",
  settings: "Settings",
  
  // Home page
  prayerSchedule: "Prayer Schedule",
  jumaaPrayer: "Jumaa Prayer",
  prayerTime: "Prayer time",
  joinUsText: "Join us for Friday prayer (Salat al-Jumaa) at the mosque. Remember to arrive early for the khutbah.",
  
  // Prayer names
  fajr: "Fajr",
  sunrise: "Sunrise", 
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
  
  // Settings page
  userStatus: "User Status",
  signedIn: "Signed in",
  visitor: "Visitor",
  notSignedIn: "Not signed in",
  visitorMode: "Visitor mode",
  signOut: "Sign Out",
  appearance: "Appearance",
  theme: "Theme",
  light: "Light",
  dark: "Dark",
  locationSettings: "Location Settings",
  autoDetectLocation: "Auto-detect Location",
  autoDetectLocationDesc: "Automatically detect your current location",
  detect: "Detect",
  selectLocation: "Select Location",
  notificationSettings: "Notification Settings",
  prayerNotifications: "Prayer Notifications",
  prayerNotificationsDesc: "Receive notifications before prayer times",
  notificationTiming: "Notification Timing",
  minutesBefore: "minutes before",
  language: "Language",
  
  // Quran page
  selectSurahToRead: "Select a Surah to begin reading",
  continueReading: "Continue Reading",
  endOfSurah: "End of Surah",
  verses: "verses",
  
  // Common
  loading: "Loading...",
  error: "Error",
  success: "Success"
};

const finnishTranslations: Translation = {
  // Navigation
  home: "Koti",
  qibla: "Qibla",
  calendar: "Kalenteri",
  quran: "Koraani", 
  settings: "Asetukset",
  
  // Home page
  prayerSchedule: "Rukousaikataulu",
  jumaaPrayer: "Jumaa-rukous",
  prayerTime: "Rukousaika",
  joinUsText: "Liity meihin perjantain rukouksessa (Salat al-Jumaa) moskeijassa. Muista saapua ajoissa khutbaa varten.",
  
  // Prayer names
  fajr: "Fajr",
  sunrise: "Auringonnousu",
  dhuhr: "Dhuhr", 
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
  
  // Settings page
  userStatus: "Käyttäjän tila",
  signedIn: "Kirjautunut sisään",
  visitor: "Vierailija",
  notSignedIn: "Ei kirjautunut",
  visitorMode: "Vierailijatila",
  signOut: "Kirjaudu ulos",
  appearance: "Ulkoasu",
  theme: "Teema",
  light: "Vaalea",
  dark: "Tumma",
  locationSettings: "Sijaintiasetukset",
  autoDetectLocation: "Tunnista sijainti automaattisesti",
  autoDetectLocationDesc: "Tunnista nykyinen sijaintisi automaattisesti",
  detect: "Tunnista",
  selectLocation: "Valitse sijainti",
  notificationSettings: "Ilmoitusasetukset",
  prayerNotifications: "Rukousilmoitukset",
  prayerNotificationsDesc: "Vastaanota ilmoituksia ennen rukousaikoja",
  notificationTiming: "Ilmoituksen ajoitus",
  minutesBefore: "minuuttia ennen",
  language: "Kieli",
  
  // Quran page
  selectSurahToRead: "Valitse suura aloittaaksesi lukemisen",
  continueReading: "Jatka lukemista",
  endOfSurah: "Suuran loppu",
  verses: "säettä",
  
  // Common
  loading: "Ladataan...",
  error: "Virhe",
  success: "Onnistui"
};

export type LanguageCode = 'en' | 'fi';

const translations: Record<LanguageCode, Translation> = {
  en: englishTranslations,
  fi: finnishTranslations
};

let currentLanguage: LanguageCode = 'en';

export const setLanguage = (language: LanguageCode) => {
  currentLanguage = language;
  localStorage.setItem('app-language', language);
};

export const getCurrentLanguage = (): LanguageCode => {
  const saved = localStorage.getItem('app-language') as LanguageCode;
  if (saved && translations[saved]) {
    currentLanguage = saved;
    return saved;
  }
  return 'en';
};

export const getTranslation = (): Translation => {
  return translations[getCurrentLanguage()];
};

export const t = (key: keyof Translation): string => {
  return getTranslation()[key];
};

// Initialize language on module load
currentLanguage = getCurrentLanguage();
