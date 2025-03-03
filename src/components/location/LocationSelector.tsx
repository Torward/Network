import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MapPin, Compass, RefreshCw } from "lucide-react";
import { useAuth } from "../auth/AuthProvider";
import {
  getCurrentLocation,
  saveUserLocation,
  getUserLocation,
  getAddressFromCoordinates,
} from "@/lib/location";

interface LocationSelectorProps {
  onLocationSelected?: (location: any) => void;
  className?: string;
}

const LocationSelector = ({
  onLocationSelected,
  className = "",
}: LocationSelectorProps) => {
  const { user } = useAuth();
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [address, setAddress] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load user's saved location from database
    const loadSavedLocation = async () => {
      if (!user) return;

      try {
        const savedLocation = await getUserLocation(user.id);
        if (savedLocation) {
          setCurrentLocation(savedLocation);
          setAddress(savedLocation.address || "");
          if (onLocationSelected) {
            onLocationSelected(savedLocation);
          }
        }
      } catch (error) {
        console.error("Error loading saved location:", error);
      }
    };

    loadSavedLocation();
  }, [user, onLocationSelected]);

  const handleGetCurrentLocation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const location = await getCurrentLocation();
      if (location) {
        setCurrentLocation(location);

        // Get address from coordinates
        const addressInfo = await getAddressFromCoordinates(
          location.latitude,
          location.longitude,
        );

        if (addressInfo) {
          setAddress(addressInfo.address || "");

          // Update location with address info
          const locationWithAddress = {
            ...location,
            address: addressInfo.address,
            city: addressInfo.city,
            country: addressInfo.country,
          };

          setCurrentLocation(locationWithAddress);

          if (onLocationSelected) {
            onLocationSelected(locationWithAddress);
          }

          // Save to database if user is logged in
          if (user) {
            await saveUserLocation(user.id, locationWithAddress);
          }
        }
      } else {
        setError("Не удалось определить местоположение");
      }
    } catch (error) {
      console.error("Error getting current location:", error);
      setError("Ошибка при определении местоположения");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Ваше местоположение</Label>
        <Button
          variant="outline"
          size="sm"
          onClick={handleGetCurrentLocation}
          disabled={isLoading}
        >
          <Compass className="h-4 w-4 mr-1" />
          {isLoading ? "Определяем..." : "Определить"}
        </Button>
      </div>

      {currentLocation ? (
        <div className="flex items-center space-x-2 p-2 bg-muted/50 rounded-md">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="text-sm truncate">
            {address ||
              `${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}`}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 ml-auto"
            onClick={handleGetCurrentLocation}
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-center p-2 bg-muted/50 rounded-md">
          <span className="text-sm text-muted-foreground">
            {error || "Местоположение не определено"}
          </span>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;
