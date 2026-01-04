import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ScreenLayout, Header } from '../components';
import { Colors } from '../constants/colors';
import { Spacing, FontSizes } from '../constants/spacing';
import { Announcement } from '../types';

interface AnnouncementsScreenProps {}

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
  const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());

  const handleAnnouncementPress = (id: string) => {
    setViewedIds(prev => new Set(prev).add(id));
  };

  return (
    <ScreenLayout backgroundColor={Colors.backgroundLight}>
      <Header title="Announcements" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.announcementsList}>
          {mockAnnouncements.map((announcement, index) => {
            const isViewed = viewedIds.has(announcement.id);
            const isUnread = announcement.isNew && !isViewed;

            return (
              <TouchableOpacity
                key={announcement.id}
                style={[
                  styles.announcementItem,
                  isUnread && styles.announcementItemUnread,
                  index < mockAnnouncements.length - 1 && styles.announcementItemWithDivider,
                ]}
                onPress={() => handleAnnouncementPress(announcement.id)}
                activeOpacity={0.7}
              >
                <View style={styles.announcementHeader}>
                  <View style={styles.announcementTitleRow}>
                    <Text style={styles.announcementTitle}>
                      {announcement.title}
                    </Text>
                    {announcement.isNew && (
                      <View style={styles.newBadge}>
                        <View style={styles.newBadgeDot} />
                      </View>
                    )}
                  </View>
                  <Text style={styles.timestamp}>{announcement.timestamp}</Text>
                </View>
                <Text style={styles.announcementDescription}>
                  {announcement.description}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Extra padding for floating navigation bar
  },
  announcementsList: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginTop: Spacing.md,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  announcementItem: {
    padding: Spacing.md,
    backgroundColor: Colors.white,
  },
  announcementItemUnread: {
    backgroundColor: 'rgba(107, 70, 193, 0.02)',
  },
  announcementItemWithDivider: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  announcementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  announcementTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.sm,
  },
  announcementTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  newBadge: {
    marginLeft: Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newBadgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  timestamp: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    fontWeight: '400',
  },
  announcementDescription: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
