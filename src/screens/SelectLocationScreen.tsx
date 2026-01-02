import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { ScreenLayout, ScreenHeader, LocationItem, CurrentLocationButton } from '../components';
import { Colors } from '../constants/colors';
import { Spacing, FontSizes, BorderRadius } from '../constants/spacing';
import { RootStackParamList } from '../types';
import { locationService, storageService, LocationSearchResult } from '../services';
import { useLocation } from '../context';

type SelectLocationRouteProp = RouteProp<RootStackParamList, 'SelectLocation'>;

export const SelectLocationScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<SelectLocationRouteProp>();
  const { location: currentLocation, isLoading: isLocationLoading, refreshLocation, setLocation: updateLocationContext } = useLocation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<LocationSearchResult[]>([]);
  const [nearbyVenues, setNearbyVenues] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationSearchResult | null>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load recent searches on mount
  useEffect(() => {
    loadRecentSearches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load nearby venues when location is available
  useEffect(() => {
    loadNearbyVenues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLocation]);

  // Load recent searches from storage
  const loadRecentSearches = async () => {
    const recent = await storageService.getRecentSearches();
    setRecentSearches(recent);
  };

  // Load nearby venues
  const loadNearbyVenues = async () => {
    if (currentLocation) {
      const venues = await locationService.getNearbyVenues(
        currentLocation.latitude,
        currentLocation.longitude,
      );
      setNearbyVenues(venues);
    }
  };

  // Search locations with debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await locationService.searchLocations(searchQuery.trim());
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Handle location selection
  const handleLocationSelect = useCallback(
    async (location: LocationSearchResult) => {
      setSelectedLocation(location);
      // Save to recent searches
      await storageService.saveRecentSearch(location);
      // Reload recent searches
      await loadRecentSearches();
      
      // Update location context
      updateLocationContext({
        latitude: location.latitude,
        longitude: location.longitude,
        city: location.city,
        state: location.state,
        country: location.country,
      });
      
      // Call the onSelect callback if provided
      const onSelect = route.params?.onSelect;
      if (onSelect) {
        onSelect(location);
      }
      
      // Navigate back
      navigation.goBack();
    },
    [navigation, route.params, updateLocationContext],
  );

  // Handle current location selection
  const handleCurrentLocationSelect = useCallback(async () => {
    if (!currentLocation) {
      await refreshLocation();
      return;
    }

    const locationResult: LocationSearchResult = {
      id: 'current-location',
      name: currentLocation.city || 'Current Location',
      fullAddress: `${currentLocation.city || ''}, ${currentLocation.state || ''}, ${currentLocation.country || ''}`.trim().replace(/^,|,$/g, ''),
      city: currentLocation.city,
      state: currentLocation.state,
      country: currentLocation.country,
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
    };

    await handleLocationSelect(locationResult);
  }, [currentLocation, refreshLocation, handleLocationSelect]);

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  // Render section header
  const renderSectionHeader = (title: string) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  // Render location list
  const renderLocationList = (locations: LocationSearchResult[], icon?: string) => (
    <View>
      {locations.map((location, index) => (
        <LocationItem
          key={location.id || `location-${index}`}
          location={location}
          onPress={handleLocationSelect}
          icon={icon}
        />
      ))}
    </View>
  );

  const showSearchResults = searchQuery.trim().length > 0;
  const showRecentSearches = !showSearchResults && recentSearches.length > 0;
  const showNearbyVenues = !showSearchResults && nearbyVenues.length > 0;

  return (
    <ScreenLayout backgroundColor={Colors.background}>
      <ScreenHeader
        title="Select Location"
        rightAction={{
          text: 'Cancel',
          onPress: () => navigation.goBack(),
        }}
      />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <FontAwesome6
            name="magnifying-glass"
            size={18}
            color={Colors.textSecondary}
            iconStyle="solid"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search city, venue, or address"
            placeholderTextColor={Colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={handleClearSearch}
              style={styles.clearButton}
              activeOpacity={0.7}
            >
              <View style={styles.clearButtonCircle}>
                <FontAwesome6
                  name="xmark"
                  size={12}
                  color={Colors.textSecondary}
                  iconStyle="solid"
                />
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Location Button */}
        <CurrentLocationButton
          location={currentLocation}
          isLoading={isLocationLoading}
          onPress={handleCurrentLocationSelect}
        />

        {/* Search Results */}
        {showSearchResults && (
          <View style={styles.section}>
            {isSearching ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.loadingText}>Searching...</Text>
              </View>
            ) : searchResults.length > 0 ? (
              renderLocationList(searchResults, 'map-pin')
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No results found</Text>
              </View>
            )}
          </View>
        )}

        {/* Recent Searches */}
        {showRecentSearches && (
          <View style={styles.section}>
            {renderSectionHeader('Recent Searches')}
            {renderLocationList(recentSearches, 'clock-rotate-left')}
          </View>
        )}

        {/* Nearby Venues */}
        {showNearbyVenues && (
          <View style={styles.section}>
            {renderSectionHeader('Nearby Venues')}
            {renderLocationList(nearbyVenues, 'map-pin')}
          </View>
        )}

        {/* Map Preview Placeholder */}
        {selectedLocation && (
          <View style={styles.mapPreview}>
            <View style={styles.mapPlaceholder}>
              <FontAwesome6
                name="map"
                size={40}
                color={Colors.textSecondary}
                iconStyle="solid"
              />
              <Text style={styles.mapPlaceholderText}>Map Preview</Text>
            </View>
            <View style={styles.selectedLocationCard}>
              <Text style={styles.selectedLocationName}>
                {selectedLocation.name}
              </Text>
              <Text style={styles.selectedLocationAddress}>
                {selectedLocation.fullAddress}
              </Text>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => handleLocationSelect(selectedLocation)}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
                <FontAwesome6
                  name="check"
                  size={16}
                  color={Colors.white}
                  iconStyle="solid"
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    height: 50,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.text,
  },
  clearButton: {
    marginLeft: Spacing.sm,
  },
  clearButtonCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.textLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  loadingText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  mapPreview: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.backgroundLight,
    height: 200,
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundLight,
  },
  mapPlaceholderText: {
    marginTop: Spacing.sm,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  selectedLocationCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  selectedLocationName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  selectedLocationAddress: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
  },
  confirmButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.white,
  },
});

