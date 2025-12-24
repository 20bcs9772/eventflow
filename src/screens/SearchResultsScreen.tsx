import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { ScreenLayout, ScreenHeader, EventListCard } from '../components';
import { Colors } from '../constants/colors';
import { Spacing, FontSizes, BorderRadius } from '../constants/spacing';
import { RootStackParamList, Event } from '../types';
import { eventService } from '../services';
import type { Event as BackendEvent } from '../services/event.service';
import { mapBackendEventsToFrontend, getEventStatus } from '../utils/eventMapper';

type SearchResultsRouteProp = RouteProp<RootStackParamList, 'SearchResults'>;

export const SearchResultsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<SearchResultsRouteProp>();
  const initialQuery = route.params?.query || '';
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [events, setEvents] = useState<Event[]>([]);
  const [backendEvents, setBackendEvents] = useState<BackendEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isDebouncing, setIsDebouncing] = useState(false);

  const performSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      return;
    }

    try {
      setIsLoading(true);
      setHasSearched(true);

      const response = await eventService.searchEvents({
        query: searchQuery.trim() || undefined,
        limit: 50,
        offset: 0,
      });

      if (response.success && response.data) {
        setBackendEvents(response.data);
        const mappedEvents = mapBackendEventsToFrontend(response.data);
        setEvents(mappedEvents);
      } else {
        setBackendEvents([]);
        setEvents([]);
      }
    } catch (error) {
      console.error('Error searching events:', error);
      setBackendEvents([]);
      setEvents([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (initialQuery) {
      performSearch();
    }
  }, [initialQuery, performSearch]);

  useEffect(() => {
    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // If no search query, clear results
    if (!searchQuery.trim()) {
      setIsDebouncing(false);
      setBackendEvents([]);
      setEvents([]);
      setHasSearched(false);
      setIsLoading(false);
      return;
    }

    // Show debouncing state when user is typing in search bar
    // Debounce search queries by 500ms
    setIsDebouncing(true);
    searchTimeoutRef.current = setTimeout(() => {
      setIsDebouncing(false);
      performSearch();
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, performSearch]);


  const handleRefresh = () => {
    setIsRefreshing(true);
    performSearch();
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setBackendEvents([]);
    setEvents([]);
    setHasSearched(false);
  };

  const handleEventPress = (event: Event) => {
    navigation.navigate('EventDetails', { event });
  };

  return (
    <ScreenLayout backgroundColor={Colors.backgroundLight}>
      <View style={styles.container}>
        <ScreenHeader title="Search Results" />

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
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
              placeholder="Search events..."
              placeholderTextColor={Colors.textLight}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={handleClearSearch}>
                <FontAwesome6
                  name="circle-xmark"
                  size={18}
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
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary}
            />
          }
        >
          {(isLoading || isDebouncing) && !hasSearched ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>
                {isDebouncing ? 'Searching...' : 'Searching events...'}
              </Text>
            </View>
          ) : isLoading && hasSearched ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Updating results...</Text>
            </View>
          ) : events.length > 0 ? (
            events.map((event, index) => {
              const backendEvent = backendEvents[index];
              const status = backendEvent
                ? getEventStatus(backendEvent.startDate, backendEvent.endDate)
                : 'Upcoming';
              const attendeeCount = event.attendees || 0;
              const imageUri = event.coverImage || event.portraitImage;
              // Use original startDate from backend event for proper date parsing
              const eventDate = backendEvent?.startDate || event.date || new Date();

              return (
                <EventListCard
                  key={event.id}
                  title={event.title}
                  date={eventDate}
                  attendeesCount={attendeeCount}
                  imageUri={imageUri}
                  status={status}
                  onPress={() => handleEventPress(event)}
                  showOptions={false}
                />
              );
            })
          ) : hasSearched ? (
            <View style={styles.emptyState}>
              <FontAwesome6
                name="magnifying-glass"
                size={48}
                color={Colors.textLight}
                iconStyle="solid"
              />
              <Text style={styles.emptyTitle}>No events found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your search
              </Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <FontAwesome6
                name="magnifying-glass"
                size={48}
                color={Colors.textLight}
                iconStyle="solid"
              />
              <Text style={styles.emptyTitle}>Search for events</Text>
              <Text style={styles.emptySubtitle}>
                Enter a search term to find events
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
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
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
});
