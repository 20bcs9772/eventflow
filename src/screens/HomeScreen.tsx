import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { EventCard, ScreenLayout } from '../components';
import { Colors } from '../constants/colors';
import { Spacing, FontSizes } from '../constants/spacing';
import { Event } from '../types';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { useNavigation } from '@react-navigation/native';

interface HomeScreenProps {
  onNavigate: (route: string) => void;
}

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'The Miller Wedding',
    date: 'Oct 26, 2024',
    location: 'Grand Hyatt',
    attendees: 12,
    attendeesAvatars: ['', '', ''],
  },
  {
    id: '2',
    title: 'Corporate Gala',
    date: 'Dec 15, 2024',
    location: 'Convention Center',
    attendees: 8,
  },
  {
    id: '3',
    title: 'Birthday Bash',
    date: 'Nov 5, 2024',
    location: 'Private Venue',
    attendees: 5,
  },
];

export const HomeScreen: React.FC<HomeScreenProps> = () => {
  const navigation = useNavigation<any>();

  const handleSearchPress = () => {
    navigation.navigate('SearchResults', { query: '' });
  };

  return (
    <ScreenLayout backgroundColor={Colors.backgroundLight}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          {/* Profile Picture */}
          <TouchableOpacity style={styles.profilePicture}>
            <View style={styles.profileImageContainer}>
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileImageText}>
                  <FontAwesome6 name="user" size={25} />
                </Text>
              </View>
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
              <FontAwesome6 name="magnifying-glass" size={20} iconStyle="solid" color={Colors.text} />
            </View>
          </TouchableOpacity>

          {/* Notification Icon */}
          <TouchableOpacity
            style={styles.iconButton}
            activeOpacity={0.7}
          >
            <View style={styles.iconCircle}>
              <FontAwesome6 name="bell" size={20} iconStyle="regular" color={Colors.text} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's Happening Now</Text>
          <EventCard
            event={mockEvents[0]}
            variant="large"
            onPress={() =>
              navigation.navigate('EventDetails', { event: mockEvents[0] })
            }
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Discover Events</Text>
            <TouchableOpacity onPress={() => {}}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.eventsRow}>
            <EventCard event={mockEvents[1]} variant="small" />
            <EventCard
              event={mockEvents[2]}
              variant="small"
              onPress={() => {}}
            />
          </View>
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
    borderRadius: 25,
    borderColor: Colors.backgroundDark,
    borderWidth: 1.5,
    overflow: 'hidden',
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
    marginTop: 10
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
  },
});
