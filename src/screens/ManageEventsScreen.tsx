import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {
  ScreenLayout,
  FloatingActionButton,
  EventListCard,
  ScreenHeader,
} from '../components';
import { Colors } from '../constants/colors';
import { Spacing, FontSizes } from '../constants/spacing';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { useNavigation } from '@react-navigation/native';
import { eventService } from '../services';
import { useAuth } from '../context/AuthContext';
import {
  mapBackendEventToFrontend,
  getEventStatus,
} from '../utils/eventMapper';

interface ManageEventsScreenProps {
  onBack?: () => void;
}

interface BackendEvent {
  id: string;
  name: string;
  description?: string | null;
  startDate: string | Date;
  endDate: string | Date;
  location?: string | null;
  shortCode: string;
  visibility: string;
  type: string;
  _count?: {
    guestEvents?: number;
  };
  guestEvents?: Array<{
    user?: {
      id: string;
      name?: string | null;
      email?: string | null;
    };
  }>;
  coverImage?: string;
  portraitImage?: string;
  galleryImages?: string[];
}

export const ManageEventsScreen: React.FC<ManageEventsScreenProps> = ({
  onBack,
}) => {
  const navigation = useNavigation<any>();
  const { backendUser } = useAuth();
  const [events, setEvents] = useState<BackendEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (backendUser) {
      fetchEvents();
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendUser]);

  const fetchEvents = async () => {
    if (!backendUser) return;

    try {
      setIsLoading(true);
      const response = await eventService.getMyEvents();

      if (response.success && response.data) {
        setEvents(response.data);
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

  const handleCreateEvent = () => {
    navigation.navigate('CreateEvent');
  };

  const handleEventPress = (event: BackendEvent) => {
    const frontendEvent = mapBackendEventToFrontend(event);
    navigation.navigate('EventDetails', { event: frontendEvent });
  };

  const handleEditEvent = (event: BackendEvent) => {
    // TODO: Navigate to edit event screen
    const frontendEvent = mapBackendEventToFrontend(event);
    navigation.navigate('EventDetails', { event: frontendEvent });
  };

  // Separate events into upcoming and past
  const now = new Date();
  const upcomingEvents = events.filter(
    event => new Date(event.startDate) >= now,
  );
  const pastEvents = events.filter(event => new Date(event.startDate) < now);

  const renderEventCard = (event: BackendEvent, isPast: boolean = false) => {
    const status = getEventStatus(event.startDate, event.endDate);
    const attendeeCount =
      event._count?.guestEvents || event.guestEvents?.length || 0;
    const imageUri = event.portraitImage || event.coverImage;

    return (
      <EventListCard
        key={event.id}
        title={event.name}
        date={event.startDate}
        attendeesCount={attendeeCount}
        imageUri={imageUri}
        status={status}
        onPress={() => handleEventPress(event)}
        onOptionsPress={() => handleEditEvent(event)}
        showOptions={!isPast}
      />
    );
  };

  if (isLoading) {
    return (
      <ScreenLayout backgroundColor={Colors.backgroundLight}>
        <ScreenHeader title="My Events" onBack={onBack} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </ScreenLayout>
    );
  }

  if (!backendUser) {
    return (
      <ScreenLayout backgroundColor={Colors.backgroundLight}>
        <ScreenHeader title="My Events" onBack={onBack} />
        <View style={styles.emptyContainer}>
          <FontAwesome6
            name="calendar-xmark"
            size={48}
            color={Colors.textLight}
            iconStyle="solid"
          />
          <Text style={styles.emptyTitle}>Sign in to view your events</Text>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout backgroundColor={Colors.backgroundLight}>
      <ScreenHeader title="My Events" onBack={onBack} />

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
        {events.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <FontAwesome6
                name="calendar"
                size={48}
                color={Colors.white}
                iconStyle="solid"
              />
            </View>
            <Text style={styles.emptyTitle}>No Events Yet</Text>
            <Text style={styles.emptySubtitle}>
              You haven't created any events. Tap the button below to get
              started.
            </Text>
          </View>
        ) : (
          <>
            {upcomingEvents.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>UPCOMING EVENTS</Text>
                {upcomingEvents.map(event => renderEventCard(event, false))}
              </View>
            )}

            {pastEvents.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>PAST EVENTS</Text>
                {pastEvents.map(event => renderEventCard(event, true))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      <FloatingActionButton
        title="Create New Event"
        onPress={handleCreateEvent}
        icon={
          <FontAwesome6
            name="plus"
            size={20}
            color={Colors.white}
            iconStyle="solid"
          />
        }
      />
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
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
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
