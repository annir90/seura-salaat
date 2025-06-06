
// This service manages locations for prayer times calculations
export interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

// Finnish cities and towns for prayer times calculations
const AVAILABLE_LOCATIONS: Location[] = [
  // Major Finnish cities
  { id: "helsinki", name: "Helsinki", latitude: 60.1699, longitude: 24.9384 },
  { id: "espoo", name: "Espoo", latitude: 60.2055, longitude: 24.6559 },
  { id: "tampere", name: "Tampere", latitude: 61.4978, longitude: 23.7610 },
  { id: "vantaa", name: "Vantaa", latitude: 60.2943, longitude: 25.0408 },
  { id: "oulu", name: "Oulu", latitude: 65.0121, longitude: 25.4651 },
  { id: "turku", name: "Turku", latitude: 60.4518, longitude: 22.2666 },
  { id: "jyvaskyla", name: "Jyväskylä", latitude: 62.2426, longitude: 25.7473 },
  { id: "lahti", name: "Lahti", latitude: 60.9827, longitude: 25.6612 },
  { id: "kuopio", name: "Kuopio", latitude: 62.8924, longitude: 27.6782 },
  { id: "pori", name: "Pori", latitude: 61.4847, longitude: 21.7972 },
  { id: "kouvola", name: "Kouvola", latitude: 60.8678, longitude: 26.7041 },
  { id: "joensuu", name: "Joensuu", latitude: 62.6010, longitude: 29.7636 },
  { id: "lappeenranta", name: "Lappeenranta", latitude: 61.0587, longitude: 28.1887 },
  { id: "hameenlinna", name: "Hämeenlinna", latitude: 60.9959, longitude: 24.4641 },
  { id: "vaasa", name: "Vaasa", latitude: 63.0951, longitude: 21.6165 },
  { id: "seinajoki", name: "Seinäjoki", latitude: 62.7903, longitude: 22.8404 },
  { id: "rovaniemi", name: "Rovaniemi", latitude: 66.5039, longitude: 25.7294 },
  { id: "mikkeli", name: "Mikkeli", latitude: 61.6885, longitude: 27.2721 },
  { id: "kotka", name: "Kotka", latitude: 60.4664, longitude: 26.9458 },
  { id: "salo", name: "Salo", latitude: 60.3838, longitude: 23.1200 },
  { id: "porvoo", name: "Porvoo", latitude: 60.3925, longitude: 25.6656 },
  { id: "kokkola", name: "Kokkola", latitude: 63.8383, longitude: 23.1344 },
  { id: "lohja", name: "Lohja", latitude: 60.2488, longitude: 24.0653 },
  { id: "hyvinkaa", name: "Hyvinkää", latitude: 60.6319, longitude: 24.8580 },
  { id: "nurmijärvi", name: "Nurmijärvi", latitude: 60.4686, longitude: 24.8093 },
  { id: "järvenpää", name: "Järvenpää", latitude: 60.4736, longitude: 25.0896 },
  { id: "rauma", name: "Rauma", latitude: 61.1275, longitude: 21.5112 },
  { id: "tuusula", name: "Tuusula", latitude: 60.4020, longitude: 25.0265 },
  { id: "kirkkonummi", name: "Kirkkonummi", latitude: 60.1218, longitude: 24.4358 },
  { id: "kajaani", name: "Kajaani", latitude: 64.2277, longitude: 27.7285 },
  { id: "kerava", name: "Kerava", latitude: 60.4042, longitude: 25.1050 },
  { id: "naantali", name: "Naantali", latitude: 60.4677, longitude: 22.0232 },
  { id: "savonlinna", name: "Savonlinna", latitude: 61.8681, longitude: 28.8794 },
  { id: "imatra", name: "Imatra", latitude: 61.1719, longitude: 28.7587 },
  { id: "tornio", name: "Tornio", latitude: 65.8482, longitude: 24.1467 },
  { id: "riihimaki", name: "Riihimäki", latitude: 60.7395, longitude: 24.7772 }
];

// Default location
const DEFAULT_LOCATION: Location = AVAILABLE_LOCATIONS[0];

// Local storage key
const LOCATION_STORAGE_KEY = "prayerapp-selected-location";

// Get currently selected location from local storage or default
export const getSelectedLocation = (): Location => {
  const storedLocation = localStorage.getItem(LOCATION_STORAGE_KEY);
  if (storedLocation) {
    try {
      return JSON.parse(storedLocation);
    } catch (e) {
      console.error("Error parsing stored location:", e);
    }
  }
  return DEFAULT_LOCATION;
};

// Save selected location to local storage
export const saveSelectedLocation = (location: Location): void => {
  localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));
};

// Get all available locations
export const getAvailableLocations = (): Location[] => {
  return AVAILABLE_LOCATIONS;
};

// Add a custom location
export const addCustomLocation = (name: string, latitude: number, longitude: number): Location => {
  const id = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  const newLocation: Location = { id, name, latitude, longitude };
  
  // In a more complex app, we'd store this in a database or cloud storage
  // For now, we'll just return it for immediate use
  return newLocation;
};
