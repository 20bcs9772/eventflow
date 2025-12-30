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
    return { ...coords, ...address };
  }
}

export const locationService = new LocationService();
export default locationService;
