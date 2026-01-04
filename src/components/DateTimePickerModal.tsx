// UPDATED DESIGN-MATCHING VERSION — COPY/PASTE ENTIRE FILE

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { Colors } from '../constants/colors';
import { Spacing, FontSizes, BorderRadius } from '../constants/spacing';
import dayjs from 'dayjs';

interface DateTimePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (dateTime: {
    startDate?: string;
    endDate?: string;
    startTime: string;
    endTime: string;
    timeZone: string;
  }) => void;
  initialDateTime?: {
    startDate?: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
    timeZone?: string;
  };
}

const timeZones = [
  'Pacific Time (PT) - GMT-7',
  'Mountain Time (MT) - GMT-6',
  'Central Time (CT) - GMT-5',
  'Eastern Time (ET) - GMT-4',
  'UTC - GMT+0',
];

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const DateTimePickerModal: React.FC<DateTimePickerModalProps> = ({
  visible,
  onClose,
  onConfirm,
  initialDateTime,
}) => {
  const slideAnim = React.useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  const [selectedStartDate, setSelectedStartDate] = useState(
    initialDateTime?.startDate || dayjs().format('YYYY-MM-DD'),
  );
  const [selectedEndDate, setSelectedEndDate] = useState(
    initialDateTime?.endDate,
  );

  const [startHour, setStartHour] = useState('09');
  const [startMinute, setStartMinute] = useState('00');
  const [startPeriod, setStartPeriod] = useState<'AM' | 'PM'>('AM');

  const [endHour, setEndHour] = useState('05');
  const [endMinute, setEndMinute] = useState('00');
  const [endPeriod, setEndPeriod] = useState<'AM' | 'PM'>('PM');

  const [selectedTimeZone, setSelectedTimeZone] = useState(
    initialDateTime?.timeZone || timeZones[0],
  );
  const [showTimeZonePicker, setShowTimeZonePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  // Parse initial time values if provided
  useEffect(() => {
    if (initialDateTime?.startTime) {
      const startMatch = initialDateTime.startTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (startMatch) {
        const h = parseInt(startMatch[1], 10);
        const period = startMatch[3].toUpperCase() as 'AM' | 'PM';
        // Convert 12-hour to 24-hour for storage
        let hour24 = h;
        if (period === 'PM' && h !== 12) hour24 = h + 12;
        if (period === 'AM' && h === 12) hour24 = 0;
        setStartHour(String(hour24).padStart(2, '0'));
        setStartMinute(startMatch[2]);
        setStartPeriod(period);
      }
    }
    if (initialDateTime?.endTime) {
      const endMatch = initialDateTime.endTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (endMatch) {
        const h = parseInt(endMatch[1], 10);
        const period = endMatch[3].toUpperCase() as 'AM' | 'PM';
        // Convert 12-hour to 24-hour for storage
        let hour24 = h;
        if (period === 'PM' && h !== 12) hour24 = h + 12;
        if (period === 'AM' && h === 12) hour24 = 0;
        setEndHour(String(hour24).padStart(2, '0'));
        setEndMinute(endMatch[2]);
        setEndPeriod(period);
      }
    }
  }, [initialDateTime]);

  /* ------------------------- Animations ------------------------- */
  useEffect(() => {
    if (visible) {
      // Reset animation values when opening
      slideAnim.setValue(SCREEN_HEIGHT);
      opacityAnim.setValue(0);
      
      // Small delay to ensure values are set before animation starts
      const timer = setTimeout(() => {
        // Start animation
        Animated.parallel([
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 8,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }, 10);

      return () => clearTimeout(timer);
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, opacityAnim]);

  /* ------------------------- Date Selection ------------------------- */
  const handleDateSelect = (day: any) => {
    if (!selectedStartDate || selectedEndDate) {
      setSelectedStartDate(day.dateString);
      setSelectedEndDate(undefined);
    } else {
      if (dayjs(day.dateString).isAfter(dayjs(selectedStartDate))) {
        setSelectedEndDate(day.dateString);
      } else {
        setSelectedStartDate(day.dateString);
        setSelectedEndDate(undefined);
      }
    }
  };

  const getMarkedDates = () => {
    const marked: any = {};

    if (selectedStartDate) {
      marked[selectedStartDate] = {
        startingDay: true,
        selected: true,
        selectedColor: Colors.primary,
        color: Colors.primary,
        textColor: Colors.white,
        customStyles: {
          container: {
            backgroundColor: Colors.primary,
            borderRadius: 20,
          },
        },
      };
    }

    if (selectedEndDate) {
      marked[selectedEndDate] = {
        endingDay: true,
        selected: true,
        selectedColor: Colors.primary,
        color: Colors.primary,
        textColor: Colors.white,
        customStyles: {
          container: {
            backgroundColor: Colors.primary,
            borderRadius: 20,
          },
        },
      };

      let cur = dayjs(selectedStartDate).add(1, 'day');
      while (cur.isBefore(dayjs(selectedEndDate))) {
        marked[cur.format('YYYY-MM-DD')] = {
          color: 'rgba(107, 70, 193, 0.15)',
          textColor: Colors.primary,
          customStyles: {
            container: {
              backgroundColor: 'rgba(107, 70, 193, 0.15)',
            },
          },
        };
        cur = cur.add(1, 'day');
      }
    }

    return marked;
  };

  const translateY = slideAnim;

  /* ------------------------- Render UI ------------------------- */

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.overlay}>
        {/* Background dim */}
        <Animated.View style={[styles.backdrop, { opacity: opacityAnim }]} />

        {/* Bottom Sheet */}
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ translateY }],
            },
          ]}
        >
          {/* Drag handle */}
          <View style={styles.dragHandle} />

          {/* Modal Header */}
          <Text style={styles.modalTitle}>Select Date & Time</Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* ---------------- CALENDAR CONTAINER ---------------- */}
            <View style={styles.calendarWrapper}>
              <Calendar
                current={selectedStartDate}
                markingType="period"
                monthFormat="MMMM yyyy"
                markedDates={getMarkedDates()}
                onDayPress={handleDateSelect}
                theme={{
                  calendarBackground: 'transparent',
                  monthTextColor: Colors.text,
                  textSectionTitleColor: Colors.textSecondary,
                  textDayFontSize: 16,
                  textMonthFontWeight: '700',
                  textDayHeaderFontSize: 12,
                  arrowColor: Colors.text,
                  selectedDayBackgroundColor: Colors.primary,
                  selectedDayTextColor: Colors.white,
                  todayTextColor: Colors.primary,
                  dayTextColor: Colors.text,
                  textDisabledColor: Colors.textLight,
                }}
                renderArrow={(direction) => <FontAwesome6 name={`chevron-${direction}`} size={15} iconStyle='solid' />}
                minDate={dayjs().format("YYYY-MM-DD")}
              />
            </View>

            {/* ---------------- TIME ROW: START + END ---------------- */}
            <View style={styles.timeRowCombined}>
              {/* START TIME COLUMN */}
              <View style={styles.timeColumn}>
                <Text style={styles.label}>Start Time</Text>

                <View style={styles.timeRow}>
                  <TouchableOpacity
                    style={styles.timeBox}
                    onPress={() => setShowStartTimePicker(true)}
                  >
                    <Text style={styles.timeText}>
                      {(() => {
                        const h = parseInt(startHour, 10);
                        const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
                        return `${displayHour}:${startMinute}`;
                      })()}
                    </Text>
                  </TouchableOpacity>

                    <TouchableOpacity
                    style={styles.periodBox}
                    onPress={() =>
                      setStartPeriod(startPeriod === 'AM' ? 'PM' : 'AM')
                    }
                    >
                    <Text style={styles.periodText}>{startPeriod}</Text>
                    </TouchableOpacity>
                </View>
              </View>

              {/* END TIME COLUMN */}
              <View style={styles.timeColumn}>
                <Text style={styles.label}>End Time</Text>

                <View style={styles.timeRow}>
                  <TouchableOpacity
                    style={styles.timeBox}
                    onPress={() => setShowEndTimePicker(true)}
                  >
                    <Text style={styles.timeText}>
                      {(() => {
                        const h = parseInt(endHour, 10);
                        const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
                        return `${displayHour}:${endMinute}`;
                      })()}
                    </Text>
                  </TouchableOpacity>

                    <TouchableOpacity
                    style={styles.periodBox}
                    onPress={() =>
                      setEndPeriod(endPeriod === 'AM' ? 'PM' : 'AM')
                    }
                    >
                    <Text style={styles.periodText}>{endPeriod}</Text>
                    </TouchableOpacity>
                </View>
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

            {/* ---------------- TIME ZONE ---------------- */}
            <View style={styles.timeBlock}>
              <Text style={styles.label}>Time Zone</Text>

              <TouchableOpacity
                style={styles.timeZoneBox}
                onPress={() => setShowTimeZonePicker(!showTimeZonePicker)}
              >
                <Text style={styles.timeZoneText}>{selectedTimeZone}</Text>
                <FontAwesome6
                  name="chevron-down"
                  size={12}
                  color={Colors.textSecondary}
                  style={{ marginLeft: 6 }}
                  iconStyle="solid"
                />
              </TouchableOpacity>

              {showTimeZonePicker && (
                <View style={styles.timeZoneDropdown}>
                  {timeZones.map(tz => (
                    <TouchableOpacity
                      key={tz}
                      style={[
                        styles.timeZoneOption,
                        tz === selectedTimeZone &&
                        styles.timeZoneOptionSelected,
                      ]}
                      onPress={() => {
                        setSelectedTimeZone(tz);
                        setShowTimeZonePicker(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.timeZoneOptionText,
                          tz === selectedTimeZone &&
                          styles.timeZoneOptionTextSelected,
                        ]}
                      >
                        {tz}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>

          {/* ---------------- FOOTER BUTTONS ---------------- */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={() => {
                if (!selectedStartDate) {
                  return; // Don't confirm if no start date selected
                }

                // Format time strings
                const formatTime = (hour: string, minute: string, period: 'AM' | 'PM') => {
                  const h = parseInt(hour, 10);
                  const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
                  return `${displayHour}:${minute} ${period}`;
                };

                const startTimeStr = formatTime(startHour, startMinute, startPeriod);
                const endTimeStr = formatTime(endHour, endMinute, endPeriod);

                onConfirm({
                  startDate: selectedStartDate,
                  endDate: selectedEndDate,
                  startTime: startTimeStr,
                  endTime: endTimeStr,
                  timeZone: selectedTimeZone,
                });
              }}
            >
              <Text style={styles.confirmText}>Set Date & Time</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

/* --------------------------- STYLES --------------------------- */

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },

  modalContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingBottom: 20,
    maxHeight: SCREEN_HEIGHT * 0.87,
  },

  dragHandle: {
    width: 50,
    height: 5,
    backgroundColor: '#D9D9D9',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 8,
  },

  modalTitle: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    color: Colors.text,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  /* CALENDAR */
  calendarWrapper: {
    backgroundColor: '#F7F8FC',
    borderRadius: 24,
    padding: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ececec',
  },

  /* TIME */
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
  },

  timeBlock: {
    marginBottom: 20,
  },

  timeRow: {
    flexDirection: 'row',
    gap: 10,
  },

  timeBox: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },

  timeText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },

  periodBox: {
    width: 80,
    backgroundColor: Colors.white,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },

  periodText: {
    fontSize: 18,
    fontWeight: '600',
  },

  /* TIME ZONE */
  timeZoneBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'space-between',
  },

  timeZoneText: {
    fontSize: 15,
    flex: 1,
    color: Colors.text,
  },

  timeZoneDropdown: {
    marginTop: 6,
    borderRadius: 14,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  timeZoneOption: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  timeZoneOptionSelected: {
    backgroundColor: Colors.primary + '15',
  },

  timeZoneOptionText: {
    fontSize: 15,
    color: Colors.text,
  },

  timeZoneOptionTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },

  /* FOOTER BUTTONS */
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 14,
    marginTop: 10,
  },

  cancelBtn: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 16,
  },

  confirmBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
  timeRowCombined: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 20,
  },

  timeColumn: {
    flex: 1,
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
  // Convert 24-hour to 12-hour for display
  const hour24 = parseInt(hour, 10);
  const hour12 = hour24 > 12 ? hour24 - 12 : hour24 === 0 ? 12 : hour24;
  const currentPeriod = hour24 >= 12 ? 'PM' : 'AM';

  const [selectedHour, setSelectedHour] = useState(String(hour12).padStart(2, '0'));
  const [selectedMinute, setSelectedMinute] = useState(minute);
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>(currentPeriod);

  useEffect(() => {
    const hour24 = parseInt(hour, 10);
    const hour12 = hour24 > 12 ? hour24 - 12 : hour24 === 0 ? 12 : hour24;
    const currentPeriod = hour24 >= 12 ? 'PM' : 'AM';
    setSelectedHour(String(hour12).padStart(2, '0'));
    setSelectedMinute(minute);
    setSelectedPeriod(currentPeriod);
  }, [hour, minute, visible]);

  const generateHours = () => {
    return Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  };

  const generateMinutes = () => {
    return ['00', '15', '30', '45'];
  };

  const hours = generateHours();
  const minutes = generateMinutes();

  const handleConfirm = () => {
    // Convert 12-hour back to 24-hour for storage
    let hour24 = parseInt(selectedHour, 10);
    if (selectedPeriod === 'PM' && hour24 !== 12) {
      hour24 += 12;
    } else if (selectedPeriod === 'AM' && hour24 === 12) {
      hour24 = 0;
    }
    onConfirm(String(hour24).padStart(2, '0'), selectedMinute, selectedPeriod);
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
            <ScrollView style={timePickerStyles.pickerColumn}>
              {hours.map((h) => (
                <TouchableOpacity
                  key={h}
                  style={[
                    timePickerStyles.pickerItem,
                    selectedHour === h && timePickerStyles.pickerItemSelected,
                  ]}
                  onPress={() => setSelectedHour(h)}
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
            <ScrollView style={timePickerStyles.pickerColumn}>
              {minutes.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[
                    timePickerStyles.pickerItem,
                    selectedMinute === m && timePickerStyles.pickerItemSelected,
                  ]}
                  onPress={() => setSelectedMinute(m)}
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
