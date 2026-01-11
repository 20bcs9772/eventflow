/**
 * Location Context
 *
 * Provides user's location state and methods throughout the app.
 * Handles location permission requests and stores the current location.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { locationService } from '../services';

type Coordinates = {
  latitude: number;
  longitude: number;
  accuracy?: number;
};

type AddressInfo = {
  city?: string;
  state?: string;
  country?: string;
};

export type FullLocation = Coordinates & AddressInfo;

interface LocationContextType {
  // State
  location: FullLocation | null;
  isLoading: boolean;
  error: string | null;
  hasPermission: boolean;

  // Methods
  refreshLocation: () => Promise<void>;
  requestPermission: () => Promise<boolean>;
  setLocation: (location: FullLocation) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(
  undefined,
);

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

interface LocationProviderProps {
  children: React.ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({
  children,
}) => {
  const [location, setLocation] = useState<FullLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  /**
   * Request location permission
   */
  const requestPermission = async (): Promise<boolean> => {
    try {
      const allowed = await locationService.requestLocationPermission();
      setHasPermission(allowed);
      return allowed;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to request permission';
      setError(errorMessage);
      setHasPermission(false);
      return false;
    }
  };

  /**
   * Fetch and update location
   */
  const refreshLocation = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const allowed = await requestPermission();
      if (!allowed) {
        setError('Location permission not granted');
        setIsLoading(false);
        return;
      }

      const fullLocation = await locationService.getFullLocation();
      setLocation(fullLocation);
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to get location';
      setError(errorMessage);
      console.log('Location fetch failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Initialize location on mount
   */
  useEffect(() => {
    refreshLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Set location manually (e.g., when user selects from search)
   */
  const updateLocation = (newLocation: FullLocation): void => {
    setLocation(newLocation);
    setError(null);
  };

  const value: LocationContextType = {
    location,
    isLoading,
    error,
    hasPermission,
    refreshLocation,
    requestPermission,
    setLocation: updateLocation,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

export default LocationContext;
