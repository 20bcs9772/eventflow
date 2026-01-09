import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
  ActivityIndicator,
  Image,
  Animated,
} from 'react-native';

import { Colors } from '../constants/colors';
import { Spacing, FontSizes, BorderRadius } from '../constants/spacing';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { FloatingActionButton } from '../components';
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
  const [showAllMembers, setShowAllMembers] = useState(false);
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
            (ge: any) => ge.user?.id === backendUser.id,
          );
          setHasJoined(userJoined);
        }
      } else {
        Alert.alert(
          'Error',
          response.message || 'Failed to load event details',
        );
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
        const errorMessage =
          response.message || response.error || 'Failed to join event';
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
            ],
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

    Alert.alert('Leave Event', 'Are you sure you want to leave this event?', [
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
    ]);
  };

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'about', label: 'About' },
    { key: 'schedule', label: 'Schedule' },
    { key: 'activity', label: 'Activity' },
    { key: 'members', label: 'Members' },
  ];

  // Animation values for scroll effect
  const scrollY = useRef(new Animated.Value(0)).current;
  const HEADER_MAX_HEIGHT = 300;
  const HEADER_MIN_HEIGHT = 0;
  const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

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
              <View style={styles.iconCircle}>
                {/* Use icon color instead of backgroundColor to avoid inline styles */}
                <FontAwesome6
                  name="circle"
                  size={18}
                  color={item.color || Colors.primary}
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
              <View style={styles.avatar}>
                <Text style={styles.activityInitial}>
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
    const galleryImages = eventData?.galleryImages || [];

    return (
      <>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.aboutCard}>
          <Text style={styles.aboutText}>{description}</Text>
        </View>

        {/* Event Gallery */}
        {galleryImages.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Event Gallery</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.galleryContainer}
              style={styles.galleryScrollView}
            >
              {galleryImages.map((imageUri: string, index: number) => (
                <View key={index} style={styles.galleryImageWrapper}>
                  <Image
                    source={{ uri: imageUri }}
                    style={styles.galleryImage}
                    resizeMode="cover"
                  />
                </View>
              ))}
            </ScrollView>
          </>
        )}
      </>
    );
  };

  const renderMembersSection = () => {
    const guests = eventData?.guestEvents || [];
    const totalCount = guests.length;
    const displayGuests = showAllMembers ? guests : guests.slice(0, 10);

    return (
      <>
        <Text style={styles.sectionTitle}>Members ({totalCount})</Text>
        <View style={styles.card}>
          {displayGuests.map((guest: any, i: number) => {
            const isLast = i === displayGuests.length - 1;
            return (
              <View
                key={guest.id || i}
                style={[
                  styles.memberRow,
                  !isLast && styles.memberRowBorder, // only add border for in-between members
                ]}
              >
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberInitial}>
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
            );
          })}
          {totalCount > 10 && !showAllMembers && (
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => setShowAllMembers(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.viewAllText}>
                View All {totalCount} Members
              </Text>
            </TouchableOpacity>
          )}
          {showAllMembers && totalCount > 10 && (
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => setShowAllMembers(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.viewAllText}>Show Less</Text>
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
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  if (!eventData) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.emptyText}>Event not found</Text>
        </View>
      </View>
    );
  }

  const displayTitle = eventData.name || event.title;
  const displayDate = eventData.startDate
    ? dayjs(eventData.startDate).format('MMM D, YYYY')
    : event.date;
  const displayLocation = eventData.location || event.location;
  const coverImage = eventData?.coverImage || event?.coverImage;

  // Animated header height
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  // Animated image opacity
  const imageOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      {/* Cover Image with Parallax Effect */}
      <Animated.View
        style={[
          styles.headerImageContainer,
          {
            height: headerHeight,
            opacity: imageOpacity,
          },
        ]}
      >
        <Image
          source={{
            uri:
              coverImage ||
              'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
          }}
          style={styles.coverImage}
          resizeMode="cover"
        />
        {/* Gradient overlay for better text readability */}
        <View style={styles.imageOverlay} />
      </Animated.View>

      {/* Floating Header Buttons */}
      <View style={styles.floatingHeader}>
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
          <TouchableOpacity style={styles.headerButton} onPress={handleSave}>
            <FontAwesome6
              name="bookmark"
              size={18}
              color={isSaved ? Colors.primary : Colors.text}
              iconStyle={isSaved ? 'solid' : 'regular'}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
            <FontAwesome6
              name="share-nodes"
              size={18}
              color={Colors.text}
              iconStyle="solid"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable Content */}
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
      >
        {/* Content Block with Rounded Top Corners */}
        <View style={styles.contentBlock}>
          {/* Event Title */}
          <Text style={styles.title}>{displayTitle}</Text>

          {/* Date and Location */}
          <View style={styles.subInfoRow}>
            <FontAwesome6
              name="calendar"
              size={14}
              color={Colors.textSecondary}
              iconStyle="regular"
            />
            <Text style={styles.subInfoText}>
              {displayDate} • {displayLocation}
            </Text>
          </View>

          {/* Navigation Tabs */}
          <View style={styles.tabsRow}>
            {tabs.map(tab => (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                onPress={() => {
                  setActiveTab(tab.key);
                  // Reset showAllMembers when switching tabs
                  if (tab.key !== 'members') {
                    setShowAllMembers(false);
                  }
                }}
                activeOpacity={0.7}
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

          {/* Bottom spacing for floating button */}
          <View style={styles.bottomSpacer} />
        </View>
      </Animated.ScrollView>

      {/* Floating Action Button - Create Announcement for Admin, Join/Leave for Guests */}
      {eventData && backendUser && eventData.adminId === backendUser.id ? (
        <FloatingActionButton
          title="Create Announcement"
          onPress={() => {
            navigation.navigate('CreateAnnouncement', {
              eventId: eventData.id,
            });
          }}
          icon={
            <FontAwesome6
              name="bullhorn"
              size={18}
              color={Colors.white}
              iconStyle="solid"
            />
          }
        />
      ) : (
        <FloatingActionButton
          title={
            isJoining
              ? hasJoined
                ? 'Leaving...'
                : 'Joining...'
              : hasJoined
              ? 'Leave Event'
              : 'Join Event'
          }
          onPress={handleJoinEvent}
          disabled={isJoining}
          icon={
            isJoining ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : undefined
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Cover Image */
  headerImageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    zIndex: 0,
  },

  coverImage: {
    width: '100%',
    height: '100%',
  },

  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },

  /* Floating Header Buttons */
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    zIndex: 10,
  },

  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },

  /* Scrollable Content */
  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingTop: 200, // Start content block overlaying image (HEADER_MAX_HEIGHT - 100)
  },

  /* Content Block */
  contentBlock: {
    backgroundColor: Colors.backgroundLight,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },

  title: {
    fontSize: FontSizes.xxl,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.md,
  },

  subInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },

  subInfoText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
  },

  /* Tabs */
  tabsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },

  tab: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: '#EDEDED',
    borderRadius: BorderRadius.full,
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

  /* About Card - Special styling */
  aboutCard: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },

  /* Gallery */
  galleryScrollView: {
    marginBottom: Spacing.xl,
  },

  galleryContainer: {
    paddingRight: Spacing.lg,
    gap: Spacing.md,
  },

  galleryImageWrapper: {
    width: 280,
    height: 200,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.backgroundLight,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  galleryImage: {
    width: '100%',
    height: '100%',
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
    backgroundColor: Colors.primaryLight + '30', // static background
    justifyContent: 'center',
    alignItems: 'center',
  },

  activityInitial: {
    color: Colors.primary,
    fontWeight: '600',
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
  },

  memberRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },

  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },

  memberInitial: {
    color: Colors.primary,
    fontWeight: '600',
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

  bottomSpacer: {
    height: 100,
  },
});
