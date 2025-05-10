
// This service manages locations for prayer times calculations
export interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

// Initial list of available locations
const AVAILABLE_LOCATIONS: Location[] = [
  { id: "espoo", name: "Espoo, Finland", latitude: 60.2055, longitude: 24.6559 },
  { id: "helsinki", name: "Helsinki, Finland", latitude: 60.1699, longitude: 24.9384 },
  { id: "tampere", name: "Tampere, Finland", latitude: 61.4978, longitude: 23.7610 },
  { id: "turku", name: "Turku, Finland", latitude: 60.4518, longitude: 22.2666 },
  { id: "oulu", name: "Oulu, Finland", latitude: 65.0121, longitude: 25.4651 },
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
  const id = name.toLowerCase().replace(/\s+/g, '-');
  const newLocation: Location = { id, name, latitude, longitude };
  
  // In a more complex app, we'd store this in a database or cloud storage
  // For now, we'll just return it for immediate use
  return newLocation;
};
