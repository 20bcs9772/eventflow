import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
  Dimensions,
  FlatList,
} from 'react-native';
import { EventCard, ScreenLayout } from '../components';
import { Colors } from '../constants/colors';
import { Spacing, FontSizes } from '../constants/spacing';
import { Event } from '../types';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { useNavigation } from '@react-navigation/native';
import { eventService } from '../services';
import { mapBackendEventsToFrontend } from '../utils/eventMapper';
import { useAuth } from '../context/AuthContext';
import { EventTypeCard } from '../components/home/EventTypeCard';

interface HomeScreenProps {
  onNavigate: (route: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = () => {
  const navigation = useNavigation<any>();
  const { backendUser, user } = useAuth();
  const [happeningNowEvents, setHappeningNowEvents] = useState<Event[]>([]);
  const [discoverEvents, setDiscoverEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const carouselRef = useRef<FlatList>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);

      // Fetch events happening now
      const happeningNowResponse = await eventService.getEventsHappeningNow(5);

      if (happeningNowResponse.success && happeningNowResponse.data) {
        setHappeningNowEvents(
          mapBackendEventsToFrontend(happeningNowResponse.data),
        );
      }

      // Fetch public events for discovery
      const discoverResponse = await eventService.getPublicEvents(6, 0);

      if (discoverResponse.success && discoverResponse.data) {
        setDiscoverEvents(mapBackendEventsToFrontend(discoverResponse.data));
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

  const handleSearchPress = () => {
    navigation.navigate('SearchResults', { query: '' });
  };

  const handleJoinEventPress = () => {
    navigation.navigate('JoinEvent');
  };

  // Calculate carousel width based on screen dimensions
  const screenWidth = Dimensions.get('window').width;
  const carouselWidth = screenWidth - Spacing.md * 2; // Account for horizontal padding
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);

  // Auto-play carousel
  useEffect(() => {
    if (happeningNowEvents.length > 1) {
      const interval = setInterval(() => {
        setCurrentCarouselIndex(prev => {
          const nextIndex = (prev + 1) % happeningNowEvents.length;
          carouselRef.current?.scrollToIndex({
            index: nextIndex,
            animated: true,
          });
          return nextIndex;
        });
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [happeningNowEvents.length]);

  return (
    <ScreenLayout backgroundColor={Colors.backgroundLight}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          {/* Profile Picture */}
          <TouchableOpacity style={styles.profilePicture}>
            <View style={styles.profileImageContainer}>
              {user?.photoURL || backendUser?.avatarUrl ? (
                <Image
                  source={{
                    uri: user?.photoURL || backendUser?.avatarUrl || '',
                  }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatarFallback}>
                  <FontAwesome6
                    name="user"
                    size={30}
                    color={Colors.white}
                    iconStyle="solid"
                  />
                </View>
              )}
            </View>
          </TouchableOpacity>

          {/* Location Information */}
          <TouchableOpacity
            style={styles.locationContainer}
            activeOpacity={0.7}
          >
            <Text style={styles.locationLabel}>Your Location</Text>
            <View style={styles.locationRow}>
              <Text style={styles.locationText}>Metropolis,DC</Text>
              <Text style={styles.chevron}>
                <FontAwesome6 name="caret-down" size={25} iconStyle="solid" />
              </Text>
            </View>
          </TouchableOpacity>

          {/* Search Icon */}
          <TouchableOpacity
            style={styles.iconButton}
            activeOpacity={0.7}
            onPress={handleSearchPress}
          >
            <View style={styles.iconCircle}>
              <FontAwesome6
                name="magnifying-glass"
                size={20}
                iconStyle="solid"
                color={Colors.text}
              />
            </View>
          </TouchableOpacity>

          {/* Join Event Icon */}
          <TouchableOpacity
            style={styles.iconButton}
            activeOpacity={0.7}
            onPress={handleJoinEventPress}
          >
            <View style={styles.iconCircle}>
              <FontAwesome6
                name="expand"
                size={20}
                iconStyle="solid"
                color={Colors.text}
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>

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
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What's Happening Now</Text>
              {happeningNowEvents.length > 0 ? (
                <View style={styles.carouselContainer}>
                  <FlatList
                    ref={carouselRef}
                    data={happeningNowEvents}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    snapToInterval={carouselWidth}
                    decelerationRate="fast"
                    scrollEnabled={true}
                    nestedScrollEnabled={true}
                    keyExtractor={(item, index) => item.id || `event-${index}`}
                    onMomentumScrollEnd={event => {
                      const index = Math.round(
                        event.nativeEvent.contentOffset.x / carouselWidth,
                      );
                      if (index >= 0 && index < happeningNowEvents.length) {
                        setCurrentCarouselIndex(index);
                      }
                    }}
                    renderItem={({ item }) => (
                      <View
                        style={[styles.carouselItem, { width: carouselWidth }]}
                      >
                        <EventCard
                          event={item}
                          variant="large"
                          onPress={() =>
                            navigation.navigate('EventDetails', {
                              event: item,
                            })
                          }
                        />
                      </View>
                    )}
                    getItemLayout={(data, index) => ({
                      length: carouselWidth,
                      offset: carouselWidth * index,
                      index,
                    })}
                  />
                  {/* Carousel Indicators */}
                  {happeningNowEvents.length > 1 && (
                    <View style={styles.indicatorContainer}>
                      {happeningNowEvents.map((_, index) => (
                        <View
                          key={index}
                          style={[
                            styles.indicator,
                            index === currentCarouselIndex &&
                              styles.indicatorActive,
                          ]}
                        />
                      ))}
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.emptySection}>
                  <Text style={styles.emptyText}>No events happening soon</Text>
                </View>
              )}
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Discover Events</Text>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('SearchResults', { query: '' })
                  }
                >
                  <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
              </View>
              {discoverEvents.length > 0 ? (
                <View style={styles.eventsRow}>
                  {discoverEvents.slice(0, 4).map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      variant="small"
                      onPress={() =>
                        navigation.navigate('EventDetails', { event })
                      }
                    />
                  ))}
                </View>
              ) : (
                <View style={styles.emptySection}>
                  <Text style={styles.emptyText}>No events to discover</Text>
                </View>
              )}
            </View>
          </>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Browse Events</Text>
          </View>
          <EventTypeCard />
        </View>
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.backgroundLight,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  profilePicture: {
    marginRight: Spacing.md,
  },
  profileImageContainer: {
    width: 50,
    height: 50,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 35,
    backgroundColor: Colors.backgroundLight,
  },
  avatarFallback: {
    width: 50,
    height: 50,
    borderRadius: 35,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImageText: {
    fontSize: 24,
  },
  locationContainer: {
    flex: 1,
    marginRight: Spacing.md,
  },
  locationLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: FontSizes.md,
    fontWeight: 'bold',
    color: Colors.text,
    marginRight: Spacing.xs,
  },
  chevron: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  iconButton: {
    marginLeft: Spacing.sm,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 100,
    marginTop: 10,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  seeAll: {
    fontSize: FontSizes.md,
    color: Colors.primary,
    fontWeight: '600',
  },
  eventsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  emptySection: {
    padding: Spacing.lg,
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
  },
  emptyText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  carouselContainer: {
    marginHorizontal: -Spacing.md, // Offset parent padding
    paddingHorizontal: Spacing.md,
  },
  carouselItem: {
    paddingHorizontal: Spacing.xs,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md,
    gap: Spacing.xs,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textSecondary,
    opacity: 0.3,
  },
  indicatorActive: {
    backgroundColor: Colors.primary,
    opacity: 1,
    width: 24,
  },
});
