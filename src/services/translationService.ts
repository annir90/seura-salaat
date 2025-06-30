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
  next: string;
  
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
  darkMode: string;
  lightMode: string;
  darkThemeEnabled: string;
  lightThemeEnabled: string;
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
  enableNotifications: string;
  howManyMinutesBefore: string;
  
  // Notification settings - new additions
  notificationPermissionGranted: string;
  notificationPermissionDenied: string;
  atPrayerTime: string;
  manageNotificationSettings: string;
  notificationPermissionRequired: string;
  notificationPermissionDescription: string;
  notificationSound: string;
  testNotificationSent: string;
  sendTestNotification: string;
  prayerReminder: string;
  in: string;
  minutes: string;
  
  // Share app section
  shareApp: string;
  shareAppDesc: string;
  shareAppButton: string;
  qrCode: string;
  
  // Support the mosque section
  supportTheMosque: string;
  helpUsServeTheCommunity: string;
  supportMosqueDescription: string;
  bankIban: string;
  receiver: string;
  mayAllahRewardYourGenerosity: string;
  copy: string;
  
  // Privacy policy
  privacyPolicy: string;
  howWeProtectYourData: string;
  
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
  
  // Tasbih page
  tasbihCounter: string;
  digitalDhikr: string;
  currentCount: string;
  cyclesCompleted: string;
  cycle: string;
  cycles: string;
  completed: string;
  tapPlusToCount: string;
  traditionalCycle: string;
  repetitions: string;
  counterSettings: string;
  hapticFeedback: string;
  vibrateOnTap: string;
  vibrationEnabled: string;
  vibrationDisabled: string;
  on: string;
  off: string;
  commonDhikr: string;
  subhanAllah: string;
  alhamdulillah: string;
  allahuAkbar: string;
  tasbihCounterReset: string;
  
  // Settings page additional
  manageAppPreferences: string;
  general: string;
  languageSettings: string;
  notifications: string;
  blockAllowPriorities: string;
  about: string;
  knowAboutApp: string;
  logOut: string;
  logOutFromApp: string;
  appVersion: string;
  
  // Date translations
  weekdays: {
    sunday: string;
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
  };
  months: {
    january: string;
    february: string;
    march: string;
    april: string;
    may: string;
    june: string;
    july: string;
    august: string;
    september: string;
    october: string;
    november: string;
    december: string;
  };
  
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
  next: "Next",
  
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
  darkMode: "Dark Mode",
  lightMode: "Light Mode",
  darkThemeEnabled: "Dark theme enabled",
  lightThemeEnabled: "Light theme enabled",
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
  enableNotifications: "Enable Notifications",
  howManyMinutesBefore: "How many minutes before prayer time to notify",
  
  // Notification settings - new additions
  notificationPermissionGranted: "Notification permission granted",
  notificationPermissionDenied: "Notification permission denied",
  atPrayerTime: "At prayer time",
  manageNotificationSettings: "Manage prayer notification settings",
  notificationPermissionRequired: "Notification Permission Required",
  notificationPermissionDescription: "Enable notifications to receive prayer reminders",
  notificationSound: "Notification Sound",
  testNotificationSent: "Test notification sent",
  sendTestNotification: "Send Test Notification",
  prayerReminder: "Prayer Reminder",
  in: "in",
  minutes: "minutes",
  
  // Share app section
  shareApp: "Share the App",
  shareAppDesc: "Help others discover Seura Prayer! Share this app with your friends and family.",
  shareAppButton: "Share App",
  qrCode: "QR Code",
  
  // Support the mosque section
  supportTheMosque: "Support the Mosque",
  helpUsServeTheCommunity: "Help us serve the community",
  supportMosqueDescription: "Your donations help us maintain the mosque and serve the Muslim community better.",
  bankIban: "Bank IBAN:",
  receiver: "Receiver:",
  mayAllahRewardYourGenerosity: "May Allah reward your generosity",
  copy: "Copy",
  
  // Privacy policy
  privacyPolicy: "Privacy Policy",
  howWeProtectYourData: "How we protect your data",
  
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
  
  // Tasbih page
  tasbihCounter: "Tasbih Counter",
  digitalDhikr: "Digital dhikr and tasbih counter",
  currentCount: "Current Count",
  cyclesCompleted: "cycle completed",
  cycle: "cycle",
  cycles: "cycles",
  completed: "completed",
  tapPlusToCount: "Tap the + button to count your dhikr",
  traditionalCycle: "Traditional cycle: 33 repetitions",
  repetitions: "repetitions",
  counterSettings: "Counter Settings",
  hapticFeedback: "Haptic Feedback",
  vibrateOnTap: "Vibrate on each tap for better feedback",
  vibrationEnabled: "Vibration enabled",
  vibrationDisabled: "Vibration disabled",
  on: "On",
  off: "Off",
  commonDhikr: "Common Dhikr",
  subhanAllah: "Subhan Allah (Glory be to Allah)",
  alhamdulillah: "Alhamdulillah (Praise be to Allah)",
  allahuAkbar: "Allahu Akbar (Allah is Greatest)",
  tasbihCounterReset: "Tasbih counter reset to 0",
  
  // Settings page additional
  manageAppPreferences: "Manage your app preferences",
  general: "General",
  languageSettings: "Language settings",
  notifications: "Notifications",
  blockAllowPriorities: "Block, Allow, priorities",
  about: "About",
  knowAboutApp: "Know about our app",
  logOut: "Log out",
  logOutFromApp: "Log out from app",
  appVersion: "PrayConnect v1.0",
  
  // Date translations
  weekdays: {
    sunday: "Sunday",
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday"
  },
  months: {
    january: "January",
    february: "February",
    march: "March",
    april: "April",
    may: "May",
    june: "June",
    july: "July",
    august: "August",
    september: "September",
    october: "October",
    november: "November",
    december: "December"
  },
  
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
  next: "Seuraava",
  
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
  darkMode: "Tumma tila",
  lightMode: "Vaalea tila",
  darkThemeEnabled: "Tumma teema käytössä",
  lightThemeEnabled: "Vaalea teema käytössä",
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
  enableNotifications: "Ota ilmoitukset käyttöön",
  howManyMinutesBefore: "Kuinka monta minuuttia ennen rukousaikaa ilmoitetaan",
  
  // Notification settings - new additions
  notificationPermissionGranted: "Ilmoituslupa myönnetty",
  notificationPermissionDenied: "Ilmoituslupa evätty",
  atPrayerTime: "Rukousaikaan",
  manageNotificationSettings: "Hallitse rukousilmoitusasetuksia",
  notificationPermissionRequired: "Ilmoituslupa vaaditaan",
  notificationPermissionDescription: "Ota ilmoitukset käyttöön saadaksesi rukousmuistutuksia",
  notificationSound: "Ilmoitusääni",
  testNotificationSent: "Testi-ilmoitus lähetetty",
  sendTestNotification: "Lähetä testi-ilmoitus",
  prayerReminder: "Rukousmuistutus",
  in: "sisään",
  minutes: "minuuttia",
  
  // Share app section
  shareApp: "Jaa sovellus",
  shareAppDesc: "Auta muita löytämään Seura Prayer! Jaa tämä sovellus ystävillesi ja perheellesi.",
  shareAppButton: "Jaa sovellus",
  qrCode: "QR-koodi",
  
  // Support the mosque section
  supportTheMosque: "Tue moskeijaa",
  helpUsServeTheCommunity: "Auta meitä palvelemaan yhteisöä",
  supportMosqueDescription: "Lahjoituksesi auttavat meitä ylläpitämään moskeijaa ja palvelemaan muslimi-yhteisöä paremmin.",
  bankIban: "Pankin IBAN:",
  receiver: "Vastaanottaja:",
  mayAllahRewardYourGenerosity: "Allah palkitkoon anteliaisuutesi",
  copy: "Kopioi",
  
  // Privacy policy
  privacyPolicy: "Tietosuojakäytäntö",
  howWeProtectYourData: "Kuinka suojaamme tietojasi",
  
  // Quran page
  selectSurahToRead: "Valitse suura aloittaaksesi lukemisen",
  continueReading: "Jatka lukemista",
  endOfSurah: "Suuran loppu",
  verses: "säettä",
  
  // Calendar page
  prayerCalendar: "Rukouskalenteri",
  chooseDayPrompt: "Valitse päivä jonka haluat tietää!",
  selectDatePrompt: "Valitse päivämäärä kalendariista yllä nähdäksesi kyseisen päivän rukousajat.",
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
  
  // Tasbih page
  tasbihCounter: "Tasbih-laskuri",
  digitalDhikr: "Digitaalinen dhikr ja tasbih-laskuri",
  currentCount: "Nykyinen määrä",
  cyclesCompleted: "kierros suoritettu",
  cycle: "kierros",
  cycles: "kierrosta",
  completed: "suoritettu",
  tapPlusToCount: "Napauta + -painiketta laskeaksesi dhikr",
  traditionalCycle: "Perinteinen kierros: 33 toistoa",
  repetitions: "toistoa",
  counterSettings: "Laskurin asetukset",
  hapticFeedback: "Haptinen palaute",
  vibrateOnTap: "Värinä jokaisella napautuksella paremman palautteen saamiseksi",
  vibrationEnabled: "Värinä käytössä",
  vibrationDisabled: "Värinä pois käytöstä",
  on: "Päällä",
  off: "Pois",
  commonDhikr: "Yleinen dhikr",
  subhanAllah: "Subhan Allah (Kunnia Allahille)",
  alhamdulillah: "Alhamdulillah (Kiitos Allahille)",
  allahuAkbar: "Allahu Akbar (Allah on suurin)",
  tasbihCounterReset: "Tasbih-laskuri nollattu",
  
  // Settings page additional
  manageAppPreferences: "Hallitse sovelluksen asetuksia",
  general: "Yleinen",
  languageSettings: "Kieliasetukset",
  notifications: "Ilmoitukset",
  blockAllowPriorities: "Estä, salli, prioritetetit",
  about: "Tietoja",
  knowAboutApp: "Tietoja sovelluksestamme",
  logOut: "Kirjaudu ulos",
  logOutFromApp: "Kirjaudu ulos sovelluksesta",
  appVersion: "PrayConnect v1.0",
  
  // Date translations
  weekdays: {
    sunday: "Sunnuntai",
    monday: "Maanantai",
    tuesday: "Tiistai",
    wednesday: "Keskiviikko",
    thursday: "Torstai",
    friday: "Perjantai",
    saturday: "Lauantai"
  },
  months: {
    january: "Tammikuu",
    february: "Helmikuu",
    march: "Maaliskuu",
    april: "Huhtikuu",
    may: "Toukokuu",
    june: "Kesäkuu",
    july: "Heinäkuu",
    august: "Elokuu",
    september: "Syyskuu",
    october: "Lokakuu",
    november: "Marraskuu",
    december: "Joulukuu"
  },
  
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
  next: "Tjetër",
  
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
  darkMode: "Modaliteti i errët",
  lightMode: "Modaliteti i çelët",
  darkThemeEnabled: "Tema e errët e aktivizuar",
  lightThemeEnabled: "Tema e çelët e aktivizuar",
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
  enableNotifications: "Aktivizo njoftimet",
  howManyMinutesBefore: "Sa minuta para kohës së namazit të njoftohet",
  
  // Notification settings - new additions
  notificationPermissionGranted: "Leja e njoftimeve u dha",
  notificationPermissionDenied: "Leja e njoftimeve u refuzua",
  atPrayerTime: "Në kohën e namazit",
  manageNotificationSettings: "Menaxho cilësimet e njoftimeve të namazit",
  notificationPermissionRequired: "Leja e Njoftimeve e Nevojshme",
  notificationPermissionDescription: "Aktivizo njoftimet për të marrë kujtues namazi",
  notificationSound: "Zëri i Njoftimit",
  testNotificationSent: "Njoftimi i testit u dërgua",
  sendTestNotification: "Dërgo Njoftim Testi",
  prayerReminder: "Kujtuesi i Namazit",
  in: "në",
  minutes: "minuta",
  
  // Share app section
  shareApp: "Ndani Aplikacionin",
  shareAppDesc: "Ndihmoni të tjerët të zbulojnë Seura Prayer! Ndani këtë aplikacion me miqtë dhe familjen tuaj.",
  shareAppButton: "Ndani Aplikacionin",
  qrCode: "Kodi QR",
  
  // Support the mosque section
  supportTheMosque: "Mbështetni Xhaminë",
  helpUsServeTheCommunity: "Ndihmoni për të shërbyer komunitetit",
  supportMosqueDescription: "Donacionet tuaja na ndihmojnë të mirëmbajmë xhaminë dhe të shërbejmë më mirë komunitetit musliman.",
  bankIban: "IBAN i Bankës:",
  receiver: "Pranuesi:",
  mayAllahRewardYourGenerosity: "All-llahu ju shpërbleftë për bujari tuaj",
  copy: "Kopjo",
  
  // Privacy policy
  privacyPolicy: "Politika e Privatësisë",
  howWeProtectYourData: "Si i mbrojmë të dhënat tuaja",
  
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
  
  // Tasbih page
  tasbihCounter: "Numëruesi i Tesbihut",
  digitalDhikr: "Numëruesi dixhital i dhikrit dhe tesbihut",
  currentCount: "Numërimi Aktual",
  cyclesCompleted: "cikël i kompletuar",
  cycle: "cikël",
  cycles: "cikle",
  completed: "të kompletuar",
  tapPlusToCount: "Prekni butonin + për të numëruar dhikrin tuaj",
  traditionalCycle: "Cikli tradicional: 33 përsëritje",
  repetitions: "përsëritje",
  counterSettings: "Cilësimet e Numëruesit",
  hapticFeedback: "Reagimi Haptik",
  vibrateOnTap: "Dridhje në çdo prekje për reagim më të mirë",
  vibrationEnabled: "Dridhja u aktivizua",
  vibrationDisabled: "Dridhja u çaktivizua",
  on: "On",
  off: "Off",  
  commonDhikr: "Dhikri i Përgjithshëm",
  subhanAllah: "Subhan Allah (Lavdi Allahut)",
  alhamdulillah: "Alhamdulillah (Falënderimi i Allahut)",
  allahuAkbar: "Allahu Akbar (Allahu është më i Madhi)",
  tasbihCounterReset: "Numëruesi i tesbihut u rivendos në 0",
  
  // Settings page additional
  manageAppPreferences: "Menaxhoni preferencat e aplikacionit",
  general: "E përgjithshme",
  languageSettings: "Cilësimet e gjuhës",
  notifications: "Njoftimet",
  blockAllowPriorities: "Bllokoni, lejoni, prioritetet",
  about: "Rreth",
  knowAboutApp: "Njihuni me aplikacionin tonë",
  logOut: "Dalje",
  logOutFromApp: "Dilni nga aplikacioni",
  appVersion: "PrayConnect v1.0",
  
  // Date translations
  weekdays: {
    sunday: "E diel",
    monday: "E hënë",
    tuesday: "E martë",
    wednesday: "E mërkurë",
    thursday: "E enjte",
    friday: "E premte",
    saturday: "E shtunë"
  },
  months: {
    january: "Janar",
    february: "Shkurt",
    march: "Mars",
    april: "Prill",
    may: "Maj",
    june: "Qershor",
    july: "Korrik",
    august: "Gusht",
    september: "Shtator",
    october: "Tetor",
    november: "Nëntor",
    december: "Dhjetor"
  },
  
  // Common
  loading: "Duke u ngarkuar...",
  error: "Gabim",
  success: "Sukses"
};

// ... keep existing code (language type, translations record, functions)
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

export const t = (key: keyof Translation): Translation[keyof Translation] => {
  return getTranslation()[key];
};

// Initialize language on module load
currentLanguage = getCurrentLanguage();
