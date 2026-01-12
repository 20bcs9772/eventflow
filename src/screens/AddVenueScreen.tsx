import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import {
  ScreenLayout,
  FloatingActionButton,
  ScreenHeader,
  LocationItem,
} from '../components';
import { Colors } from '../constants/colors';
import { Spacing, FontSizes, BorderRadius } from '../constants/spacing';
import { RootStackParamList } from '../types';
import { locationService, LocationSearchResult } from '../services';

type AddVenueRouteProp = RouteProp<RootStackParamList, 'AddVenue'>;

export const AddVenueScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<AddVenueRouteProp>();
  const { onSave } = route.params || {};

  const [selectedLocation, setSelectedLocation] =
    useState<LocationSearchResult | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>(
    [],
  );
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        const results = await locationService.searchLocations(
          searchQuery.trim(),
        );
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
  const handleLocationSelect = useCallback((location: LocationSearchResult) => {
    setSelectedLocation(location);
  }, []);

  const handleSelectVenue = () => {
    if (onSave && selectedLocation) {
      // Format location data to match expected structure
      const venueData = {
        name: selectedLocation.name,
        fullAddress: selectedLocation.fullAddress,
        address: selectedLocation.address,
        city: selectedLocation.city,
        state: selectedLocation.state,
        zipCode: selectedLocation.zipCode,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
      };
      onSave(venueData);
    }
    navigation.goBack();
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedLocation(null);
  };

  // Render location list
  const renderLocationList = (
    locations: LocationSearchResult[],
    icon?: string,
  ) => (
    <View>
      {locations.map((location, index) => {
        const isSelected =
          selectedLocation?.id === location.id ||
          selectedLocation?.placeId === location.placeId;
        return (
          <View
            key={location.id || `location-${index}`}
            style={styles.locationItemWrapper}
          >
            <LocationItem
              location={location}
              onPress={handleLocationSelect}
              icon={icon}
              showChevron={false}
            />
            {isSelected && (
              <View style={styles.selectedIndicator}>
                <FontAwesome6
                  name="check"
                  iconStyle="solid"
                  size={14}
                  color={Colors.white}
                />
              </View>
            )}
          </View>
        );
      })}
    </View>
  );

  return (
    <ScreenLayout backgroundColor={Colors.backgroundLight}>
      <ScreenHeader title="Add Venue" backIcon="arrow-left" />

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchInputWrapper,
            searchQuery.length > 0 && styles.searchInputWrapperActive,
          ]}
        >
          <FontAwesome6
            name="magnifying-glass"
            size={16}
            color={Colors.textSecondary}
            iconStyle="solid"
          />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search city, country, or place..."
            placeholderTextColor={Colors.textLight}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch} activeOpacity={0.7}>
              <FontAwesome6
                name="xmark"
                size={16}
                color={Colors.textSecondary}
                iconStyle="solid"
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Results */}
      <ScrollView
        style={styles.resultsContainer}
        contentContainerStyle={styles.resultsContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Results */}
        {searchQuery.trim().length > 0 ? (
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
        ) : (
          <View style={styles.emptyState}>
            <FontAwesome6
              name="magnifying-glass"
              size={48}
              color={Colors.textLight}
              iconStyle="solid"
            />
            <Text style={styles.emptyTitle}>Search for a location</Text>
            <Text style={styles.emptySubtitle}>
              Enter a city, country, or place name to search
            </Text>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Floating Button */}
      <FloatingActionButton
        title="Select Venue"
        onPress={handleSelectVenue}
        disabled={!selectedLocation}
      />
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInputWrapperActive: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.text,
    marginLeft: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsContent: {
    paddingBottom: Spacing.xxl,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 120,
  },
  emptyTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  locationItemWrapper: {
    position: 'relative',
  },
  selectedIndicator: {
    position: 'absolute',
    right: Spacing.lg,
    top: '50%',
    marginTop: -13,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  bottomSpacer: {
    height: 140,
  },
});
