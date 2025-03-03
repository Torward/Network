import { supabase } from "./supabase";

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: string;
  address?: string;
  city?: string;
  country?: string;
  isManuallySet?: boolean;
}

// Get current location from device
export async function getCurrentLocation(): Promise<LocationData | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser");
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString(),
          isManuallySet: false,
        };
        resolve(locationData);
      },
      (error) => {
        console.error("Error getting location:", error);
        resolve(null);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
    );
  });
}

// Save user location to database
export async function saveUserLocation(userId: string, location: LocationData) {
  try {
    const { error } = await supabase.from("user_locations").upsert({
      user_id: userId,
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
      timestamp: location.timestamp,
      address: location.address,
      city: location.city,
      country: location.country,
      is_manually_set: location.isManuallySet || false,
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error saving user location:", error);
    return false;
  }
}

// Get user location from database
export async function getUserLocation(
  userId: string,
): Promise<LocationData | null> {
  try {
    const { data, error } = await supabase
      .from("user_locations")
      .select("*")
      .eq("user_id", userId)
      .order("timestamp", { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;

    if (data) {
      return {
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: data.accuracy,
        timestamp: data.timestamp,
        address: data.address,
        city: data.city,
        country: data.country,
        isManuallySet: data.is_manually_set,
      };
    }

    return null;
  } catch (error) {
    console.error("Error getting user location:", error);
    return null;
  }
}

// Get address from coordinates using reverse geocoding
export async function getAddressFromCoordinates(
  lat: number,
  lng: number,
): Promise<{
  address?: string;
  city?: string;
  country?: string;
} | null> {
  try {
    // Using OpenStreetMap Nominatim API for reverse geocoding
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          "User-Agent": "Сеть App",
        },
      },
    );

    const data = await response.json();

    if (data && data.address) {
      return {
        address: data.display_name,
        city: data.address.city || data.address.town || data.address.village,
        country: data.address.country,
      };
    }

    return null;
  } catch (error) {
    console.error("Error in reverse geocoding:", error);
    return null;
  }
}

// Find nearby users
export async function findNearbyUsers(
  userId: string,
  radiusKm: number = 10,
): Promise<any[]> {
  try {
    // Get user's location first
    const userLocation = await getUserLocation(userId);
    if (!userLocation) return [];

    // This is a simplified approach. In a real app, you would use PostGIS or similar
    // to perform proper geospatial queries. This is just a basic implementation.
    const { data, error } = await supabase.rpc("find_nearby_users", {
      user_id: userId,
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      radius_km: radiusKm,
    });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error finding nearby users:", error);
    return [];
  }
}
