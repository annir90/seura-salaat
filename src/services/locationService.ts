
// This service manages locations for prayer times calculations
export interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

// Expanded list of available locations covering major cities worldwide
const AVAILABLE_LOCATIONS: Location[] = [
  // Finland
  { id: "espoo", name: "Espoo, Finland", latitude: 60.2055, longitude: 24.6559 },
  { id: "helsinki", name: "Helsinki, Finland", latitude: 60.1699, longitude: 24.9384 },
  { id: "tampere", name: "Tampere, Finland", latitude: 61.4978, longitude: 23.7610 },
  { id: "turku", name: "Turku, Finland", latitude: 60.4518, longitude: 22.2666 },
  { id: "oulu", name: "Oulu, Finland", latitude: 65.0121, longitude: 25.4651 },
  
  // Europe
  { id: "london", name: "London, UK", latitude: 51.5074, longitude: -0.1278 },
  { id: "paris", name: "Paris, France", latitude: 48.8566, longitude: 2.3522 },
  { id: "berlin", name: "Berlin, Germany", latitude: 52.5200, longitude: 13.4050 },
  { id: "stockholm", name: "Stockholm, Sweden", latitude: 59.3293, longitude: 18.0686 },
  { id: "oslo", name: "Oslo, Norway", latitude: 59.9139, longitude: 10.7522 },
  { id: "copenhagen", name: "Copenhagen, Denmark", latitude: 55.6761, longitude: 12.5683 },
  { id: "amsterdam", name: "Amsterdam, Netherlands", latitude: 52.3676, longitude: 4.9041 },
  { id: "brussels", name: "Brussels, Belgium", latitude: 50.8503, longitude: 4.3517 },
  { id: "vienna", name: "Vienna, Austria", latitude: 48.2082, longitude: 16.3738 },
  { id: "zurich", name: "Zurich, Switzerland", latitude: 47.3769, longitude: 8.5417 },
  
  // Middle East
  { id: "mecca", name: "Mecca, Saudi Arabia", latitude: 21.3891, longitude: 39.8579 },
  { id: "medina", name: "Medina, Saudi Arabia", latitude: 24.5247, longitude: 39.5692 },
  { id: "riyadh", name: "Riyadh, Saudi Arabia", latitude: 24.7136, longitude: 46.6753 },
  { id: "dubai", name: "Dubai, UAE", latitude: 25.2048, longitude: 55.2708 },
  { id: "doha", name: "Doha, Qatar", latitude: 25.2760, longitude: 51.5200 },
  { id: "kuwait", name: "Kuwait City, Kuwait", latitude: 29.3759, longitude: 47.9774 },
  { id: "istanbul", name: "Istanbul, Turkey", latitude: 41.0082, longitude: 28.9784 },
  { id: "ankara", name: "Ankara, Turkey", latitude: 39.9334, longitude: 32.8597 },
  
  // North America
  { id: "new_york", name: "New York, USA", latitude: 40.7128, longitude: -74.0060 },
  { id: "los_angeles", name: "Los Angeles, USA", latitude: 34.0522, longitude: -118.2437 },
  { id: "chicago", name: "Chicago, USA", latitude: 41.8781, longitude: -87.6298 },
  { id: "toronto", name: "Toronto, Canada", latitude: 43.6532, longitude: -79.3832 },
  { id: "vancouver", name: "Vancouver, Canada", latitude: 49.2827, longitude: -123.1207 },
  
  // Asia
  { id: "jakarta", name: "Jakarta, Indonesia", latitude: -6.2088, longitude: 106.8456 },
  { id: "kuala_lumpur", name: "Kuala Lumpur, Malaysia", latitude: 3.1390, longitude: 101.6869 },
  { id: "singapore", name: "Singapore", latitude: 1.3521, longitude: 103.8198 },
  { id: "bangkok", name: "Bangkok, Thailand", latitude: 13.7563, longitude: 100.5018 },
  { id: "karachi", name: "Karachi, Pakistan", latitude: 24.8607, longitude: 67.0011 },
  { id: "lahore", name: "Lahore, Pakistan", latitude: 31.5204, longitude: 74.3587 },
  { id: "islamabad", name: "Islamabad, Pakistan", latitude: 33.6844, longitude: 73.0479 },
  { id: "dhaka", name: "Dhaka, Bangladesh", latitude: 23.8103, longitude: 90.4125 },
  { id: "mumbai", name: "Mumbai, India", latitude: 19.0760, longitude: 72.8777 },
  { id: "delhi", name: "Delhi, India", latitude: 28.7041, longitude: 77.1025 },
  
  // Africa
  { id: "cairo", name: "Cairo, Egypt", latitude: 30.0444, longitude: 31.2357 },
  { id: "casablanca", name: "Casablanca, Morocco", latitude: 33.5731, longitude: -7.5898 },
  { id: "tunis", name: "Tunis, Tunisia", latitude: 36.8065, longitude: 10.1815 },
  { id: "lagos", name: "Lagos, Nigeria", latitude: 6.5244, longitude: 3.3792 },
  { id: "johannesburg", name: "Johannesburg, South Africa", latitude: -26.2041, longitude: 28.0473 },
  
  // Australia
  { id: "sydney", name: "Sydney, Australia", latitude: -33.8688, longitude: 151.2093 },
  { id: "melbourne", name: "Melbourne, Australia", latitude: -37.8136, longitude: 144.9631 },
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
