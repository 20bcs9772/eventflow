import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { ScreenLayout } from '../components';
import { Colors } from '../constants/colors';
import { Spacing, BorderRadius, FontSizes } from '../constants/spacing';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { Event } from '../types';
import { guestService } from '../services';
import { mapBackendEventsToFrontend } from '../utils/eventMapper';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';

interface JoinedEventsScreenProps {
  onBack?: () => void;
  onEventPress?: (event: Event) => void;
}

export const JoinedEventsScreen: React.FC<JoinedEventsScreenProps> = ({
  onBack,
  onEventPress,
}) => {
  const navigation = useNavigation<any>();
  const { backendUser } = useAuth();
  const [joinedEvents, setJoinedEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchJoinedEvents();
  }, []);

  const fetchJoinedEvents = async () => {
    if (!backendUser) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await guestService.getMyJoinedEvents();

      if (response.success && response.data) {
        // Map guest events to Event type
        const events = response.data.map((guestEvent: any) => {
          const event = guestEvent.event;
          if (!event) return null;

          const startDate = new Date(event.startDate);
          return {
            id: event.id,
            shortCode: event.shortCode,
            title: event.name,
            date: dayjs(startDate).format('MMM D, YYYY'),
            location: event.location || 'Location TBA',
            attendees: event._count?.guestEvents || 0,
            startTime: dayjs(startDate).format('h:mm A'),
            endTime: event.endDate 
              ? dayjs(new Date(event.endDate)).format('h:mm A')
              : undefined,
          };
        }).filter(Boolean);

        setJoinedEvents(events);
      }
    } catch (error) {
      console.error('Error fetching joined events:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchJoinedEvents();
  };

  const handleEventPress = (event: Event) => {
    if (onEventPress) {
      onEventPress(event);
    } else {
      navigation.navigate('EventDetails', { event });
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };
  return (
    <ScreenLayout backgroundColor={Colors.background}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <FontAwesome6
            name="chevron-left"
            size={20}
            color={Colors.text}
            iconStyle="solid"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Joined Events</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Events List */}
      <ScrollView
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
        ) : joinedEvents.length > 0 ? (
          joinedEvents.map((event) => (
            <TouchableOpacity
              key={event.id}
              style={styles.eventCard}
              onPress={() => handleEventPress(event)}
              activeOpacity={0.7}
            >
              {/* Event Image */}
              <View style={styles.eventImageContainer}>
                {event.image ? (
                  <Image source={{ uri: event.image }} style={styles.eventImage} />
                ) : (
                  <View style={styles.eventImagePlaceholder}>
                    <FontAwesome6
                      name="calendar"
                      size={24}
                      color={Colors.primary}
                      iconStyle="solid"
                    />
                  </View>
                )}
              </View>

              {/* Event Info */}
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle} numberOfLines={2}>
                  {event.title}
                </Text>
                <View style={styles.eventDateRow}>
                  <FontAwesome6
                    name="calendar"
                    size={14}
                    color={Colors.primary}
                    iconStyle="regular"
                  />
                  <Text style={styles.eventDate}>{event.date}</Text>
                </View>
                {event.location && (
                  <View style={styles.eventLocationRow}>
                    <FontAwesome6
                      name="location-dot"
                      size={12}
                      color={Colors.textSecondary}
                      iconStyle="solid"
                    />
                    <Text style={styles.eventLocation} numberOfLines={1}>
                      {event.location}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <FontAwesome6
              name="calendar-xmark"
              size={48}
              color={Colors.textLight}
              iconStyle="solid"
            />
            <Text style={styles.emptyTitle}>No Joined Events</Text>
            <Text style={styles.emptySubtitle}>
              {backendUser 
                ? 'Events you join will appear here'
                : 'Please sign in to see your joined events'}
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: Colors.text,
  },
  headerSpacer: {
    width: 44,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  eventImageContainer: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginRight: Spacing.md,
  },
  eventImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  eventImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
  },
  eventInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  eventTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
    lineHeight: 22,
  },
  eventDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  eventDate: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.xxl * 2,
  },
  emptyTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
    paddingTop: Spacing.xxl,
  },
  eventLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  eventLocation: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    flex: 1,
  },
});


