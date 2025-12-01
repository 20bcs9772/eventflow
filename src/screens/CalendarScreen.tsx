import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Header, SegmentedControl, Card, ScreenLayout } from '../components';
import { Colors } from '../constants/colors';
import { Spacing, FontSizes, BorderRadius } from '../constants/spacing';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';

interface CalendarScreenProps {
  onNavigate: (route: string) => void;
}

const calendarDays = [
  { date: 18, hasEvent: true, isSelected: true },
  { date: 19, hasEvent: true, isSelected: false },
  { date: 20, hasEvent: true, isSelected: false },
];

const events = [
  {
    id: '1',
    title: 'Welcome Drinks & BBQ',
    time: '5:00 PM - 8:30 PM',
    location: 'Rooftop Terrace',
  },
  {
    id: '2',
    title: 'After Party',
    time: '9:00 PM - Late',
    location: 'The Velvet Lounge',
  },
];

export const CalendarScreen: React.FC<CalendarScreenProps> = () => {
  const [selectedView, setSelectedView] = useState(1); // 0 = Timeline, 1 = Calendar

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthDays = [];

  // Generate calendar days (simplified - showing October 2024)
  for (let i = 1; i <= 31; i++) {
    monthDays.push(i);
  }

  return (
    <ScreenLayout backgroundColor={Colors.backgroundLight}>
      <Header title="Timeline" subtitle="October 18-20, 2024" />
      <View style={styles.content}>
        <SegmentedControl
          options={['Timeline', 'Calendar']}
          selectedIndex={selectedView}
          onSelect={setSelectedView}
        />

        {selectedView === 1 && (
          <>
            <View style={styles.calendarContainer}>
              <Text style={styles.monthTitle}>October 2024</Text>
              <View style={styles.weekDaysRow}>
                {weekDays.map(day => (
                  <View key={day} style={styles.weekDay}>
                    <Text style={styles.weekDayText}>{day}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.calendarGrid}>
                {monthDays.map(day => {
                  const dayData = calendarDays.find(d => d.date === day);
                  const isSelected = dayData?.isSelected;
                  const hasEvent = dayData?.hasEvent;

                  return (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.calendarDay,
                        isSelected && styles.calendarDaySelected,
                      ]}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.calendarDayText,
                          isSelected && styles.calendarDayTextSelected,
                        ]}
                      >
                        {day}
                      </Text>
                      {hasEvent && (
                        <View
                          style={[
                            styles.eventDot,
                            isSelected && styles.eventDotSelected,
                          ]}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </>
        )}

        {selectedView === 0 && (
          <ScrollView style={styles.timelineView}>
            <View style={styles.eventsSection}>
              <Text style={styles.eventsSectionTitle}>Friday, October 18</Text>
              {events.map(event => (
                <Card key={event.id} style={styles.eventCard}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventInfoText}>
                      <FontAwesome6 name="clock" size={15} /> {event.time}
                    </Text>
                  </View>
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventInfoText}>
                      <FontAwesome6
                        name="map-pin"
                        iconStyle="solid"
                        size={15}
                      />{' '}
                      {event.location}
                    </Text>
                  </View>
                </Card>
              ))}
            </View>
          </ScrollView>
        )}
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingBottom: 100,
  },
  calendarContainer: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    marginHorizontal: Spacing.md,
  },
  monthTitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  weekDaysRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  weekDay: {
    flex: 1,
    alignItems: 'center',
  },
  weekDayText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  calendarDaySelected: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
  },
  calendarDayText: {
    fontSize: FontSizes.sm,
    color: Colors.text,
    fontWeight: '400',
  },
  calendarDayTextSelected: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  eventDot: {
    position: 'absolute',
    bottom: -4,
    width: 4,
    height: 4,
    borderRadius: 50,
    backgroundColor: Colors.primary,
  },
  eventDotSelected: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  eventsSection: {
    marginTop: Spacing.lg,
  },
  eventsSectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  eventCard: {
    marginBottom: Spacing.md,
  },
  eventTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  eventInfo: {
    marginBottom: Spacing.xs,
  },
  eventInfoText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  timelineView: {
    flex: 1,
  },
});
