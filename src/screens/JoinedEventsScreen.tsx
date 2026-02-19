import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {
  ScreenLayout,
  EventListCard,
  ScreenHeader,
  EventListCardSkeleton,
} from '../components';
import { Colors } from '../constants/colors';
import { Spacing, FontSizes } from '../constants/spacing';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { Event } from '../types';
import { guestService } from '../services';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import { getEventStatus } from '../utils/eventMapper';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendUser]);

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
        const events = response.data
          .map((guestEvent: any) => {
            const event = guestEvent.event;
            if (!event) {
              console.warn('Guest event missing event data:', guestEvent);
              return null;
            }

            const startDate = new Date(event.startDate);
            const endDate = event.endDate ? new Date(event.endDate) : undefined;
            return {
              id: event.id,
              shortCode: event.shortCode,
              title: event.name,
              date: dayjs(startDate).format('MMM D, YYYY'),
              location: event.location || 'Location TBA',
              attendees: event._count?.guestEvents || 0,
              startTime: dayjs(startDate).format('h:mm A'),
              endTime: endDate ? dayjs(endDate).format('h:mm A') : undefined,
              coverImage: event.coverImage,
              portraitImage: event.portraitImage,
              // Store original dates for status calculation
              startDate: startDate,
              endDate: endDate,
            } as Event & { startDate?: Date; endDate?: Date };
          })
          .filter(Boolean) as Event[];

        setJoinedEvents(events);
      } else {
        console.log(
          'Failed to fetch joined events:',
          response.message || response.error,
        );
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

  return (
    <ScreenLayout backgroundColor={Colors.backgroundLight}>
      <ScreenHeader title="Joined Events" onBack={onBack} />

      {/* Events List */}
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
          <View style={styles.skeletonContainer}>
            {[1, 2, 3, 4, 5].map((_, index) => (
              <EventListCardSkeleton key={index} />
            ))}
          </View>
        ) : joinedEvents.length > 0 ? (
          joinedEvents.map(event => {
            const eventWithDate = event as Event & {
              startDate?: Date;
              endDate?: Date;
            };
            const status = getEventStatus(
              eventWithDate.startDate || event.date || new Date(),
              eventWithDate.endDate || undefined,
            );
            const imageUri =
              event.image || event.coverImage || event.portraitImage;
            // Use original startDate if available, otherwise use formatted date string
            const eventDate = eventWithDate.startDate || event.date;

            return (
              <EventListCard
                key={event.id}
                title={event.title}
                date={eventDate}
                attendeesCount={event.attendees || 0}
                imageUri={imageUri}
                status={status}
                onPress={() => handleEventPress(event)}
                showOptions={false}
              />
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <FontAwesome6
                name="calendar-xmark"
                size={48}
                color={Colors.white}
                iconStyle="solid"
              />
            </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skeletonContainer: {
    paddingTop: Spacing.md,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.xxl * 2,
    minHeight: 400,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
});
