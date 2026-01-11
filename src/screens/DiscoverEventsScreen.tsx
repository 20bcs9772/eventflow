import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { EventCard, ScreenLayout, ScreenHeader } from '../components';
import { Colors } from '../constants/colors';
import { Spacing, FontSizes } from '../constants/spacing';
import { Event, RootStackParamList } from '../types';
import { eventService } from '../services';
import { mapBackendEventsToFrontend } from '../utils/eventMapper';

type DiscoverEventsRouteProp = RouteProp<RootStackParamList, 'DiscoverEvents'>;

export const DiscoverEventsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<DiscoverEventsRouteProp>();
  const eventTypeParam = route.params?.eventType;

  const [selectedTab, setSelectedTab] = useState<string>(
    eventTypeParam || 'ALL',
  );
  const [events, setEvents] = useState<Event[]>([]);
  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Determine if tabs should be shown (only show if no eventType param)
  const showTabs = !eventTypeParam;

  // Calculate card width for grid layout
  const screenWidth = Dimensions.get('window').width;
  const containerPadding = 40;
  const gapBetweenCards = 16;
  const availableWidth = screenWidth - containerPadding;
  const cardWidth = (availableWidth - gapBetweenCards) / 2;
  const leftMargin = (availableWidth - (cardWidth * 2 + gapBetweenCards)) / 2;

  useEffect(() => {
    if (showTabs) {
      fetchEventTypes();
    }
  }, [showTabs]);

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTab]);

  const fetchEventTypes = async () => {
    try {
      const response = await eventService.getAllEventTypes();
      if (response.success && response.data) {
        setEventTypes(response.data);
      }
    } catch (error) {
      console.error('Error fetching event types:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      setIsLoading(true);

      if (selectedTab === 'ALL') {
        // Fetch all public events
        const response = await eventService.getPublicEvents(50, 0);
        if (response.success && response.data) {
          setEvents(mapBackendEventsToFrontend(response.data));
        }
      } else {
        // Fetch events by type
        const response = await eventService.searchEvents({
          type: selectedTab,
          limit: 50,
          offset: 0,
        });
        if (response.success && response.data) {
          setEvents(mapBackendEventsToFrontend(response.data));
        }
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchEvents();
  };

  const formatTabName = (type: string): string => {
    if (type === 'ALL') return 'All Events';
    return type.charAt(0) + type.slice(1).toLowerCase().replace(/_/g, ' ');
  };

  const getScreenTitle = (): string => {
    if (eventTypeParam) {
      const formattedType = formatTabName(eventTypeParam);
      return `${formattedType} Events`;
    }
    return 'Discover Events';
  };

  return (
    <ScreenLayout backgroundColor={Colors.backgroundLight}>
      <ScreenHeader
        title={getScreenTitle()}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Tabs - Only show if no eventType param */}
        {showTabs && (
          <View style={styles.tabsContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabsScrollContent}
            >
              <TouchableOpacity
                style={[styles.tab, selectedTab === 'ALL' && styles.tabActive]}
                onPress={() => setSelectedTab('ALL')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.tabText,
                    selectedTab === 'ALL' && styles.tabTextActive,
                  ]}
                >
                  All Events
                </Text>
              </TouchableOpacity>

              {eventTypes.map(type => (
                <TouchableOpacity
                  key={type}
                  style={[styles.tab, selectedTab === type && styles.tabActive]}
                  onPress={() => setSelectedTab(type)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.tabText,
                      selectedTab === type && styles.tabTextActive,
                    ]}
                  >
                    {formatTabName(type)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Events Grid */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : events.length > 0 ? (
          <View style={styles.eventsGrid}>
            {events.map((event, index) => (
              <View
                key={event.id}
                style={[
                  styles.eventCardWrapper,
                  {
                    width: cardWidth,
                    marginLeft: index % 2 === 0 ? leftMargin : gapBetweenCards,
                    marginBottom: Spacing.md,
                  },
                ]}
              >
                <EventCard
                  event={event}
                  variant="small"
                  onPress={() => navigation.navigate('EventDetails', { event })}
                />
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptySection}>
            <Text style={styles.emptyText}>
              No events found for this category
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    paddingTop: Spacing.md,
  },
  tabsContainer: {
    marginBottom: Spacing.lg,
  },
  tabsScrollContent: {
    paddingRight: Spacing.md,
    gap: Spacing.sm,
  },
  tab: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
  },
  tabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.white,
  },
  eventsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  eventCardWrapper: {
    // Width and margins are set dynamically
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
    paddingVertical: Spacing.xxl,
  },
  emptySection: {
    padding: Spacing.xxl,
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginTop: Spacing.lg,
  },
  emptyText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
});
