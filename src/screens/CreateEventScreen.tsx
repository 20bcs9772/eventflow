import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import {
  ScreenLayout,
  DateTimePickerModal,
  FloatingActionButton,
  ScreenHeader,
} from '../components';
import { Colors } from '../constants/colors';
import { Spacing, FontSizes, BorderRadius } from '../constants/spacing';
import { eventService } from '../services';
import dayjs from 'dayjs';

interface ScheduleBlock {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  icon: string;
}

interface Collaborator {
  id: string;
  avatar: string;
}

export const CreateEventScreen = () => {
  const navigation = useNavigation<any>();
  const [eventTitle, setEventTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateTime, setDateTime] = useState<{
    startDate?: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
    timeZone?: string;
  }>({});
  const [venue, setVenue] = useState<{
    name?: string;
    fullAddress?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  } | null>(null);
  const [showDateTimeModal, setShowDateTimeModal] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    { id: '1', avatar: 'https://i.pravatar.cc/100?img=1' },
    { id: '2', avatar: 'https://i.pravatar.cc/100?img=2' },
    { id: '3', avatar: 'https://i.pravatar.cc/100?img=3' },
  ]);
  const [scheduleBlocks, setScheduleBlocks] = useState<ScheduleBlock[]>([]);
  const [eventType, setEventType] = useState<
    'WEDDING' | 'BIRTHDAY' | 'CORPORATE' | 'COLLEGE_FEST' | 'OTHER'
  >('OTHER');
  const [visibility, setVisibility] = useState<
    'PUBLIC' | 'UNLISTED' | 'PRIVATE'
  >('PUBLIC');
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const visibilitySliderAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const position =
      visibility === 'PUBLIC' ? 0 : visibility === 'UNLISTED' ? 1 : 2;
    Animated.spring(visibilitySliderAnim, {
      toValue: position,
      useNativeDriver: false,
      tension: 50,
      friction: 8,
    }).start();
  }, [visibility, visibilitySliderAnim]);

  const eventTypeOptions = useMemo(
    () => [
      { label: 'Wedding', value: 'WEDDING' as const },
      { label: 'Birthday', value: 'BIRTHDAY' as const },
      { label: 'Corporate', value: 'CORPORATE' as const },
      { label: 'College Fest', value: 'COLLEGE_FEST' as const },
      { label: 'Other', value: 'OTHER' as const },
    ],
    [],
  );

  const handleAddScheduleBlock = () => {
    navigation.navigate('AddScheduleBlock', {
      onSave: (block: any) => {
        const newBlock: ScheduleBlock = {
          id: block.id || Date.now().toString(),
          title: block.title,
          description: block.description,
          startTime: block.startTime,
          endTime: block.endTime,
          location: block.location,
          icon: 'calendar-check',
        };
        setScheduleBlocks([...scheduleBlocks, newBlock]);
      },
    });
  };

  const handleEditScheduleBlock = (block: ScheduleBlock) => {
    navigation.navigate('AddScheduleBlock', {
      onSave: (updatedBlock: any) => {
        const editedBlock: ScheduleBlock = {
          id: block.id,
          title: updatedBlock.title,
          description: updatedBlock.description,
          startTime: updatedBlock.startTime,
          endTime: updatedBlock.endTime,
          location: updatedBlock.location,
          icon: block.icon,
        };
        setScheduleBlocks(
          scheduleBlocks.map(b => (b.id === block.id ? editedBlock : b)),
        );
      },
      initialBlock: {
        id: block.id,
        title: block.title,
        description: block.description || '',
        startTime: block.startTime,
        endTime: block.endTime,
        location: block.location || '',
      },
    });
  };

  const handleDateTimeConfirm = (selectedDateTime: {
    startDate?: string;
    endDate?: string;
    startTime: string;
    endTime: string;
    timeZone: string;
  }) => {
    setDateTime(selectedDateTime);
    setShowDateTimeModal(false);
  };

  const formatDateTimeDisplay = () => {
    if (!dateTime.startDate) return 'Set start and end dates';

    const startDate = dayjs(dateTime.startDate).format('MMM D, YYYY');
    const endDate = dateTime.endDate
      ? ` - ${dayjs(dateTime.endDate).format('MMM D, YYYY')}`
      : '';

    const time =
      dateTime.startTime && dateTime.endTime
        ? `${dateTime.startTime} - ${dateTime.endTime}`
        : dateTime.startTime
        ? dateTime.startTime
        : '';

    // If time exists, show on new line
    return time ? `${startDate}${endDate}\n${time}` : `${startDate}${endDate}`;
  };

  const [isPublishing, setIsPublishing] = useState(false);

  const parseTimeToISO = (dateStr: string, timeStr: string): string => {
    // Parse time string like "9:00 AM" and combine with date
    const date = dayjs(dateStr);
    const timeMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);

    if (!timeMatch) {
      return date.toISOString();
    }

    let hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    const period = timeMatch[3].toUpperCase();

    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }

    return date
      .hour(hours)
      .minute(minutes)
      .second(0)
      .millisecond(0)
      .toISOString();
  };

  const handlePublish = async () => {
    if (!eventTitle || !dateTime.startDate) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    setIsPublishing(true);

    try {
      // Prepare schedule items
      const scheduleItems = scheduleBlocks.map((block, index) => {
        // Combine event start date with schedule block times
        const startDateTime = parseTimeToISO(
          dateTime.startDate!,
          block.startTime,
        );
        const endDateTime = parseTimeToISO(dateTime.startDate!, block.endTime);

        return {
          title: block.title,
          description: block.description || undefined,
          startTime: startDateTime,
          endTime: endDateTime,
          location: block.location || undefined,
          orderIndex: index,
        };
      });

      // Prepare event data
      const eventData: any = {
        name: eventTitle,
        description: description || undefined,
        startDate: dayjs(dateTime.startDate).toISOString(),
        endDate: dateTime.endDate
          ? dayjs(dateTime.endDate).toISOString()
          : dayjs(dateTime.startDate).add(1, 'day').toISOString(),
        visibility,
        type: eventType,
      };

      // Add time strings if provided
      if (dateTime.startTime) {
        eventData.startTime = dateTime.startTime;
      }
      if (dateTime.endTime) {
        eventData.endTime = dateTime.endTime;
      }
      if (dateTime.timeZone) {
        eventData.timeZone = dateTime.timeZone;
      }

      // Add location/venue
      if (venue) {
        if (venue.fullAddress) {
          eventData.location = venue.fullAddress;
        } else if (venue.name) {
          eventData.location = venue.name;
        }
        eventData.venue = venue;
      }

      // Add schedule items
      if (scheduleItems.length > 0) {
        eventData.scheduleItems = scheduleItems;
      }

      const response = await eventService.createEvent(eventData);

      if (response.success) {
        Alert.alert('Success', 'Event created successfully!', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        // Handle validation errors
        const errorMessage =
          response.message || response.error || 'Failed to create event';

        console.error('Event creation failed:', errorMessage, response);
        Alert.alert('Error', errorMessage);
      }
    } catch (error: any) {
      console.error('Error creating event:', error);
      const errorMessage =
        error.message ||
        error.toString() ||
        'Failed to create event. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <>
      <ScreenLayout backgroundColor={Colors.backgroundLight}>
        <ScreenHeader title="Create Event" backIcon="arrow-left" />
        <View style={styles.divider} />
        <View style={styles.container}>
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

            {/* Event Type & Visibility */}
            <View style={styles.section}>
              <Text style={styles.label}>Event Type</Text>
              <View style={styles.dropdownContainer}>
                <TouchableOpacity
                  style={styles.dropdownHeader}
                  onPress={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.dropdownHeaderText}>
                    {eventTypeOptions.find(opt => opt.value === eventType)
                      ?.label || 'Select type'}
                  </Text>
                  <FontAwesome6
                    name={isTypeDropdownOpen ? 'chevron-up' : 'chevron-down'}
                    size={14}
                    color={Colors.textSecondary}
                    iconStyle="solid"
                  />
                </TouchableOpacity>
                {isTypeDropdownOpen && (
                  <View style={styles.dropdownList}>
                    {eventTypeOptions.map(option => (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.dropdownItem,
                          option.value === eventType &&
                            styles.dropdownItemSelected,
                        ]}
                        onPress={() => {
                          setEventType(option.value);
                          setIsTypeDropdownOpen(false);
                        }}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.dropdownItemText,
                            option.value === eventType &&
                              styles.dropdownItemTextSelected,
                          ]}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Visibility</Text>
              <View style={styles.visibilityContainer}>
                <View style={styles.visibilityPill}>
                  {(['PUBLIC', 'UNLISTED', 'PRIVATE'] as const).map(option => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.visibilityOption,
                        visibility === option && styles.visibilityOptionActive,
                      ]}
                      onPress={() => setVisibility(option)}
                      activeOpacity={0.85}
                    >
                      <Text
                        style={[
                          styles.visibilityText,
                          visibility === option && styles.visibilityTextActive,
                        ]}
                      >
                        {option === 'PUBLIC'
                          ? 'Public'
                          : option === 'UNLISTED'
                          ? 'Unlisted'
                          : 'Private'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  <Animated.View
                    style={[
                      styles.visibilitySlider,
                      {
                        left: visibilitySliderAnim.interpolate({
                          inputRange: [0, 1, 2],
                          outputRange: ['0%', '33.33%', '66.66%'],
                        }),
                      },
                    ]}
                  />
                </View>
              </View>
            </View>

            {/* Date & Time */}
            <TouchableOpacity
              style={styles.infoRow}
              onPress={() => setShowDateTimeModal(true)}
              activeOpacity={0.7}
            >
              <View style={styles.infoIconCircle}>
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
                  {formatDateTimeDisplay()}
                </Text>
              </View>
              <FontAwesome6
                name="chevron-right"
                size={14}
                color={Colors.textLight}
                iconStyle="solid"
              />
            </TouchableOpacity>

            {/* Venue */}
            <TouchableOpacity
              style={styles.infoRow}
              onPress={() => {
                navigation.navigate('AddVenue', {
                  onSave: (savedVenue: any) => {
                    setVenue(savedVenue);
                  },
                  initialVenue: venue,
                });
              }}
            >
              <View style={styles.infoIconCircle}>
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
                  {venue?.fullAddress || venue?.name || 'Add event location'}
                </Text>
              </View>
              <FontAwesome6
                name="chevron-right"
                size={14}
                color={Colors.textLight}
                iconStyle="solid"
              />
            </TouchableOpacity>

            {/* Invite People */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Invite People</Text>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('InvitePeople', {
                      onSave: (people: any[]) => {
                        setCollaborators(
                          people.map(p => ({
                            id: p.id,
                            avatar:
                              p.avatar || 'https://i.pravatar.cc/100?img=1',
                          })),
                        );
                      },
                      initialPeople: collaborators.map(c => ({
                        id: c.id,
                        avatar: c.avatar,
                      })),
                    });
                  }}
                  style={styles.addButtonLink}
                >
                  <FontAwesome6
                    name="plus"
                    size={14}
                    color={Colors.primary}
                    iconStyle="solid"
                  />
                  <Text style={styles.addLink}>Add</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.cardDescription}>
                Add co-hosts or volunteers to help you manage the event.
              </Text>
              {collaborators.length > 0 && (
                <View style={styles.collaboratorsRow}>
                  <View style={styles.avatarStack}>
                    {collaborators.slice(0, 5).map((collab, index) => (
                      <Image
                        key={collab.id}
                        source={{ uri: collab.avatar }}
                        style={[
                          styles.stackedAvatar,
                          { marginLeft: index > 0 ? -8 : 0, zIndex: 5 - index },
                        ]}
                      />
                    ))}
                    {collaborators.length > 5 && (
                      <View style={[styles.stackedAvatar, styles.avatarMore]}>
                        <Text style={styles.avatarMoreText}>
                          +{collaborators.length - 5}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
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

              {scheduleBlocks.map(block => (
                <View key={block.id} style={styles.scheduleCard}>
                  <View style={styles.scheduleIconContainer}>
                    <FontAwesome6
                      name={block.icon as any}
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
                  <TouchableOpacity
                    style={styles.dragHandle}
                    onPress={() => handleEditScheduleBlock(block)}
                    activeOpacity={0.7}
                  >
                    <FontAwesome6
                      name="pen"
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
          <FloatingActionButton
            title={isPublishing ? 'Publishing...' : 'Publish Event'}
            onPress={handlePublish}
            disabled={!eventTitle || !dateTime.startDate || isPublishing}
            icon={
              isPublishing ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : undefined
            }
          />
        </View>
      </ScreenLayout>

      {/* Date & Time Picker Modal - Render outside ScreenLayout */}
      <DateTimePickerModal
        visible={showDateTimeModal}
        onClose={() => setShowDateTimeModal(false)}
        onConfirm={handleDateTimeConfirm}
        initialDateTime={dateTime}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  dropdownContainer: {
    marginTop: Spacing.xs,
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 0,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: '#F9FAFB',
  },
  dropdownHeaderText: {
    fontSize: FontSizes.md,
    color: Colors.text,
  },
  dropdownList: {
    marginTop: Spacing.xs,
    borderWidth: 0,
    borderRadius: 12,
    backgroundColor: Colors.white,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dropdownItem: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  dropdownItemSelected: {
    backgroundColor: Colors.primary + '22',
  },
  dropdownItemText: {
    fontSize: FontSizes.md,
    color: Colors.text,
  },
  dropdownItemTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  visibilityContainer: {
    marginTop: Spacing.sm,
  },
  visibilityPill: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    position: 'relative',
  },
  visibilitySlider: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    width: '33.33%',
    backgroundColor: Colors.primary,
    borderRadius: 10,
    zIndex: 0,
  },
  visibilityOption: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  visibilityOptionActive: {
    // Active state handled by slider
  },
  visibilityText: {
    fontSize: FontSizes.sm,
    color: '#6B7280',
    fontWeight: '500',
  },
  visibilityTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },
  section: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSizes.sm,
    color: '#1F2937',
    marginBottom: Spacing.sm,
    fontWeight: '600',
  },
  inputContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 0,
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
  infoIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(107, 70, 193, 0.1)',
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
  addButtonLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  avatarMore: {
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarMoreText: {
    fontSize: FontSizes.xs,
    color: Colors.white,
    fontWeight: '600',
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
});
