import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import Geocoder from 'react-native-geocoding';
import { ENV } from '../config';

Geocoder.init(ENV.GOOGLE_MAPS_API_KEY);

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

type FullLocation = Coordinates & AddressInfo;

export type LocationSearchResult = {
  id: string;
  name: string;
  fullAddress: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  latitude: number;
  longitude: number;
  placeId?: string;
};

class LocationService {
  async requestLocationPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'App needs access to your location',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );

      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }

    return true;
  }

  getCurrentLocation(): Promise<Coordinates> {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        error => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        },
      );
    });
  }

  async reverseGeocode(
    coords: Pick<Coordinates, 'latitude' | 'longitude'>,
  ): Promise<AddressInfo> {
    const geo = await Geocoder.from(coords.latitude, coords.longitude);

    const address = geo.results[0];
    if (!address) return {};

    const city = address.address_components.find(
      (c: { types: string[]; long_name: string }) =>
        c.types.includes('locality'),
    )?.long_name;

    const state = address.address_components.find(
      (c: { types: string[]; long_name: string }) =>
        c.types.includes('administrative_area_level_1'),
    )?.long_name;

    const country = address.address_components.find(
      (c: { types: string[]; long_name: string }) =>
        c.types.includes('country'),
    )?.long_name;

    return { city, state, country };
  }

  async getFullLocation(): Promise<FullLocation> {
    const coords = await this.getCurrentLocation();
    const address = await this.reverseGeocode(coords);
    console.log('address', address);
    return { ...coords, ...address };
  }

  /**
   * Search for locations by query string
   */
  async searchLocations(query: string): Promise<LocationSearchResult[]> {
    try {
      const geo = await Geocoder.from(query);
      if (!geo.results || geo.results.length === 0) {
        return [];
      }

      return geo.results.map((result: any, index: number) => {
        const addressComponents = result.address_components || [];
        const streetNumber = addressComponents.find(
          (c: { types: string[]; long_name: string }) =>
            c.types.includes('street_number'),
        )?.long_name;

        const route = addressComponents.find(
          (c: { types: string[]; long_name: string }) =>
            c.types.includes('route'),
        )?.long_name;

        const city = addressComponents.find(
          (c: { types: string[]; long_name: string }) =>
            c.types.includes('locality'),
        )?.long_name;

        const state = addressComponents.find(
          (c: { types: string[]; long_name: string }) =>
            c.types.includes('administrative_area_level_1'),
        )?.long_name;

        const country = addressComponents.find(
          (c: { types: string[]; long_name: string }) =>
            c.types.includes('country'),
        )?.long_name;

        const zipCode = addressComponents.find(
          (c: { types: string[]; long_name: string }) =>
            c.types.includes('postal_code'),
        )?.long_name;

        const address = [streetNumber, route].filter(Boolean).join(' ');

        const fullAddress = [address, city, state, zipCode]
          .filter(Boolean)
          .join(', ');

        const name = result.formatted_address.split(',')[0];

        return {
          id: result.place_id || `location-${index}`,
          name: name || query,
          fullAddress: result.formatted_address || fullAddress,
          address,
          city: city || name,
          state,
          country,
          zipCode,
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
          placeId: result.place_id,
        };
      });
    } catch (error) {
      console.error('Location search error:', error);
      return [];
    }
  }

  /**
   * Get nearby venues based on current location
   */
  async getNearbyVenues(
    latitude: number,
    longitude: number,
  ): Promise<LocationSearchResult[]> {
    try {
      const url =
        `https://maps.googleapis.com/maps/api/place/textsearch/json` +
        `?query=event venues near ${latitude},${longitude}` +
        `&radius=2000` +
        `&key=${ENV.GOOGLE_MAPS_API_KEY}`;

      const res = await fetch(url);
      const json = await res.json();

      if (json.status === 'ZERO_RESULTS') {
        return [];
      }

      if (json.status !== 'OK') {
        throw json;
      }
      return json.results.slice(0, 10).map((place: any) => ({
        id: place.place_id,
        name: place.name,
        fullAddress: place.formatted_address,
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
        placeId: place.place_id,
      }));
    } catch (error) {
      console.error('Get nearby venues error:', error);
      return [];
    }
  }
}

export const locationService = new LocationService();
export default locationService;
