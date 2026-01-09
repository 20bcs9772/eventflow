import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { ScreenLayout, FloatingActionButton, ScreenHeader } from '../components';
import { Colors } from '../constants/colors';
import { Spacing, FontSizes, BorderRadius } from '../constants/spacing';
import { RootStackParamList } from '../types';

interface ScheduleBlock {
  id?: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
}

type AddScheduleBlockRouteProp = RouteProp<RootStackParamList, 'AddScheduleBlock'>;

export const AddScheduleBlockScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<AddScheduleBlockRouteProp>();
  const { onSave, initialBlock } = route.params || {};

  const [title, setTitle] = useState(initialBlock?.title || '');
  const [description, setDescription] = useState(initialBlock?.description || '');
  const [startHour, setStartHour] = useState('09');
  const [startMinute, setStartMinute] = useState('00');
  const [startPeriod, setStartPeriod] = useState<'AM' | 'PM'>('AM');
  const [endHour, setEndHour] = useState('10');
  const [endMinute, setEndMinute] = useState('30');
  const [endPeriod, setEndPeriod] = useState<'AM' | 'PM'>('AM');
  const [location, setLocation] = useState(initialBlock?.location || '');
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  // Parse initial times
  React.useEffect(() => {
    if (initialBlock?.startTime) {
      const startMatch = initialBlock.startTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (startMatch) {
        setStartHour(startMatch[1].padStart(2, '0'));
        setStartMinute(startMatch[2]);
        setStartPeriod(startMatch[3].toUpperCase() as 'AM' | 'PM');
      }
    }
    if (initialBlock?.endTime) {
      const endMatch = initialBlock.endTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (endMatch) {
        setEndHour(endMatch[1].padStart(2, '0'));
        setEndMinute(endMatch[2]);
        setEndPeriod(endMatch[3].toUpperCase() as 'AM' | 'PM');
      }
    }
  }, [initialBlock]);

  const formatTime = (hour: string, minute: string, period: 'AM' | 'PM') => {
    const h = parseInt(hour, 10);
    const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${displayHour}:${minute} ${period}`;
  };

  const startTime = formatTime(startHour, startMinute, startPeriod);
  const endTime = formatTime(endHour, endMinute, endPeriod);

  const handleSave = () => {
    const block: ScheduleBlock = {
      id: initialBlock?.id || Date.now().toString(),
      title,
      description,
      startTime,
      endTime,
      location,
    };

    if (onSave) {
      onSave(block);
    }
    navigation.goBack();
  };

  const isEditing = !!initialBlock?.id;
  const screenTitle = isEditing ? 'Edit Schedule Block' : 'Add Schedule Block';
  const buttonTitle = isEditing ? 'Update Block' : 'Save Block';

  return (
    <ScreenLayout backgroundColor={Colors.backgroundLight}>
      <ScreenHeader
        title={screenTitle}
        backIcon="arrow-left"
      />
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <View style={styles.section}>
            <Text style={styles.label}>Title</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="e.g., Opening Keynote"
                placeholderTextColor={Colors.textLight}
                value={title}
                onChangeText={setTitle}
              />
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.label}>Description</Text>
            <View style={[styles.inputContainer, styles.textAreaContainer]}>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Add a short description for this block..."
                placeholderTextColor={Colors.textLight}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          <View style={{ height: Spacing.md }} />

          {/* Start Time and End Time */}
          <View style={styles.timeRow}>
            <View style={styles.timeSection}>
              <Text style={styles.label}>Start Time</Text>
              <TouchableOpacity
                style={styles.timeInputContainer}
                onPress={() => setShowStartTimePicker(true)}
              >
                <FontAwesome6
                  name="clock"
                  size={16}
                  color={Colors.textSecondary}
                  iconStyle="regular"
                />
                <Text style={styles.timeText}>{startTime}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.timeSection}>
              <Text style={styles.label}>End Time</Text>
              <TouchableOpacity
                style={styles.timeInputContainer}
                onPress={() => setShowEndTimePicker(true)}
              >
                <FontAwesome6
                  name="clock"
                  size={16}
                  color={Colors.textSecondary}
                  iconStyle="regular"
                />
                <Text style={styles.timeText}>{endTime}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Time Picker Modals */}
          {showStartTimePicker && (
            <TimePickerModal
              visible={showStartTimePicker}
              hour={startHour}
              minute={startMinute}
              period={startPeriod}
              onClose={() => setShowStartTimePicker(false)}
              onConfirm={(h, m, p) => {
                setStartHour(h);
                setStartMinute(m);
                setStartPeriod(p);
                setShowStartTimePicker(false);
              }}
            />
          )}

          {showEndTimePicker && (
            <TimePickerModal
              visible={showEndTimePicker}
              hour={endHour}
              minute={endMinute}
              period={endPeriod}
              onClose={() => setShowEndTimePicker(false)}
              onConfirm={(h, m, p) => {
                setEndHour(h);
                setEndMinute(m);
                setEndPeriod(p);
                setShowEndTimePicker(false);
              }}
            />
          )}

          {/* Location */}
          <View style={styles.section}>
            <Text style={styles.label}>Location</Text>
            <View style={styles.inputContainer}>
              <View style={styles.locationInput}>
                <FontAwesome6
                  name="map-pin"
                  size={16}
                  color={Colors.textSecondary}
                  iconStyle="solid"
                />
                <TextInput
                  style={styles.inputWithIcon}
                  placeholder="e.g., Main Hall"
                  placeholderTextColor={Colors.textLight}
                  value={location}
                  onChangeText={setLocation}
                />
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Save Button */}
        <FloatingActionButton
          title={buttonTitle}
          onPress={handleSave}
          disabled={!title}
        />
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  timeRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  timeSection: {
    flex: 1,
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 0,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  timeText: {
    fontSize: FontSizes.md,
    color: Colors.text,
    flex: 1,
  },
  locationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  inputWithIcon: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.text,
    paddingVertical: Spacing.md,
  },
});

// Time Picker Modal Component
interface TimePickerModalProps {
  visible: boolean;
  hour: string;
  minute: string;
  period: 'AM' | 'PM';
  onClose: () => void;
  onConfirm: (hour: string, minute: string, period: 'AM' | 'PM') => void;
}

const TimePickerModal: React.FC<TimePickerModalProps> = ({
  visible,
  hour,
  minute,
  period,
  onClose,
  onConfirm,
}) => {
  // Ensure hour is in 01-12 format for picker
  const normalizeHour = (h: string): string => {
    const hourNum = parseInt(h, 10);
    // Handle edge cases
    if (hourNum === 0) return '12';
    if (hourNum > 12) {
      // Convert from 24-hour to 12-hour
      return String(hourNum - 12).padStart(2, '0');
    }
    // Already in 1-12 range, ensure it's padded
    return String(hourNum).padStart(2, '0');
  };

  const [selectedHour, setSelectedHour] = useState(() => normalizeHour(hour));
  const [selectedMinute, setSelectedMinute] = useState(minute);
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>(period);

  const hourScrollRef = React.useRef<ScrollView>(null);
  const minuteScrollRef = React.useRef<ScrollView>(null);

  // Update state when props change (especially when modal opens)
  React.useEffect(() => {
    if (visible) {
      const normalized = normalizeHour(hour);
      setSelectedHour(normalized);
      setSelectedMinute(minute);
      setSelectedPeriod(period);

      // Scroll to selected items after a short delay to ensure layout is complete
      setTimeout(() => {
        const hourIndex = parseInt(normalized, 10) - 1;
        const minuteIndex = ['00', '15', '30', '45'].indexOf(minute);
        if (hourScrollRef.current && hourIndex >= 0) {
          hourScrollRef.current.scrollTo({
            y: hourIndex * 56, // Approximate item height
            animated: false,
          });
        }
        if (minuteScrollRef.current && minuteIndex >= 0) {
          minuteScrollRef.current.scrollTo({
            y: minuteIndex * 56,
            animated: false,
          });
        }
      }, 100);
    }
  }, [visible, hour, minute, period]);

  const generateHours = () => {
    return Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  };

  const generateMinutes = () => {
    return ['00', '15', '30', '45'];
  };

  const hours = generateHours();
  const minutes = generateMinutes();

  const handleConfirm = () => {
    onConfirm(selectedHour, selectedMinute, selectedPeriod);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={timePickerStyles.overlay}>
        <TouchableOpacity
          style={timePickerStyles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={timePickerStyles.modalContainer}>
          <View style={timePickerStyles.header}>
            <Text style={timePickerStyles.title}>Select Time</Text>
          </View>
          <View style={timePickerStyles.pickerContainer}>
            <ScrollView
              ref={hourScrollRef}
              style={timePickerStyles.pickerColumn}
              contentContainerStyle={timePickerStyles.pickerContent}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
            >
              {hours.map((h) => (
                <TouchableOpacity
                  key={h}
                  style={[
                    timePickerStyles.pickerItem,
                    selectedHour === h && timePickerStyles.pickerItemSelected,
                  ]}
                  onPress={() => setSelectedHour(h)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      timePickerStyles.pickerText,
                      selectedHour === h && timePickerStyles.pickerTextSelected,
                    ]}
                  >
                    {h}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={timePickerStyles.separator}>:</Text>
            <ScrollView
              ref={minuteScrollRef}
              style={timePickerStyles.pickerColumn}
              contentContainerStyle={timePickerStyles.pickerContent}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
            >
              {minutes.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[
                    timePickerStyles.pickerItem,
                    selectedMinute === m && timePickerStyles.pickerItemSelected,
                  ]}
                  onPress={() => setSelectedMinute(m)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      timePickerStyles.pickerText,
                      selectedMinute === m && timePickerStyles.pickerTextSelected,
                    ]}
                  >
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={timePickerStyles.periodContainer}>
              <TouchableOpacity
                style={[
                  timePickerStyles.periodButton,
                  selectedPeriod === 'AM' && timePickerStyles.periodButtonSelected,
                ]}
                onPress={() => setSelectedPeriod('AM')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    timePickerStyles.periodText,
                    selectedPeriod === 'AM' && timePickerStyles.periodTextSelected,
                  ]}
                >
                  AM
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  timePickerStyles.periodButton,
                  selectedPeriod === 'PM' && timePickerStyles.periodButtonSelected,
                ]}
                onPress={() => setSelectedPeriod('PM')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    timePickerStyles.periodText,
                    selectedPeriod === 'PM' && timePickerStyles.periodTextSelected,
                  ]}
                >
                  PM
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={timePickerStyles.actions}>
            <TouchableOpacity style={timePickerStyles.cancelButton} onPress={onClose}>
              <Text style={timePickerStyles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={timePickerStyles.confirmButton} onPress={handleConfirm}>
              <Text style={timePickerStyles.confirmText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const timePickerStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingBottom: Spacing.lg,
    maxHeight: '60%',
  },
  header: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  pickerColumn: {
    maxHeight: 200,
  },
  pickerContent: {
    paddingVertical: 80,
  },
  pickerItem: {
    padding: Spacing.md,
    minWidth: 60,
    alignItems: 'center',
  },
  pickerItemSelected: {
    backgroundColor: Colors.primaryLight + '30',
    borderRadius: BorderRadius.md,
  },
  pickerText: {
    fontSize: FontSizes.lg,
    color: Colors.textSecondary,
  },
  pickerTextSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
  separator: {
    fontSize: FontSizes.xl,
    color: Colors.text,
    marginHorizontal: Spacing.sm,
  },
  periodContainer: {
    marginLeft: Spacing.md,
    gap: Spacing.sm,
  },
  periodButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 60,
    alignItems: 'center',
  },
  periodButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  periodText: {
    fontSize: FontSizes.md,
    color: Colors.text,
    fontWeight: '600',
  },
  periodTextSelected: {
    color: Colors.white,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.full,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    padding: Spacing.md,
    alignItems: 'center',
  },
  confirmText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.white,
  },
});

