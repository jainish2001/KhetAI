'use client';
import React, { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

export type LocationInfo = {
  city: string;
};

interface LocationContextType {
  location: LocationInfo | null;
  loading: boolean;
  setLocation: (location: LocationInfo) => void;
  fetchCurrentLocation: () => void;
  isFetching: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const LOCATION_STORAGE_KEY = 'khet_ai_location';

export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [location, setLocationState] = useState<LocationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    try {
      const storedLocation = localStorage.getItem(LOCATION_STORAGE_KEY);
      if (storedLocation) {
        setLocationState(JSON.parse(storedLocation));
      }
    } catch (error) {
      console.error('Failed to load location from localStorage', error);
      setLocationState(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const setLocation = useCallback((newLocation: LocationInfo) => {
    setLocationState(newLocation);
    try {
      localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(newLocation));
    } catch (error) {
      console.error('Failed to save location to localStorage', error);
    }
  }, []);

  const fetchCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast({ title: 'Geolocation is not supported by your browser.', variant: 'destructive' });
      return;
    }

    setIsFetching(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // NOTE: This is a free, no-API-key reverse geocoding service.
          // In a production app, you would use a more robust service like Google Maps Geocoding API.
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          const city = data.address.city || data.address.town || data.address.village || 'Unknown Location';
          setLocation({ city });
          toast({ title: 'Location updated successfully!', description: `Your location is set to ${city}.` });
        } catch (error) {
          console.error("Error fetching city:", error);
          toast({ title: 'Could not determine city from coordinates.', variant: 'destructive' });
        } finally {
          setIsFetching(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast({ title: 'Could not get location.', description: 'Please ensure location permissions are granted.', variant: 'destructive' });
        setIsFetching(false);
      }
    );
  }, [setLocation, toast]);


  return (
    <LocationContext.Provider value={{ location, loading, setLocation, fetchCurrentLocation, isFetching }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
