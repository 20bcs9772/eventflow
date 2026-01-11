import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenLayout, Header } from '../components';
import { Colors } from '../constants/colors';
import { Spacing, FontSizes } from '../constants/spacing';
import { announcementService, FlattenedAnnouncement } from '../services';
import { useAuth } from '../context/AuthContext';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface AnnouncementsScreenProps {}

export const AnnouncementsScreen: React.FC<AnnouncementsScreenProps> = () => {
  const navigation = useNavigation<any>();
  const { backendUser } = useAuth();
  const [announcements, setAnnouncements] = useState<FlattenedAnnouncement[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());

  const fetchAnnouncements = useCallback(async () => {
    if (!backendUser) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await announcementService.getUserAnnouncements(
        !isRefreshing, // Use cache only if not refreshing
      );

      if (response.success && response.data) {
        // Flatten the nested structure
        const flattened: FlattenedAnnouncement[] = [];
        response.data.forEach(item => {
          item.event.announcements.forEach(announcement => {
            flattened.push({
              id: announcement.id,
              title: announcement.title,
              message: announcement.message,
              createdAt: announcement.createdAt,
              senderId: announcement.senderId,
              eventId: item.event.id,
              eventName: item.event.name,
              eventStartDate: item.event.startDate,
              eventEndDate: item.event.endDate,
            });
          });
        });

        // Sort by creation date (newest first)
        flattened.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA;
        });

        setAnnouncements(flattened);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [backendUser, isRefreshing]);

  useEffect(() => {
    fetchAnnouncements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendUser]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchAnnouncements();
  };

  const handleAnnouncementPress = (announcement: FlattenedAnnouncement) => {
    setViewedIds(prev => new Set(prev).add(announcement.id));

    // Navigate to event details
    const frontendEvent = {
      id: announcement.eventId,
      shortCode: '', // Will be fetched in EventDetailsScreen
      title: announcement.eventName,
      date: dayjs(announcement.eventStartDate).format('MMM D, YYYY'),
      location: 'Location TBA', // Will be fetched in EventDetailsScreen
      startTime: dayjs(announcement.eventStartDate).format('h:mm A'),
      endTime: announcement.eventEndDate
        ? dayjs(announcement.eventEndDate).format('h:mm A')
        : undefined,
    };

    navigation.navigate('EventDetails', { event: frontendEvent });
  };

  const formatTimestamp = (date: string | Date): string => {
    const now = dayjs();
    const announcementDate = dayjs(date);
    const diffInMinutes = now.diff(announcementDate, 'minute');

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      return announcementDate.format('MMM D, YYYY');
    }
  };

  if (!backendUser) {
    return (
      <ScreenLayout backgroundColor={Colors.backgroundLight}>
        <Header title="Announcements" />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Please sign in to view announcements
          </Text>
        </View>
      </ScreenLayout>
    );
  }

  if (isLoading) {
    return (
      <ScreenLayout backgroundColor={Colors.backgroundLight}>
        <Header title="Announcements" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout backgroundColor={Colors.backgroundLight}>
      <Header title="Announcements" />
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
        {announcements.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No announcements yet</Text>
            <Text style={styles.emptySubtext}>
              Announcements from events you've joined will appear here
            </Text>
          </View>
        ) : (
          <View style={styles.announcementsList}>
            {announcements.map((announcement, index) => {
              const isViewed = viewedIds.has(announcement.id);
              const announcementDate = new Date(announcement.createdAt);
              const isRecent =
                Date.now() - announcementDate.getTime() < 24 * 60 * 60 * 1000; // Within 24 hours
              const isUnread = isRecent && !isViewed;

              return (
                <TouchableOpacity
                  key={announcement.id}
                  style={[
                    styles.announcementItem,
                    isUnread && styles.announcementItemUnread,
                    index < announcements.length - 1 &&
                      styles.announcementItemWithDivider,
                  ]}
                  onPress={() => handleAnnouncementPress(announcement)}
                  activeOpacity={0.7}
                >
                  <View style={styles.announcementHeader}>
                    <View style={styles.announcementTitleRow}>
                      <Text style={styles.announcementTitle}>
                        {announcement.title}
                      </Text>
                      {isUnread && (
                        <View style={styles.newBadge}>
                          <View style={styles.newBadgeDot} />
                        </View>
                      )}
                    </View>
                    <Text style={styles.timestamp}>
                      {formatTimestamp(announcement.createdAt)}
                    </Text>
                  </View>
                  <Text style={styles.eventName}>{announcement.eventName}</Text>
                  <Text style={styles.announcementDescription}>
                    {announcement.message}
                  </Text>
                </TouchableOpacity>
              );
            })}
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
  eventName: {
    fontSize: FontSizes.xs,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: Spacing.xs,
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
    padding: Spacing.xl,
    minHeight: 300,
  },
  emptyText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    fontSize: FontSizes.sm,
    color: Colors.textLight,
    textAlign: 'center',
  },
});
