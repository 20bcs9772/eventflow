import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { ScreenLayout } from '../components';
import { Colors } from '../constants/colors';
import { Spacing, FontSizes, BorderRadius } from '../constants/spacing';

interface ScheduleBlock {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  icon: string;
}

interface Collaborator {
  id: string;
  avatar: string;
}

export const CreateEventScreen = () => {
  const navigation = useNavigation();
  const [eventTitle, setEventTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateTime, setDateTime] = useState<{ start?: string; end?: string }>({});
  const [venue, setVenue] = useState('');
  const [collaborators] = useState<Collaborator[]>([
    { id: '1', avatar: 'https://i.pravatar.cc/100?img=1' },
    { id: '2', avatar: 'https://i.pravatar.cc/100?img=2' },
    { id: '3', avatar: 'https://i.pravatar.cc/100?img=3' },
  ]);
  const [scheduleBlocks, setScheduleBlocks] = useState<ScheduleBlock[]>([
    {
      id: '1',
      title: 'Check-in & Welcome',
      startTime: '9:00 AM',
      endTime: '9:30 AM',
      icon: 'clipboard-list',
    },
    {
      id: '2',
      title: 'Opening Keynote',
      startTime: '9:30 AM',
      endTime: '10:30 AM',
      icon: 'bullhorn',
    },
  ]);

  const handleAddScheduleBlock = () => {
    const newBlock: ScheduleBlock = {
      id: Date.now().toString(),
      title: 'New Session',
      startTime: '10:30 AM',
      endTime: '11:30 AM',
      icon: 'calendar-check',
    };
    setScheduleBlocks([...scheduleBlocks, newBlock]);
  };

  const handlePublish = () => {
    // Handle publish logic
    console.log('Publishing event:', {
      eventTitle,
      description,
      dateTime,
      venue,
      collaborators: collaborators.length,
      scheduleBlocks,
    });
    navigation.goBack();
  };

  return (
    <ScreenLayout backgroundColor={Colors.backgroundLight}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
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
          <Text style={styles.headerTitle}>Create Event</Text>
          <TouchableOpacity style={styles.headerButton}>
            <FontAwesome6
              name="ellipsis"
              size={18}
              color={Colors.text}
              iconStyle="solid"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Event Title */}
          <View style={styles.section}>
            <Text style={styles.label}>Event Title</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="e.g., Annual Tech Summit"
                placeholderTextColor={Colors.textLight}
                value={eventTitle}
                onChangeText={setEventTitle}
              />
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.label}>Description</Text>
            <View style={[styles.inputContainer, styles.textAreaContainer]}>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Tell us more about your event..."
                placeholderTextColor={Colors.textLight}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Date & Time */}
          <TouchableOpacity style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <FontAwesome6
                name="calendar"
                size={18}
                color={Colors.primary}
                iconStyle="regular"
              />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Date & Time</Text>
              <Text style={styles.infoSubtitle}>
                {dateTime.start || 'Set start and end dates'}
              </Text>
            </View>
            <FontAwesome6
              name="pen"
              size={16}
              color={Colors.textSecondary}
              iconStyle="solid"
            />
          </TouchableOpacity>

          {/* Venue */}
          <TouchableOpacity style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <FontAwesome6
                name="location-dot"
                size={18}
                color={Colors.primary}
                iconStyle="solid"
              />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Venue</Text>
              <Text style={styles.infoSubtitle}>
                {venue || 'Add event location'}
              </Text>
            </View>
            <FontAwesome6
              name="pen"
              size={16}
              color={Colors.textSecondary}
              iconStyle="solid"
            />
          </TouchableOpacity>

          {/* Invite People */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Invite People</Text>
              <TouchableOpacity>
                <Text style={styles.addLink}>Add</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.cardDescription}>
              Add co-hosts or volunteers to help you manage the event.
            </Text>
            <View style={styles.collaboratorsRow}>
              <View style={styles.avatarStack}>
                {collaborators.slice(0, 3).map((collab, index) => (
                  <Image
                    key={collab.id}
                    source={{ uri: collab.avatar }}
                    style={[
                      styles.stackedAvatar,
                      { marginLeft: index > 0 ? -12 : 0, zIndex: 3 - index },
                    ]}
                  />
                ))}
              </View>
              <Text style={styles.collaboratorCount}>
                {collaborators.length} collaborators invited
              </Text>
            </View>
          </View>

          {/* Schedule */}
          <View style={styles.scheduleSection}>
            <View style={styles.scheduleSectionHeader}>
              <Text style={styles.scheduleSectionTitle}>Schedule</Text>
              <TouchableOpacity
                style={styles.addBlockButton}
                onPress={handleAddScheduleBlock}
              >
                <FontAwesome6
                  name="circle-plus"
                  size={16}
                  color={Colors.white}
                  iconStyle="solid"
                />
                <Text style={styles.addBlockText}>Add Block</Text>
              </TouchableOpacity>
            </View>

            {scheduleBlocks.map((block) => (
              <View key={block.id} style={styles.scheduleCard}>
                <View style={styles.scheduleIconContainer}>
                  <FontAwesome6
                    name={block.icon}
                    size={18}
                    color={Colors.primary}
                    iconStyle="solid"
                  />
                </View>
                <View style={styles.scheduleContent}>
                  <Text style={styles.scheduleTitle}>{block.title}</Text>
                  <Text style={styles.scheduleTime}>
                    {block.startTime} - {block.endTime}
                  </Text>
                </View>
                <TouchableOpacity style={styles.dragHandle}>
                  <FontAwesome6
                    name="grip-lines"
                    size={16}
                    color={Colors.textLight}
                    iconStyle="solid"
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Publish Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.publishButton} onPress={handlePublish}>
            <Text style={styles.publishButtonText}>Publish Event</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    fontSize: FontSizes.md,
    color: Colors.text,
    padding: Spacing.md,
  },
  textAreaContainer: {
    minHeight: 120,
  },
  textArea: {
    height: 100,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    marginBottom: Spacing.sm,
  },
  infoIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  infoSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginVertical: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  cardTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.text,
  },
  addLink: {
    fontSize: FontSizes.md,
    color: Colors.primary,
    fontWeight: '600',
  },
  cardDescription: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  collaboratorsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarStack: {
    flexDirection: 'row',
    marginRight: Spacing.sm,
  },
  stackedAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  collaboratorCount: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  scheduleSection: {
    marginTop: Spacing.md,
  },
  scheduleSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  scheduleSectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  addBlockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    gap: 6,
  },
  addBlockText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.white,
  },
  scheduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  scheduleIconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  scheduleContent: {
    flex: 1,
  },
  scheduleTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  scheduleTime: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  dragHandle: {
    padding: Spacing.sm,
  },
  footer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  publishButton: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  publishButtonText: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.white,
  },
});

