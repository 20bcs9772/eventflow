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
  const slideAnim = useState(new Animated.Value(SCREEN_HEIGHT))[0];
  const opacityAnim = useState(new Animated.Value(0))[0];

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

  /* ------------------------- Animations ------------------------- */
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
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
  }, [visible]);

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
        color: Colors.primary,
        textColor: Colors.white,
      };
    }

    if (selectedEndDate) {
      marked[selectedEndDate] = {
        endingDay: true,
        selected: true,
        color: Colors.primary,
        textColor: Colors.white,
      };

      let cur = dayjs(selectedStartDate).add(1, 'day');
      while (cur.isBefore(dayjs(selectedEndDate))) {
        marked[cur.format('YYYY-MM-DD')] = {
          color: Colors.primary + '30',
          textColor: Colors.primary,
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
                }}
              />
            </View>

            {/* ---------------- TIME ROW: START + END ---------------- */}
            <View style={styles.timeRowCombined}>
              {/* START TIME COLUMN */}
              <View style={styles.timeColumn}>
                <Text style={styles.label}>Start Time</Text>

                <View style={styles.timeRow}>
                  <TouchableOpacity style={styles.timeBox}>
                    <Text style={styles.timeText}>
                      {startHour}:{startMinute}
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
                  <TouchableOpacity style={styles.timeBox}>
                    <Text style={styles.timeText}>
                      {endHour}:{endMinute}
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

            <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm}>
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
