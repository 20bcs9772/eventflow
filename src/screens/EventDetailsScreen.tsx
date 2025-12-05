import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Share,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { Colors } from '../constants/colors';
import { Spacing, FontSizes, BorderRadius } from '../constants/spacing';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { ScreenLayout, FloatingActionButton } from '../components';
import { eventService, guestService } from '../services';
import { useAuth } from '../context/AuthContext';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

type EventDetailsRouteProp = RouteProp<RootStackParamList, 'EventDetails'>;

type TabKey = 'schedule' | 'activity' | 'about' | 'members';

export const EventDetailsScreen = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('about');
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [eventData, setEventData] = useState<any>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const route = useRoute<EventDetailsRouteProp>();
  const navigation = useNavigation();
  const { backendUser } = useAuth();
  const { event } = route.params;

  useEffect(() => {
    fetchEventDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event.id, event.shortCode]);

  const fetchEventDetails = async () => {
    setIsLoading(true);
    try {
      let response;
      if (event.id) {
        response = await eventService.getEventById(event.id);
      } else if (event.shortCode) {
        response = await eventService.getEventByShortCode(event.shortCode);
      } else {
        Alert.alert('Error', 'Invalid event');
        navigation.goBack();
        return;
      }

      if (response.success && response.data) {
        setEventData(response.data);
        
        // Check if user has joined this event
        if (backendUser && response.data.guestEvents) {
          const userJoined = response.data.guestEvents.some(
            (ge: any) => ge.user?.id === backendUser.id
          );
          setHasJoined(userJoined);
        }
      } else {
        Alert.alert('Error', response.message || 'Failed to load event details');
        navigation.goBack();
      }
    } catch (error: any) {
      console.error('Error fetching event:', error);
      Alert.alert('Error', 'Failed to load event details');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    Alert.alert(
      isSaved ? 'Removed from saved' : 'Saved!',
      isSaved
        ? 'Event removed from your saved list.'
        : 'Event saved to your list.',
    );
  };

  const handleShare = async () => {
    try {
      const eventTitle = eventData?.name || event.title;
      const eventDate = eventData
        ? dayjs(eventData.startDate).format('MMM D, YYYY')
        : event.date;
      const eventLocation = eventData?.location || event.location;

      await Share.share({
        message: `Check out this event: ${eventTitle} on ${eventDate} at ${eventLocation}`,
        title: eventTitle,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleJoinEvent = async () => {
    if (!eventData) return;

    if (hasJoined) {
      // Leave event - only for authenticated users
      if (!backendUser) {
        Alert.alert('Error', 'Please sign in to leave an event');
        return;
      }
      handleLeaveEvent();
      return;
    }

    // For unauthenticated users, navigate to JoinEvent screen with event code
    if (!backendUser) {
      // Navigate to JoinEvent screen with the event code pre-filled
      navigation.navigate('JoinEvent', {
        eventCode: eventData.shortCode,
      });
      return;
    }

    // For authenticated users, join directly
    await performJoinEvent({ userId: backendUser.id });
  };

  const performJoinEvent = async (joinData: { userId: string }) => {
    if (!eventData) return;

    setIsJoining(true);
    try {
      const response = await guestService.joinEvent({
        eventId: eventData.id,
        ...joinData,
      });

      if (response.success) {
        setHasJoined(true);
        // Clear event cache to force refresh
        eventService.clearCache(eventData.id);
        Alert.alert('Success', 'You have joined the event!', [
          {
            text: 'OK',
            onPress: () => fetchEventDetails(), // Refresh event data
          },
        ]);
      } else {
        // Check if error is related to authentication/user creation
        const errorMessage = response.message || response.error || 'Failed to join event';
        const isAuthError = 
          errorMessage.includes('firebaseUid') ||
          errorMessage.includes('firebase') ||
          errorMessage.includes('authentication') ||
          errorMessage.includes('User not found');

        if (isAuthError && !backendUser) {
          // Prompt user to sign in or sign up
          Alert.alert(
            'Authentication Required',
            'To join events, please sign in or create an account. This helps us keep track of your events and provide a better experience.',
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Sign In',
                onPress: () => {
                  navigation.navigate('Login', {
                    returnTo: 'EventDetails',
                  });
                },
              },
              {
                text: 'Sign Up',
                style: 'default',
                onPress: () => {
                  navigation.navigate('SignUp', {
                    returnTo: 'EventDetails',
                  });
                },
              },
            ]
          );
        } else {
          Alert.alert('Error', errorMessage);
        }
      }
    } catch (error: any) {
      console.error('Error joining event:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to join event. Please try again.',
      );
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveEvent = async () => {
    if (!eventData) return;
    
    // Only authenticated users can leave events
    if (!backendUser) {
      Alert.alert('Error', 'Please sign in to leave an event');
      return;
    }

    Alert.alert(
      'Leave Event',
      'Are you sure you want to leave this event?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            setIsJoining(true);
            try {
              const response = await guestService.leaveEvent(eventData.id);

              if (response.success) {
                setHasJoined(false);
                // Clear event cache to force refresh
                eventService.clearCache(eventData.id);
                Alert.alert('Success', 'You have left the event');
                fetchEventDetails(); // Refresh event data
              } else {
                Alert.alert('Error', response.message || 'Failed to leave event');
              }
            } catch (error: any) {
              console.error('Error leaving event:', error);
              Alert.alert('Error', 'Failed to leave event. Please try again.');
            } finally {
              setIsJoining(false);
            }
          },
        },
      ]
    );
  };

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'about', label: 'About' },
    { key: 'schedule', label: 'Schedule' },
    { key: 'activity', label: 'Activity' },
    { key: 'members', label: 'Members' },
  ];

  const renderScheduleSection = () => {
    const scheduleItems = eventData?.scheduleItems || [];

    if (scheduleItems.length === 0) {
      return (
        <>
          <Text style={styles.sectionTitle}>Schedule</Text>
          <View style={styles.card}>
            <Text style={styles.emptyText}>No schedule items yet</Text>
          </View>
        </>
      );
    }

    return (
      <>
        <Text style={styles.sectionTitle}>Schedule</Text>
        <View style={styles.card}>
          {scheduleItems.map((item: any, index: number) => (
            <View key={index} style={styles.scheduleItem}>
              <View
                style={[styles.iconCircle, { backgroundColor: item.color }]}
              >
                <FontAwesome6
                  name={"circle"}
                  size={16}
                  color={Colors.primary}
                  iconStyle="solid"
                />
              </View>
              {index < scheduleItems.length - 1 && (
                <View style={styles.verticalLine} />
              )}
              <View style={styles.scheduleContent}>
                <Text style={styles.scheduleTitle}>{item.title}</Text>
                <Text style={styles.scheduleSubtitle}>
                  {dayjs(item.startTime).format('h:mm A')} •{' '}
                  {item.location || 'TBA'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </>
    );
  };

  const renderActivitySection = () => {
    const announcements = eventData?.announcements || [];

    if (announcements.length === 0) {
      return (
        <>
          <Text style={styles.sectionTitle}>Activity</Text>
          <View style={styles.card}>
            <Text style={styles.emptyText}>No announcements yet</Text>
          </View>
        </>
      );
    }

    return (
      <>
        <Text style={styles.sectionTitle}>Activity</Text>
        {announcements.map((item: any, idx: number) => (
          <View key={idx} style={styles.card}>
            <View style={styles.activityRow}>
              <View
                style={[
                  styles.avatar,
                  {
                    backgroundColor: Colors.primaryLight + '30',
                    justifyContent: 'center',
                    alignItems: 'center',
                  },
                ]}
              >
                <Text style={{ color: Colors.primary, fontWeight: '600' }}>
                  {item.sender?.name?.charAt(0) || 'A'}
                </Text>
              </View>
              <View>
                <Text style={styles.activityName}>
                  {item.sender?.name || 'Organizer'}
                </Text>
                <Text style={styles.activityRole}>
                  Organizer • {dayjs(item.createdAt).fromNow()}
                </Text>
              </View>
            </View>
            <Text style={styles.activityMessage}>{item.title}</Text>
            {item.message && (
              <Text style={styles.activityMessage}>{item.message}</Text>
            )}
          </View>
        ))}
      </>
    );
  };

  const renderAboutSection = () => {
    const description = eventData?.description || 'No description available.';

    return (
      <>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.card}>
          <Text style={styles.aboutText}>{description}</Text>
        </View>
      </>
    );
  };

  const renderMembersSection = () => {
    const guests = eventData?.guestEvents || [];
    const totalCount = guests.length;

    return (
      <>
        <Text style={styles.sectionTitle}>Members ({totalCount})</Text>
        <View style={styles.card}>
          {guests.slice(0, 10).map((guest: any, i: number) => (
            <View key={i} style={styles.memberRow}>
              <View
                style={[
                  styles.memberAvatar,
                  {
                    backgroundColor: Colors.primaryLight + '30',
                    justifyContent: 'center',
                    alignItems: 'center',
                  },
                ]}
              >
                <Text style={{ color: Colors.primary, fontWeight: '600' }}>
                  {guest.user?.name?.charAt(0) || 'G'}
                </Text>
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>
                  {guest.user?.name || 'Guest'}
                </Text>
                <Text style={styles.memberRole}>{guest.status}</Text>
              </View>
            </View>
          ))}
          {totalCount > 10 && (
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>
                View All {totalCount} Members
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'schedule':
        return renderScheduleSection();
      case 'activity':
        return renderActivitySection();
      case 'about':
        return renderAboutSection();
      case 'members':
        return renderMembersSection();
      default:
        return renderScheduleSection();
    }
  };

  if (isLoading) {
    return (
      <ScreenLayout backgroundColor={Colors.backgroundLight}>
        <View
          style={[
            styles.container,
            { justifyContent: 'center', alignItems: 'center' },
          ]}
        >
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </ScreenLayout>
    );
  }

  if (!eventData) {
    return (
      <ScreenLayout backgroundColor={Colors.backgroundLight}>
        <View style={styles.container}>
          <Text>Event not found</Text>
        </View>
      </ScreenLayout>
    );
  }

  const displayTitle = eventData.name || event.title;
  const displayDate = eventData.startDate
    ? dayjs(eventData.startDate).format('MMM D, YYYY')
    : event.date;
  const displayLocation = eventData.location || event.location;

  return (
    <ScreenLayout backgroundColor={Colors.backgroundLight}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header Row with Back, Save, Share */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => navigation.goBack()}
            >
              <FontAwesome6
                name="arrow-left"
                size={18}
                color={Colors.text}
                iconStyle="solid"
              />
            </TouchableOpacity>

            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={handleSave}
              >
                <FontAwesome6
                  name="bookmark"
                  size={18}
                  color={isSaved ? Colors.primary : Colors.text}
                  iconStyle={isSaved ? 'solid' : 'regular'}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={handleShare}
              >
                <FontAwesome6
                  name="share-nodes"
                  size={18}
                  color={Colors.text}
                  iconStyle="solid"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>{displayTitle}</Text>

          {/* Sub Info */}
          <View style={styles.subInfoRow}>
            <FontAwesome6
              name="calendar"
              size={14}
              color={Colors.textSecondary}
            />
            <Text style={styles.subInfoText}>
              {displayDate} • {displayLocation}
            </Text>
          </View>

          {/* Tabs */}
          <View style={styles.tabsRow}>
            {tabs.map(tab => (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab.key && styles.tabActiveText,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Dynamic Content */}
          {renderContent()}

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* FLOATING JOIN BUTTON */}
        <FloatingActionButton
          title={
            isJoining 
              ? (hasJoined ? 'Leaving...' : 'Joining...')
              : (hasJoined ? 'Leave Event' : 'Join Event')
          }
          onPress={handleJoinEvent}
          disabled={isJoining}
          icon={
            isJoining ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : undefined
          }
        />
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },

  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 40,
    paddingTop: Spacing.md,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },

  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },

  subInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.xl,
  },

  subInfoText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
  },

  /* Tabs */
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.lg,
    flexWrap: 'wrap',
  },

  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#EDEDED',
    borderRadius: 20,
  },

  tabActive: {
    backgroundColor: Colors.primary,
  },

  tabText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },

  tabActiveText: {
    color: Colors.white,
    fontWeight: '600',
  },

  /* Section Title */
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    marginBottom: Spacing.md,
    color: Colors.text,
  },

  /* Card */
  card: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },

  /* Schedule Timeline */
  scheduleItem: {
    flexDirection: 'row',
    marginBottom: 24,
    position: 'relative',
  },

  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },

  verticalLine: {
    position: 'absolute',
    left: 20,
    top: 40,
    width: 2,
    height: 32,
    backgroundColor: '#DDD',
  },

  scheduleContent: {
    marginLeft: 16,
    justifyContent: 'center',
  },

  scheduleTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },

  scheduleSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },

  /* Activity */
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: 12,
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },

  activityName: {
    fontWeight: '700',
    color: Colors.text,
  },

  activityRole: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },

  activityMessage: {
    fontSize: FontSizes.sm,
    color: Colors.text,
    marginTop: 6,
    lineHeight: 20,
  },

  /* About / FAQ */
  aboutText: {
    fontSize: FontSizes.sm,
    color: Colors.text,
    marginBottom: Spacing.md,
    lineHeight: 22,
  },

  faqRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },

  faqQuestion: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },

  faqAnswer: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    paddingVertical: 6,
    paddingLeft: Spacing.sm,
    lineHeight: 20,
  },

  /* Members */
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },

  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },

  memberInfo: {
    flex: 1,
  },

  memberName: {
    fontSize: FontSizes.md,
    color: Colors.text,
    fontWeight: '600',
  },

  memberRole: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  viewAllButton: {
    marginTop: Spacing.md,
    alignItems: 'center',
  },

  viewAllText: {
    color: Colors.primary,
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },

  emptyText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
    textAlign: 'center',
    padding: Spacing.md,
  },
});
