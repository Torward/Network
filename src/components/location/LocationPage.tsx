import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Compass,
  Users,
  Globe,
  Navigation,
  Map,
  Share2,
  Settings,
  RefreshCw,
  User,
} from "lucide-react";
import { useAuth } from "../auth/AuthProvider";
import LocationSelector from "./LocationSelector";
import {
  getCurrentLocation,
  saveUserLocation,
  getUserLocation,
  getAddressFromCoordinates,
  findNearbyUsers,
} from "@/lib/location";

const LocationPage = () => {
  const { user } = useAuth();
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [nearbyUsers, setNearbyUsers] = useState<any[]>([]);
  const [searchRadius, setSearchRadius] = useState(10); // km
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("my-location");
  const [manualLocation, setManualLocation] = useState({
    latitude: "",
    longitude: "",
  });
  const [manualAddress, setManualAddress] = useState("");

  // Load user's location on component mount
  useEffect(() => {
    if (user) {
      loadUserLocation();
    }
  }, [user]);

  // Load user's saved location from database
  const loadUserLocation = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const savedLocation = await getUserLocation(user.id);
      if (savedLocation) {
        setCurrentLocation(savedLocation);
        // Load nearby users based on saved location
        loadNearbyUsers(savedLocation);
      }
    } catch (error) {
      console.error("Error loading saved location:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load nearby users based on location
  const loadNearbyUsers = async (location: any) => {
    if (!user || !location) return;

    try {
      const nearby = await findNearbyUsers(user.id, searchRadius);
      setNearbyUsers(nearby || []);
    } catch (error) {
      console.error("Error finding nearby users:", error);
    }
  };

  // Handle getting current location from device
  const handleGetCurrentLocation = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const location = await getCurrentLocation();
      if (location) {
        // Get address from coordinates
        const addressInfo = await getAddressFromCoordinates(
          location.latitude,
          location.longitude,
        );

        if (addressInfo) {
          // Update location with address info
          const locationWithAddress = {
            ...location,
            address: addressInfo.address,
            city: addressInfo.city,
            country: addressInfo.country,
          };

          setCurrentLocation(locationWithAddress);

          // Save to database
          await saveUserLocation(user.id, locationWithAddress);

          // Load nearby users
          loadNearbyUsers(locationWithAddress);
        }
      }
    } catch (error) {
      console.error("Error getting current location:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle setting manual location
  const handleSetManualLocation = async () => {
    if (!user || !manualLocation.latitude || !manualLocation.longitude) return;

    try {
      setIsLoading(true);
      const lat = parseFloat(manualLocation.latitude);
      const lng = parseFloat(manualLocation.longitude);

      // Validate coordinates
      if (
        isNaN(lat) ||
        isNaN(lng) ||
        lat < -90 ||
        lat > 90 ||
        lng < -180 ||
        lng > 180
      ) {
        throw new Error("Invalid coordinates");
      }

      // Get address from coordinates
      const addressInfo = await getAddressFromCoordinates(lat, lng);

      const manualLocationData = {
        latitude: lat,
        longitude: lng,
        accuracy: 0, // Manual location has no accuracy
        timestamp: new Date().toISOString(),
        address: addressInfo?.address || "",
        city: addressInfo?.city || "",
        country: addressInfo?.country || "",
        isManuallySet: true,
      };

      setCurrentLocation(manualLocationData);

      // Save to database
      await saveUserLocation(user.id, manualLocationData);

      // Load nearby users
      loadNearbyUsers(manualLocationData);

      // Reset form
      setManualLocation({ latitude: "", longitude: "" });
    } catch (error) {
      console.error("Error setting manual location:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle setting location from address
  const handleSetLocationFromAddress = async () => {
    if (!user || !manualAddress) return;

    try {
      setIsLoading(true);
      // This would typically use a geocoding service to convert address to coordinates
      // For this example, we'll just use a placeholder implementation
      alert(
        "В реальном приложении здесь был бы запрос к геокодеру для получения координат по адресу.",
      );

      // Reset form
      setManualAddress("");
    } catch (error) {
      console.error("Error setting location from address:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle location selected from LocationSelector component
  const handleLocationSelected = (location: any) => {
    setCurrentLocation(location);
    loadNearbyUsers(location);
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Местоположение</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGetCurrentLocation}
            disabled={isLoading}
          >
            <Compass className="h-4 w-4 mr-2" />
            {isLoading ? "Обновление..." : "Обновить местоположение"}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="my-location">
              <MapPin className="h-4 w-4 mr-2" />
              Моё местоположение
            </TabsTrigger>
            <TabsTrigger value="nearby-users">
              <Users className="h-4 w-4 mr-2" />
              Люди рядом
            </TabsTrigger>
            <TabsTrigger value="manual-location">
              <Map className="h-4 w-4 mr-2" />
              Указать вручную
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-location" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-primary" />
                  Текущее местоположение
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentLocation ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 p-3 bg-muted rounded-md">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium">
                          {currentLocation.address ||
                            `${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}`}
                        </p>
                        {currentLocation.city && currentLocation.country && (
                          <p className="text-sm text-muted-foreground">
                            {currentLocation.city}, {currentLocation.country}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant={
                          currentLocation.isManuallySet ? "outline" : "default"
                        }
                      >
                        {currentLocation.isManuallySet
                          ? "Указано вручную"
                          : "Определено устройством"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm">Широта</Label>
                        <div className="p-2 bg-muted/50 rounded-md mt-1">
                          {currentLocation.latitude.toFixed(6)}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm">Долгота</Label>
                        <div className="p-2 bg-muted/50 rounded-md mt-1">
                          {currentLocation.longitude.toFixed(6)}
                        </div>
                      </div>
                    </div>

                    {currentLocation.timestamp && (
                      <div>
                        <Label className="text-sm">Последнее обновление</Label>
                        <div className="p-2 bg-muted/50 rounded-md mt-1 text-sm">
                          {new Date(currentLocation.timestamp).toLocaleString()}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4 mr-2" />
                        Поделиться
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleGetCurrentLocation}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Обновить
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Globe className="h-16 w-16 mx-auto text-muted-foreground opacity-20 mb-4" />
                    <p className="text-muted-foreground mb-4">
                      Местоположение не определено
                    </p>
                    <Button onClick={handleGetCurrentLocation}>
                      <Compass className="h-4 w-4 mr-2" />
                      Определить местоположение
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <LocationSelector
              onLocationSelected={handleLocationSelected}
              className="w-full"
            />
          </TabsContent>

          <TabsContent value="nearby-users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-primary" />
                  Люди рядом ({nearbyUsers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!currentLocation ? (
                  <div className="text-center py-8">
                    <MapPin className="h-16 w-16 mx-auto text-muted-foreground opacity-20 mb-4" />
                    <p className="text-muted-foreground mb-4">
                      Сначала определите ваше местоположение
                    </p>
                    <Button onClick={handleGetCurrentLocation}>
                      <Compass className="h-4 w-4 mr-2" />
                      Определить местоположение
                    </Button>
                  </div>
                ) : nearbyUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-16 w-16 mx-auto text-muted-foreground opacity-20 mb-4" />
                    <p className="text-muted-foreground">
                      Рядом с вами пока никого нет
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Радиус поиска: {searchRadius} км</Label>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSearchRadius(Math.max(1, searchRadius - 5));
                            if (currentLocation) {
                              loadNearbyUsers(currentLocation);
                            }
                          }}
                        >
                          -5 км
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSearchRadius(searchRadius + 5);
                            if (currentLocation) {
                              loadNearbyUsers(currentLocation);
                            }
                          }}
                        >
                          +5 км
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid gap-4 md:grid-cols-2">
                      {nearbyUsers.map((nearbyUser) => (
                        <Card key={nearbyUser.id} className="overflow-hidden">
                          <div className="p-4 flex items-center space-x-4">
                            <div className="relative">
                              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-6 w-6 text-primary" />
                              </div>
                              <Badge
                                className="absolute -bottom-1 -right-1"
                                variant="secondary"
                              >
                                {nearbyUser.distance.toFixed(1)} км
                              </Badge>
                            </div>
                            <div>
                              <h3 className="font-medium">{nearbyUser.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {nearbyUser.location || "Местоположение скрыто"}
                              </p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manual-location" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Map className="h-5 w-5 mr-2 text-primary" />
                  Указать местоположение вручную
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">По координатам</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="latitude">Широта</Label>
                        <Input
                          id="latitude"
                          placeholder="Например: 55.7558"
                          value={manualLocation.latitude}
                          onChange={(e) =>
                            setManualLocation({
                              ...manualLocation,
                              latitude: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="longitude">Долгота</Label>
                        <Input
                          id="longitude"
                          placeholder="Например: 37.6173"
                          value={manualLocation.longitude}
                          onChange={(e) =>
                            setManualLocation({
                              ...manualLocation,
                              longitude: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleSetManualLocation}
                      disabled={
                        !manualLocation.latitude ||
                        !manualLocation.longitude ||
                        isLoading
                      }
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      Установить местоположение
                    </Button>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">По адресу</h3>
                    <div className="space-y-2">
                      <Label htmlFor="address">Адрес</Label>
                      <Input
                        id="address"
                        placeholder="Введите адрес..."
                        value={manualAddress}
                        onChange={(e) => setManualAddress(e.target.value)}
                      />
                    </div>
                    <Button
                      onClick={handleSetLocationFromAddress}
                      disabled={!manualAddress || isLoading}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Найти по адресу
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default LocationPage;
