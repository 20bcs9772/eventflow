import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocationSearchResult } from './location.service';

const RECENT_SEARCHES_KEY = '@eventflow:recent_location_searches';
const MAX_RECENT_SEARCHES = 10;

class StorageService {
  /**
   * Save a location to recent searches
   */
  async saveRecentSearch(location: LocationSearchResult): Promise<void> {
    try {
      const recentSearches = await this.getRecentSearches();
      
      // Remove if already exists (to move to top)
      const filtered = recentSearches.filter(
        item => item.id !== location.id && item.placeId !== location.placeId,
      );
      
      // Add to beginning
      const updated = [location, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      
      await AsyncStorage.setItem(
        RECENT_SEARCHES_KEY,
        JSON.stringify(updated),
      );
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  }

  /**
   * Get all recent searches
   */
  async getRecentSearches(): Promise<LocationSearchResult[]> {
    try {
      const data = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch (error) {
      console.error('Error getting recent searches:', error);
      return [];
    }
  }

  /**
   * Clear all recent searches
   */
  async clearRecentSearches(): Promise<void> {
    try {
      await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (error) {
      console.error('Error clearing recent searches:', error);
    }
  }

  /**
   * Remove a specific recent search
   */
  async removeRecentSearch(locationId: string): Promise<void> {
    try {
      const recentSearches = await this.getRecentSearches();
      const filtered = recentSearches.filter(
        item => item.id !== locationId && item.placeId !== locationId,
      );
      await AsyncStorage.setItem(
        RECENT_SEARCHES_KEY,
        JSON.stringify(filtered),
      );
    } catch (error) {
      console.error('Error removing recent search:', error);
    }
  }
}

export const storageService = new StorageService();
export default storageService;

