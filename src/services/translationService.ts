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
  
  // Share app section
  shareApp: string;
  shareAppDesc: string;
  shareAppButton: string;
  qrCode: string;
  
  // Quran page
  selectSurahToRead: string;
  continueReading: string;
  endOfSurah: string;
  verses: string;
  
  // Calendar page
  prayerCalendar: string;
  chooseDayPrompt: string;
  selectDatePrompt: string;
  prayerTimesFor: string;
  noPrayerTimes: string;
  
  // Qibla page
  qiblaFinder: string;
  qiblaDirection: string;
  deviceHeading: string;
  calibrateCompass: string;
  compassCalibrated: string;
  qiblaInstructions: string;
  fromNorth: string;
  
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
  
  // Share app section
  shareApp: "Share the App",
  shareAppDesc: "Help others discover Seura Prayer! Share this app with your friends and family.",
  shareAppButton: "Share App",
  qrCode: "QR Code",
  
  // Quran page
  selectSurahToRead: "Select a Surah to begin reading",
  continueReading: "Continue Reading",
  endOfSurah: "End of Surah",
  verses: "verses",
  
  // Calendar page
  prayerCalendar: "Prayer Calendar",
  chooseDayPrompt: "Choose the day you want to know!",
  selectDatePrompt: "Select a date from the calendar above to view prayer times for that day.",
  prayerTimesFor: "Prayer Times for",
  noPrayerTimes: "No prayer times available for this date.",
  
  // Qibla page
  qiblaFinder: "Qibla Finder",
  qiblaDirection: "Qibla Direction",
  deviceHeading: "Device heading",
  calibrateCompass: "Calibrate Compass",
  compassCalibrated: "Compass calibrated successfully",
  qiblaInstructions: "Hold your device flat and away from magnetic interference. Allow location access for accurate Qibla direction.",
  fromNorth: "from North",
  
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
  
  // Share app section
  shareApp: "Jaa sovellus",
  shareAppDesc: "Auta muita löytämään Seura Prayer! Jaa tämä sovellus ystävillesi ja perheellesi.",
  shareAppButton: "Jaa sovellus",
  qrCode: "QR-koodi",
  
  // Quran page
  selectSurahToRead: "Valitse suura aloittaaksesi lukemisen",
  continueReading: "Jatka lukemista",
  endOfSurah: "Suuran loppu",
  verses: "säettä",
  
  // Calendar page
  prayerCalendar: "Rukouskalenteri",
  chooseDayPrompt: "Valitse päivä jonka haluat tietää!",
  selectDatePrompt: "Valitse päivämäärä kalenterista yllä nähdäksesi kyseisen päivän rukousajat.",
  prayerTimesFor: "Rukousajat",
  noPrayerTimes: "Rukousaikoja ei ole saatavilla tälle päivälle.",
  
  // Qibla page
  qiblaFinder: "Qibla-etsijä",
  qiblaDirection: "Qibla-suunta",
  deviceHeading: "Laitteen suunta",
  calibrateCompass: "Kalibroi kompassi",
  compassCalibrated: "Kompassi kalibroitu onnistuneesti",
  qiblaInstructions: "Pidä laitetta tasaisena ja kaukana magneettisista häiriöistä. Salli sijaintipääsy tarkkaa Qibla-suuntaa varten.",
  fromNorth: "pohjoisesta",
  
  // Common
  loading: "Ladataan...",
  error: "Virhe",
  success: "Onnistui"
};

const albanianTranslations: Translation = {
  // Navigation
  home: "Shtëpia",
  qibla: "Kibla",
  calendar: "Kalendar",
  quran: "Kuran", 
  settings: "Cilësimet",
  
  // Home page
  prayerSchedule: "Orari i Namazit",
  jumaaPrayer: "Namazi i Xhumasë",
  prayerTime: "Koha e namazit",
  joinUsText: "Bashkohuni me ne për namazin e xhumasë në xhami. Kujtoni të mbërrini herët për hutbenë.",
  
  // Prayer names
  fajr: "Sabahu",
  sunrise: "Lindja e diellit",
  dhuhr: "Dreka", 
  asr: "Ikindia",
  maghrib: "Akshami",
  isha: "Jacia",
  
  // Settings page
  userStatus: "Statusi i Përdoruesit",
  signedIn: "Të kyçur",
  visitor: "Vizitor",
  notSignedIn: "Jo të kyçur",
  visitorMode: "Modaliteti vizitor",
  signOut: "Dalje",
  appearance: "Pamja",
  theme: "Tema",
  light: "E çelët",
  dark: "E errët",
  locationSettings: "Cilësimet e Vendndodhjes",
  autoDetectLocation: "Zbulo vendndodhjen automatikisht",
  autoDetectLocationDesc: "Zbulo automatikisht vendndodhjen tuaj aktuale",
  detect: "Zbulo",
  selectLocation: "Zgjidhni vendndodhjen",
  notificationSettings: "Cilësimet e Njoftimeve",
  prayerNotifications: "Njoftimet e Namazit",
  prayerNotificationsDesc: "Merrni njoftimet para kohës së namazit",
  notificationTiming: "Koha e Njoftimit",
  minutesBefore: "minuta para",
  language: "Gjuha",
  
  // Share app section
  shareApp: "Ndani Aplikacionin",
  shareAppDesc: "Ndihmoni të tjerët të zbulojnë Seura Prayer! Ndani këtë aplikacion me miqtë dhe familjen tuaj.",
  shareAppButton: "Ndani Aplikacionin",
  qrCode: "Kodi QR",
  
  // Quran page
  selectSurahToRead: "Zgjidhni një sure për të filluar leximin",
  continueReading: "Vazhdoni Leximin",
  endOfSurah: "Fundi i sures",
  verses: "ajete",
  
  // Calendar page
  prayerCalendar: "Kalendari i Namazit",
  chooseDayPrompt: "Zgjidhni ditën që doni të dini!",
  selectDatePrompt: "Zgjidhni një datë nga kalendari më lart për të parë kohët e namazit për atë ditë.",
  prayerTimesFor: "Kohët e namazit për",
  noPrayerTimes: "Nuk ka kohë namazi të disponueshme për këtë datë.",
  
  // Qibla page
  qiblaFinder: "Gjetuesi i Kiblës",
  qiblaDirection: "Drejtimi i Kiblës",
  deviceHeading: "Drejtimi i pajisjes",
  calibrateCompass: "Kalibroni busullën",
  compassCalibrated: "Busulla u kalibrua me sukses",
  qiblaInstructions: "Mbajeni pajisjen tuaj të sheshtë dhe larg ndërhyrjeve magnetike. Lejoni qasjen në vendndodhje për drejtimin e saktë të Kiblës.",
  fromNorth: "nga Veriu",
  
  // Common
  loading: "Duke u ngarkuar...",
  error: "Gabim",
  success: "Sukses"
};

export type LanguageCode = 'en' | 'fi' | 'sq';

const translations: Record<LanguageCode, Translation> = {
  en: englishTranslations,
  fi: finnishTranslations,
  sq: albanianTranslations
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
