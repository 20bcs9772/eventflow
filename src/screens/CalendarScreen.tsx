import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { Header, SegmentedControl, Card, ScreenLayout } from '../components';
import { Colors } from '../constants/colors';
import { Spacing, FontSizes, BorderRadius } from '../constants/spacing';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { useNavigation } from '@react-navigation/native';
import { eventService } from '../services';
import { useAuth } from '../context/AuthContext';
import dayjs from 'dayjs';
import { Event } from '../types';
import { mapBackendEventToFrontend } from '../utils/eventMapper';

interface CalendarScreenProps {
  onNavigate?: (route: string) => void;
}

interface CalendarEvent {
  id: string;
  name: string;
  startDate: string | Date;
  endDate: string | Date;
  location?: string | null;
  shortCode: string;
  visibility?: string;
  type?: string;
  scheduleItems?: Array<{
    id: string;
    title: string;
    startTime: string | Date;
    endTime: string | Date;
    location?: string | null;
  }>;
  isAdmin?: boolean;
}

export const CalendarScreen: React.FC<CalendarScreenProps> = () => {
  const navigation = useNavigation<any>();
  const { backendUser } = useAuth();
  const [selectedView, setSelectedView] = useState(1); // 0 = Timeline, 1 = Calendar
  const [selectedDate, setSelectedDate] = useState<string>(
    dayjs().format('YYYY-MM-DD')
  );
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (backendUser) {
      fetchCalendarEvents();
    } else {
      setIsLoading(false);
    }
  }, [backendUser]);

  const fetchCalendarEvents = async () => {
    if (!backendUser) return;

    try {
      setIsLoading(true);

      // Get events for current month and next month
      const startDate = dayjs().startOf('month').toISOString();
      const endDate = dayjs().add(2, 'month').endOf('month').toISOString();

      const response = await eventService.getCalendarEvents(startDate, endDate);

      if (response.success && response.data) {
        setEvents(response.data);
      }
    } catch (error) {
      console.error('Error fetching calendar events:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchCalendarEvents();
  };

  // Create marked dates for calendar
  const markedDates = useMemo(() => {
    const marked: any = {};

    events.forEach(event => {
      const eventDate = dayjs(event.startDate).format('YYYY-MM-DD');

      if (!marked[eventDate]) {
        marked[eventDate] = {
          marked: true,
          dotColor: Colors.primary,
        };
      } else {
        // If multiple events on same day, show as multiple dots
        marked[eventDate].dots = [
          ...(marked[eventDate].dots || []),
          { color: Colors.primary },
        ];
      }
    });

    // Mark selected date
    if (selectedDate) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: Colors.primary,
        selectedTextColor: Colors.white,
      };
    }

    return marked;
  }, [events, selectedDate]);

  // Get events for selected date
  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];

    return events.filter(event => {
      const eventDate = dayjs(event.startDate).format('YYYY-MM-DD');
      return eventDate === selectedDate;
    });
  }, [events, selectedDate]);

  // Get schedule items for selected date
  const selectedDateScheduleItems = useMemo(() => {
    const scheduleItems: Array<{
      id: string;
      title: string;
      startTime: string;
      endTime: string;
      location?: string | null;
      eventId: string;
      eventName: string;
    }> = [];

    selectedDateEvents.forEach(event => {
      if (event.scheduleItems && event.scheduleItems.length > 0) {
        event.scheduleItems.forEach(item => {
          const itemDate = dayjs(item.startTime).format('YYYY-MM-DD');
          if (itemDate === selectedDate) {
            scheduleItems.push({
              id: item.id,
              title: item.title,
              startTime: dayjs(item.startTime).format('h:mm A'),
              endTime: dayjs(item.endTime).format('h:mm A'),
              location: item.location,
              eventId: event.id,
              eventName: event.name,
            });
          }
        });
      }
    });

    // Sort by start time
    return scheduleItems.sort((a, b) => {
      const timeA = dayjs(a.startTime, 'h:mm A');
      const timeB = dayjs(b.startTime, 'h:mm A');
      return timeA.isBefore(timeB) ? -1 : 1;
    });
  }, [selectedDateEvents, selectedDate]);

  const handleDateSelect = (day: DateData) => {
    setSelectedDate(day.dateString);
    setSelectedView(0); // Switch to timeline view when date is selected
  };

  const handleEventPress = (event: CalendarEvent) => {
    // Convert CalendarEvent to format expected by EventDetails
    const frontendEvent = {
      id: event.id,
      shortCode: event.shortCode,
      title: event.name,
      date: dayjs(event.startDate).format('MMM D, YYYY'),
      location: event.location || 'Location TBA',
      startTime: dayjs(event.startDate).format('h:mm A'),
      endTime: event.endDate 
        ? dayjs(new Date(event.endDate)).format('h:mm A')
        : undefined,
    };
    navigation.navigate('EventDetails', { event: frontendEvent });
  };

  const handleScheduleItemPress = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      const frontendEvent = {
        id: event.id,
        shortCode: event.shortCode,
        title: event.name,
        date: dayjs(event.startDate).format('MMM D, YYYY'),
        location: event.location || 'Location TBA',
        startTime: dayjs(event.startDate).format('h:mm A'),
        endTime: event.endDate 
          ? dayjs(new Date(event.endDate)).format('h:mm A')
          : undefined,
      };
      navigation.navigate('EventDetails', { event: frontendEvent });
    }
  };

  const formatSelectedDate = (dateString: string) => {
    return dayjs(dateString).format('dddd, MMMM D, YYYY');
  };

  if (isLoading) {
    return (
      <ScreenLayout backgroundColor={Colors.backgroundLight}>
        <Header title="Timeline" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </ScreenLayout>
    );
  }

  if (!backendUser) {
    return (
      <ScreenLayout backgroundColor={Colors.backgroundLight}>
        <Header title="Timeline" />
        <View style={styles.emptyContainer}>
          <FontAwesome6
            name="calendar-xmark"
            size={48}
            color={Colors.textLight}
            iconStyle="solid"
          />
          <Text style={styles.emptyTitle}>Sign in to view your calendar</Text>
          <Text style={styles.emptySubtitle}>
            Please sign in to see your events and schedule
          </Text>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout backgroundColor={Colors.backgroundLight}>
      <Header
        title="Timeline"
        subtitle={selectedDate ? formatSelectedDate(selectedDate) : undefined}
      />
      <View style={styles.content}>
        <SegmentedControl
          options={['Timeline', 'Calendar']}
          selectedIndex={selectedView}
          onSelect={setSelectedView}
        />

        {selectedView === 1 && (
          <View style={styles.calendarContainer}>
            <Calendar
              current={selectedDate}
              onDayPress={handleDateSelect}
              markedDates={markedDates}
              monthFormat="MMMM yyyy"
              enableSwipeMonths={true}
              hideExtraDays={false}
              theme={{
                backgroundColor: Colors.white,
                calendarBackground: Colors.white,
                textSectionTitleColor: Colors.textSecondary,
                selectedDayBackgroundColor: Colors.primary,
                selectedDayTextColor: Colors.white,
                todayTextColor: Colors.primary,
                dayTextColor: Colors.text,
                textDisabledColor: Colors.textLight,
                dotColor: Colors.primary,
                selectedDotColor: Colors.white,
                arrowColor: Colors.primary,
                monthTextColor: Colors.text,
                textDayFontWeight: '400',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: '500',
                textDayFontSize: FontSizes.sm,
                textMonthFontSize: FontSizes.xl,
                textDayHeaderFontSize: FontSizes.xs,
              }}
              style={styles.calendar}
              renderArrow={(direction) => <FontAwesome6 name={`chevron-${direction}`} size={15} iconStyle='solid' />}
            />
          </View>
        )}

        {selectedView === 0 && (
          <ScrollView
            style={styles.timelineView}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor={Colors.primary}
              />
            }
          >
            {selectedDateEvents.length > 0 || selectedDateScheduleItems.length > 0 ? (
              <>
                {selectedDateScheduleItems.length > 0 && (
                  <View style={styles.eventsSection}>
                    {selectedDateScheduleItems.map(item => (
                      <TouchableOpacity
                        key={item.id}
                        onPress={() => handleScheduleItemPress(item.eventId)}
                        activeOpacity={0.7}
                      >
                        <Card style={styles.eventCard}>
                          <Text style={styles.scheduleEventName}>
                            {item.eventName}
                          </Text>
                          <Text style={styles.eventTitle}>{item.title}</Text>
                          <View style={styles.eventInfo}>
                            <Text style={styles.eventInfoText}>
                              <FontAwesome6 name="clock" size={14} />{' '}
                              {item.startTime} - {item.endTime}
                            </Text>
                          </View>
                          {item.location && (
                            <View style={styles.eventInfo}>
                              <Text style={styles.eventInfoText}>
                                <FontAwesome6
                                  name="map-pin"
                                  iconStyle="solid"
                                  size={14}
                                />{' '}
                                {item.location}
                              </Text>
                            </View>
                          )}
                        </Card>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            ) : (
              <View style={styles.emptyState}>
                <FontAwesome6
                  name="calendar-day"
                  size={48}
                  color={Colors.textLight}
                  iconStyle="solid"
                />
                <Text style={styles.emptyTitle}>No events on this date</Text>
                <Text style={styles.emptySubtitle}>
                  Select another date or create a new event
                </Text>
              </View>
            )}
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
    paddingHorizontal: Spacing.xl,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.xxl * 2,
  },
  emptyTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  calendarContainer: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    marginTop: Spacing.md,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  calendar: {
    borderRadius: BorderRadius.lg,
  },
  timelineView: {
    flex: 1,
    marginTop: Spacing.sm,
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
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  eventTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  scheduleEventName: {
    fontSize: FontSizes.xs,
    color: Colors.primary,
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  adminBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  adminBadgeText: {
    fontSize: FontSizes.xs,
    color: Colors.primary,
    fontWeight: '600',
  },
  eventInfo: {
    marginBottom: Spacing.xs,
  },
  eventInfoText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
});
