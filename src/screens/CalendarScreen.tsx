import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { ScreenLayout, ScreenHeader, Header } from '../components';
import { Colors } from '../constants/colors';
import { Spacing, FontSizes } from '../constants/spacing';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { useNavigation } from '@react-navigation/native';
import { eventService } from '../services';
import { useAuth } from '../context/AuthContext';
import dayjs from 'dayjs';

interface CalendarScreenProps {}

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
  const [switchWidth, setSwitchWidth] = useState(0);
  const viewSliderAnim = useRef(new Animated.Value(1)).current;

  // Animate view switch
  useEffect(() => {
    if (switchWidth > 0) {
      const sliderWidth = (switchWidth - 8) / 2; // Account for padding (4px on each side)
      Animated.spring(viewSliderAnim, {
        toValue: selectedView * sliderWidth,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    }
  }, [selectedView, viewSliderAnim, switchWidth]);

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
      <ScreenHeader title="Timeline" />
      <View style={styles.content}>
        {/* Custom Pill Switch */}
        <View style={styles.viewSwitchContainer}>
          <View
            style={styles.viewSwitch}
            onLayout={(e) => setSwitchWidth(e.nativeEvent.layout.width)}
          >
            {switchWidth > 0 && (
              <Animated.View
                style={[
                  styles.viewSwitchSlider,
                  {
                    width: (switchWidth - 8) / 2,
                    transform: [
                      {
                        translateX: viewSliderAnim,
                      },
                    ],
                  },
                ]}
              />
            )}
            <TouchableOpacity
              style={styles.viewSwitchOption}
              onPress={() => setSelectedView(0)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.viewSwitchText,
                  selectedView === 0 && styles.viewSwitchTextActive,
                ]}
              >
                Timeline
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.viewSwitchOption}
              onPress={() => setSelectedView(1)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.viewSwitchText,
                  selectedView === 1 && styles.viewSwitchTextActive,
                ]}
              >
                Calendar
              </Text>
            </TouchableOpacity>
          </View>
        </View>

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
                backgroundColor: 'transparent',
                calendarBackground: 'transparent',
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
                textDayFontWeight: '500',
                textMonthFontWeight: '700',
                textDayHeaderFontWeight: '600',
                textDayFontSize: FontSizes.md,
                textMonthFontSize: FontSizes.xl,
                textDayHeaderFontSize: FontSizes.xs,
              }}
              style={styles.calendar}
              renderArrow={(direction) => <FontAwesome6 name={`chevron-${direction}`} size={16} iconStyle='solid' />}
            />
          </View>
        )}

        {selectedView === 0 && (
          <ScrollView
            style={styles.timelineView}
            contentContainerStyle={styles.timelineContent}
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
                  <View style={styles.timelineContainer}>
                    {selectedDateScheduleItems.map((item, index) => (
                      <View key={item.id} style={styles.timelineItem}>
                        <View style={styles.timelineLeft}>
                          <Text style={styles.timelineTime}>{item.startTime}</Text>
                          {index < selectedDateScheduleItems.length - 1 && (
                            <View style={styles.timelineLine} />
                          )}
                        </View>
                        <TouchableOpacity
                          style={styles.timelineContent}
                          onPress={() => handleScheduleItemPress(item.eventId)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.timelineCard}>
                            <Text style={styles.timelineEventName}>
                              {item.eventName}
                            </Text>
                            <Text style={styles.timelineTitle}>{item.title}</Text>
                            {item.location && (
                              <View style={styles.timelineMeta}>
                                <FontAwesome6
                                  name="map-pin"
                                  iconStyle="solid"
                                  size={12}
                                  color={Colors.textSecondary}
                                />
                                <Text style={styles.timelineMetaText}>
                                  {item.location}
                                </Text>
                              </View>
                            )}
                          </View>
                        </TouchableOpacity>
                      </View>
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
    paddingHorizontal: 20,
  },
  viewSwitchContainer: {
    marginVertical: Spacing.md,
  },
  viewSwitch: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    position: 'relative',
  },
  viewSwitchSlider: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    width: '50%',
    backgroundColor: Colors.primary,
    borderRadius: 10,
    zIndex: 0,
  },
  viewSwitchOption: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  viewSwitchText: {
    fontSize: FontSizes.sm,
    color: '#6B7280',
    fontWeight: '500',
  },
  viewSwitchTextActive: {
    color: Colors.white,
    fontWeight: '600',
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
    backgroundColor: 'transparent',
    borderRadius: 0,
    padding: 0,
    marginBottom: Spacing.lg,
    marginTop: Spacing.md,
  },
  calendar: {
    borderRadius: 0,
  },
  timelineView: {
    flex: 1,
    marginTop: Spacing.sm,
  },
  timelineContent: {
    paddingBottom: Spacing.xl,
  },
  timelineContainer: {
    paddingLeft: Spacing.md,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
  },
  timelineLeft: {
    width: 80,
    alignItems: 'flex-end',
    paddingRight: Spacing.md,
    position: 'relative',
  },
  timelineTime: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 2,
  },
  timelineLine: {
    position: 'absolute',
    right: 0,
    top: 24,
    bottom: -Spacing.lg,
    width: 2,
    backgroundColor: Colors.border,
  },
  timelineCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.md,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  timelineEventName: {
    fontSize: FontSizes.xs,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timelineTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  timelineMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  timelineMetaText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
});
