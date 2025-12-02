import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { ScreenLayout } from '../components';
import { Colors } from '../constants/colors';
import { Spacing, BorderRadius, FontSizes } from '../constants/spacing';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { Event } from '../types';

interface JoinedEventsScreenProps {
  onBack: () => void;
  onEventPress: (event: Event) => void;
}

// Mock data for joined events
const mockJoinedEvents: Event[] = [
  {
    id: '1',
    title: 'Innovate & Elevate Tech Summit 2024',
    date: 'Oct 26, 2024',
    location: 'Tech Center',
  },
  {
    id: '2',
    title: 'Sunrise Yoga & Wellness Retreat',
    date: 'Nov 15, 2024',
    location: 'Wellness Center',
  },
];

export const JoinedEventsScreen: React.FC<JoinedEventsScreenProps> = ({
  onBack,
  onEventPress,
}) => {
  return (
    <ScreenLayout backgroundColor={Colors.background}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
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
      >
        {mockJoinedEvents.map((event) => (
          <TouchableOpacity
            key={event.id}
            style={styles.eventCard}
            onPress={() => onEventPress(event)}
            activeOpacity={0.7}
          >
            {/* Event Image */}
            <View style={styles.eventImageContainer}>
              {event.image ? (
                <Image source={{ uri: event.image }} style={styles.eventImage} />
              ) : (
                <View style={styles.eventImagePlaceholder}>
                  <FontAwesome6
                    name="image"
                    size={24}
                    color={Colors.textLight}
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
            </View>
          </TouchableOpacity>
        ))}

        {mockJoinedEvents.length === 0 && (
          <View style={styles.emptyState}>
            <FontAwesome6
              name="calendar-xmark"
              size={48}
              color={Colors.textLight}
              iconStyle="solid"
            />
            <Text style={styles.emptyTitle}>No Joined Events</Text>
            <Text style={styles.emptySubtitle}>
              Events you join will appear here
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
});

