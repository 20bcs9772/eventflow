import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Header, SearchBar, EventCard } from '../components';
import { Colors } from '../constants/colors';
import { Spacing, FontSizes } from '../constants/spacing';
import { Event } from '../types';

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

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { paddingTop: 40 }]}>
        <View style={styles.headerContent}>
          {/* Profile Picture */}
          <TouchableOpacity style={styles.profilePicture}>
            <View style={styles.profileImageContainer}>
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileImageText}>👤</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Location Information */}
          <TouchableOpacity style={styles.locationContainer} activeOpacity={0.7}>
            <Text style={styles.locationLabel}>Your Location</Text>
            <View style={styles.locationRow}>
              <Text style={styles.locationText}>Metropolis,DC</Text>
              <Text style={styles.chevron}>▼</Text>
            </View>
          </TouchableOpacity>

          {/* Notification Icon */}
          <TouchableOpacity style={styles.notificationButton} activeOpacity={0.7}>
            <View style={styles.notificationCircle}>
              <View style={styles.bellIcon}>
                <View style={[styles.bellTop, { borderColor: Colors.textSecondary }]} />
                <View style={[styles.bellBody, { borderColor: Colors.textSecondary }]}>
                  <View style={[styles.bellClapper, { backgroundColor: Colors.textSecondary }]} />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>
        <SearchBar
          placeholder="Search events..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFilterPress={() => {}}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's Happening Now</Text>
          <EventCard
            event={mockEvents[0]}
            variant="large"
            onPress={() => {}}
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
            <EventCard
              event={mockEvents[1]}
              variant="small"
              onPress={() => {}}
            />
            <EventCard
              event={mockEvents[2]}
              variant="small"
              onPress={() => {}}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.background,
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
  notificationButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  bellTop: {
    width: 4,
    height: 4,
    borderWidth: 1.5,
    borderRadius: 2,
    borderBottomWidth: 0,
    marginBottom: -1,
    alignSelf: 'center',
  },
  bellBody: {
    width: 14,
    height: 12,
    borderWidth: 1.5,
    borderRadius: 7,
    borderTopWidth: 0,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellClapper: {
    width: 2,
    height: 2,
    borderRadius: 1,
    position: 'absolute',
    bottom: -2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 100, // Extra padding for floating navigation bar
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

