import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Header, Card } from '../components';
import { Colors } from '../constants/colors';
import { Spacing, FontSizes, BorderRadius } from '../constants/spacing';
import { Announcement } from '../types';

interface AnnouncementsScreenProps {
  onNavigate: (route: string) => void;
}

const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'Dinner is Served!',
    description: 'Join us in the main hall for the reception dinner.',
    timestamp: 'Just now',
    isNew: true,
  },
  {
    id: '2',
    title: 'Schedule Change',
    description: 'The keynote has been moved to Room B.',
    timestamp: '5m ago',
    isNew: true,
  },
  {
    id: '3',
    title: 'Bus Departs in 15 Min',
    description: 'The shuttle bus will be leaving shortly.',
    timestamp: '1h ago',
    isNew: false,
  },
  {
    id: '4',
    title: 'Photo Booth is Open!',
    description: 'Come make some memories!',
    timestamp: '2h ago',
    isNew: false,
  },
];

export const AnnouncementsScreen: React.FC<AnnouncementsScreenProps> = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={{ paddingTop: 50 }}>
        <Header title="Announcements" />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {mockAnnouncements.map(announcement => (
          <Card key={announcement.id} style={styles.announcementCard}>
            <View style={styles.announcementHeader}>
              <View style={styles.announcementContent}>
                <Text style={styles.announcementTitle}>
                  {announcement.title}
                </Text>
                <Text style={styles.announcementDescription}>
                  {announcement.description}
                </Text>
                {announcement.isNew && (
                  <View style={styles.newBadge}>
                    <Text style={styles.newBadgeText}>New</Text>
                  </View>
                )}
              </View>
              <Text style={styles.timestamp}>{announcement.timestamp}</Text>
            </View>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 100, // Extra padding for floating navigation bar
  },
  announcementCard: {
    marginBottom: Spacing.md,
  },
  announcementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  announcementContent: {
    flex: 1,
    marginRight: Spacing.md,
  },
  announcementTitle: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  announcementDescription: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  newBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.secondary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.sm,
  },
  newBadgeText: {
    fontSize: FontSizes.sm,
    color: Colors.white,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
});
