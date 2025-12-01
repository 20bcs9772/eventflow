import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Share,
  Alert,
} from 'react-native';

import { Colors } from '../constants/colors';
import { Spacing, FontSizes, BorderRadius } from '../constants/spacing';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { ScreenLayout } from '../components';

type EventDetailsRouteProp = RouteProp<RootStackParamList, 'EventDetails'>;

type TabKey = 'schedule' | 'activity' | 'about' | 'members';

export const EventDetailsScreen = () => {
  const [openFAQ, setOpenFAQ] = useState('');
  const [activeTab, setActiveTab] = useState<TabKey>('schedule');
  const [isSaved, setIsSaved] = useState(false);
  const route = useRoute<EventDetailsRouteProp>();
  const navigation = useNavigation();
  const { event } = route.params;

  const toggleFAQ = (key: string) => {
    setOpenFAQ(prev => (prev === key ? '' : key));
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    Alert.alert(
      isSaved ? 'Removed from saved' : 'Saved!',
      isSaved ? 'Event removed from your saved list.' : 'Event saved to your list.',
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this event: ${event.title} on ${event.date} at ${event.location}`,
        title: event.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'schedule', label: 'Schedule' },
    { key: 'activity', label: 'Activity' },
    { key: 'about', label: 'About' },
    { key: 'members', label: 'Members' },
  ];

  const renderScheduleSection = () => (
    <>
      <Text style={styles.sectionTitle}>Schedule</Text>
      <View style={styles.card}>
        {scheduleItems.map((item, index) => (
          <View key={index} style={styles.scheduleItem}>
            <View style={[styles.iconCircle, { backgroundColor: item.color }]}>
              <FontAwesome6
                name={item.icon}
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
                {item.time} • {item.location}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </>
  );

  const renderActivitySection = () => (
    <>
      <Text style={styles.sectionTitle}>Activity</Text>
      {activityFeed.map((item, idx) => (
        <View key={idx} style={styles.card}>
          <View style={styles.activityRow}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View>
              <Text style={styles.activityName}>{item.name}</Text>
              <Text style={styles.activityRole}>
                Organizer • {item.timeAgo}
              </Text>
            </View>
          </View>
          <Text style={styles.activityMessage}>{item.message}</Text>
        </View>
      ))}
    </>
  );

  const renderAboutSection = () => (
    <>
      <Text style={styles.sectionTitle}>About</Text>
      <View style={styles.card}>
        <Text style={styles.aboutText}>
          Join us in celebrating the union of Alex and Jordan! This will be an
          unforgettable evening filled with love, laughter, and wonderful
          memories. We can't wait to share this special day with you.
        </Text>

        <TouchableOpacity
          style={styles.faqRow}
          onPress={() => toggleFAQ('dress')}
        >
          <Text style={styles.faqQuestion}>What is the dress code?</Text>
          <FontAwesome6
            name={openFAQ === 'dress' ? 'chevron-up' : 'chevron-down'}
            size={14}
            iconStyle="solid"
            color={Colors.textSecondary}
          />
        </TouchableOpacity>
        {openFAQ === 'dress' && (
          <Text style={styles.faqAnswer}>Formal / Black Tie Optional.</Text>
        )}

        <TouchableOpacity
          style={styles.faqRow}
          onPress={() => toggleFAQ('parking')}
        >
          <Text style={styles.faqQuestion}>Is there parking available?</Text>
          <FontAwesome6
            name={openFAQ === 'parking' ? 'chevron-up' : 'chevron-down'}
            size={14}
            iconStyle="solid"
            color={Colors.textSecondary}
          />
        </TouchableOpacity>
        {openFAQ === 'parking' && (
          <Text style={styles.faqAnswer}>
            Yes, valet parking is available at the venue.
          </Text>
        )}

        <TouchableOpacity
          style={styles.faqRow}
          onPress={() => toggleFAQ('gifts')}
        >
          <Text style={styles.faqQuestion}>Where is the gift registry?</Text>
          <FontAwesome6
            name={openFAQ === 'gifts' ? 'chevron-up' : 'chevron-down'}
            size={14}
            iconStyle="solid"
            color={Colors.textSecondary}
          />
        </TouchableOpacity>
        {openFAQ === 'gifts' && (
          <Text style={styles.faqAnswer}>
            Please visit our website for registry details.
          </Text>
        )}
      </View>
    </>
  );

  const renderMembersSection = () => (
    <>
      <Text style={styles.sectionTitle}>Members ({membersList.length + 61})</Text>
      <View style={styles.card}>
        {membersList.map((m, i) => (
          <View key={i} style={styles.memberRow}>
            <Image source={{ uri: m.avatar }} style={styles.memberAvatar} />
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>{m.name}</Text>
              <Text style={styles.memberRole}>{m.role}</Text>
            </View>
          </View>
        ))}
        <TouchableOpacity style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View All Members</Text>
        </TouchableOpacity>
      </View>
    </>
  );

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
          <Text style={styles.title}>{event.title}</Text>

          {/* Sub Info */}
          <View style={styles.subInfoRow}>
            <FontAwesome6
              name="calendar"
              size={14}
              color={Colors.textSecondary}
            />
            <Text style={styles.subInfoText}>
              {event.date} • {event.location}
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

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* FLOATING JOIN BUTTON */}
        <TouchableOpacity style={styles.joinButton}>
          <Text style={styles.joinButtonText}>Join Event</Text>
        </TouchableOpacity>
      </View>
    </ScreenLayout>
  );
};

/* --------------------------
      MOCK DATA
-------------------------- */

const scheduleItems = [
  {
    title: 'Ceremony',
    time: '4:00 PM',
    location: 'The Grand Hall',
    icon: 'heart',
    color: '#EEE6FF',
  },
  {
    title: 'Cocktail Hour',
    time: '5:00 PM',
    location: 'Garden Terrace',
    icon: 'martini-glass-citrus',
    color: '#EAF7FF',
  },
  {
    title: 'Dinner',
    time: '6:30 PM',
    location: 'The Grand Hall',
    icon: 'utensils',
    color: '#FFF3D9',
  },
  {
    title: 'First Dance',
    time: '8:00 PM',
    location: 'The Grand Hall',
    icon: 'music',
    color: '#F3E8FF',
  },
];

const activityFeed = [
  {
    name: 'Alex Johnson',
    avatar: 'https://i.pravatar.cc/300?img=1',
    timeAgo: '2h ago',
    message: "Welcome everyone! We're so excited to celebrate with you all! 🎉",
  },
  {
    name: 'Jordan Smith',
    avatar: 'https://i.pravatar.cc/300?img=2',
    timeAgo: '30m ago',
    message: 'Reminder: The photo booth is now open in the garden area! 📸',
  },
];

const membersList = [
  { name: 'Sarah Miller', avatar: 'https://i.pravatar.cc/100?img=12', role: 'Guest' },
  { name: 'David Chen', avatar: 'https://i.pravatar.cc/100?img=32', role: 'Best Man' },
  { name: 'Emily Rodriguez', avatar: 'https://i.pravatar.cc/100?img=48', role: 'Bridesmaid' },
];

/* --------------------------
         STYLES
-------------------------- */
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
    left: 21,
    top: 48,
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

  /* Floating Button */
  joinButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: Colors.primary,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },

  joinButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
});
