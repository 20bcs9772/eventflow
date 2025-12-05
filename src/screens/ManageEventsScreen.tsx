import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Image,
} from 'react-native';
import { ScreenLayout, FloatingActionButton } from '../components';
import { Colors } from '../constants/colors';
import { Spacing, FontSizes, BorderRadius } from '../constants/spacing';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { useNavigation } from '@react-navigation/native';
import { eventService } from '../services';
import { useAuth } from '../context/AuthContext';
import dayjs from 'dayjs';
import { Event } from '../types';
import { mapBackendEventToFrontend } from '../utils/eventMapper';

interface ManageEventsScreenProps {
    onBack?: () => void;
}

interface BackendEvent {
    id: string;
    name: string;
    description?: string | null;
    startDate: string | Date;
    endDate: string | Date;
    location?: string | null;
    shortCode: string;
    visibility: string;
    type: string;
    _count?: {
        guestEvents?: number;
    };
    guestEvents?: Array<{
        user?: {
            id: string;
            name?: string | null;
            email?: string | null;
        };
    }>;
}

export const ManageEventsScreen: React.FC<ManageEventsScreenProps> = ({
    onBack,
}) => {
    const navigation = useNavigation<any>();
    const { backendUser } = useAuth();
    const [events, setEvents] = useState<BackendEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        if (backendUser) {
            fetchEvents();
        } else {
            setIsLoading(false);
        }
    }, [backendUser]);

    const fetchEvents = async () => {
        if (!backendUser) return;

        try {
            setIsLoading(true);
            const response = await eventService.getMyEvents();

            if (response.success && response.data) {
                setEvents(response.data);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchEvents();
    };

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigation.goBack();
        }
    };

    const handleCreateEvent = () => {
        navigation.navigate('CreateEvent');
    };

    const handleEventPress = (event: BackendEvent) => {
        const frontendEvent = mapBackendEventToFrontend(event);
        navigation.navigate('EventDetails', { event: frontendEvent });
    };

    const handleEditEvent = (event: BackendEvent) => {
        // TODO: Navigate to edit event screen
        const frontendEvent = mapBackendEventToFrontend(event);
        navigation.navigate('EventDetails', { event: frontendEvent });
    };

    // Separate events into upcoming and past
    const now = new Date();
    const upcomingEvents = events.filter(
        event => new Date(event.startDate) >= now
    );
    const pastEvents = events.filter(
        event => new Date(event.startDate) < now
    );

    // Get event status
    const getEventStatus = (event: BackendEvent): 'Live' | 'Draft' | 'Ended' => {
        const startDate = new Date(event.startDate);
        const endDate = new Date(event.endDate);

        if (now < startDate) {
            return 'Draft';
        } else if (now >= startDate && now <= endDate) {
            return 'Live';
        } else {
            return 'Ended';
        }
    };

    // Get event icon based on type
    const getEventIcon = (type: string): any => {
        const iconMap: { [key: string]: any } = {
            WEDDING: "ring",
            BIRTHDAY: "cake-candles",
            CORPORATE: "briefcase",
            COLLEGE_FEST: "graduation-cap",
            OTHER: "calendar-days",
        };
        return iconMap[type] || 'calendar-days';
    };

    // Get event icon color based on type
    const getEventIconColor = (type: string) => {
        const colorMap: { [key: string]: string } = {
            WEDDING: '#E8D5FF',
            BIRTHDAY: '#FFE5F1',
            CORPORATE: '#E5F0FF',
            COLLEGE_FEST: '#FFF5E5',
            OTHER: '#F0F0F0',
        };
        return colorMap[type] || Colors.backgroundLight;
    };

    const renderEventCard = (event: BackendEvent, isPast: boolean = false) => {
        const status = getEventStatus(event);
        const attendeeCount = event._count?.guestEvents || event.guestEvents?.length || 0;
        const attendeesAvatars = event.guestEvents
            ?.slice(0, 3)
            .map(ge => ge.user?.name?.charAt(0) || '')
            .filter(Boolean) || [];

        return (
            <TouchableOpacity
                key={event.id}
                style={styles.eventCard}
                onPress={() => handleEventPress(event)}
                activeOpacity={0.7}
            >
                <View
                    style={[
                        styles.eventIconContainer,
                        { backgroundColor: getEventIconColor(event.type) },
                    ]}
                >
                    <FontAwesome6 
                        name={getEventIcon(event.type)} 
                        size={25} 
                        iconStyle="solid" 
                        color={Colors.primary}
                    />
                </View>

                <View style={styles.eventContent}>
                    <View style={styles.eventHeader}>
                        <Text style={styles.eventTitle} numberOfLines={1}>
                            {event.name}
                        </Text>
                        {!isPast && (
                            <TouchableOpacity
                                style={styles.editButton}
                                onPress={(e) => {
                                    e.stopPropagation();
                                    handleEditEvent(event);
                                }}
                                activeOpacity={0.7}
                            >
                                <FontAwesome6
                                    name="pencil"
                                    size={14}
                                    color={Colors.textSecondary}
                                    iconStyle="solid"
                                />
                            </TouchableOpacity>
                        )}
                    </View>

                    <Text style={styles.eventDateLocation}>
                        {dayjs(event.startDate).format('MMM D, YYYY')} •{' '}
                        {event.location || 'Location TBA'}
                    </Text>

                    {!isPast && (
                        <View style={styles.eventFooter}>
                            <View style={styles.attendeesContainer}>
                                {attendeesAvatars.map((avatar, index) => (
                                    <View
                                        key={index}
                                        style={[
                                            styles.avatar,
                                            { marginLeft: index > 0 ? -8 : 0 },
                                        ]}
                                    >
                                        <Text style={styles.avatarText}>{avatar}</Text>
                                    </View>
                                ))}
                                <Text style={styles.attendeesCount}>
                                    {attendeeCount} Joined
                                </Text>
                            </View>

                            <View
                                style={[
                                    styles.statusBadge,
                                    status === 'Live' && styles.statusBadgeLive,
                                    status === 'Draft' && styles.statusBadgeDraft,
                                    status === 'Ended' && styles.statusBadgeEnded,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.statusText,
                                        status === 'Live' && styles.statusTextLive,
                                        status === 'Draft' && styles.statusTextDraft,
                                        status === 'Ended' && styles.statusTextEnded,
                                    ]}
                                >
                                    {status}
                                </Text>
                            </View>
                        </View>
                    )}

                    {isPast && (
                        <View style={styles.pastEventBadge}>
                            <Text style={styles.pastEventText}>Ended</Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    if (isLoading) {
        return (
            <ScreenLayout backgroundColor={Colors.backgroundLight}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={handleBack}
                        activeOpacity={0.7}
                    >
                        <FontAwesome6
                            name="chevron-left"
                            size={20}
                            color={Colors.text}
                            iconStyle="solid"
                        />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>My Events</Text>
                    <View style={styles.headerSpacer} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            </ScreenLayout>
        );
    }

    if (!backendUser) {
        return (
            <ScreenLayout backgroundColor={Colors.backgroundLight}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={handleBack}
                        activeOpacity={0.7}
                    >
                        <FontAwesome6
                            name="chevron-left"
                            size={20}
                            color={Colors.text}
                            iconStyle="solid"
                        />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>My Events</Text>
                    <View style={styles.headerSpacer} />
                </View>
                <View style={styles.emptyContainer}>
                    <FontAwesome6
                        name="calendar-xmark"
                        size={48}
                        color={Colors.textLight}
                        iconStyle="solid"
                    />
                    <Text style={styles.emptyTitle}>Sign in to view your events</Text>
                </View>
            </ScreenLayout>
        );
    }

    return (
        <ScreenLayout backgroundColor={Colors.backgroundLight}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleBack}
                    activeOpacity={0.7}
                >
                    <FontAwesome6
                        name="chevron-left"
                        size={20}
                        color={Colors.text}
                        iconStyle="solid"
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Events</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        tintColor={Colors.primary}
                    />
                }
            >
                {events.length === 0 ? (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconContainer}>
                            <FontAwesome6
                                name="calendar"
                                size={48}
                                color={Colors.white}
                                iconStyle="solid"
                            />
                        </View>
                        <Text style={styles.emptyTitle}>No Events Yet</Text>
                        <Text style={styles.emptySubtitle}>
                            You haven't created any events. Tap the button below to get
                            started.
                        </Text>
                    </View>
                ) : (
                    <>
                        {upcomingEvents.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>UPCOMING EVENTS</Text>
                                {upcomingEvents.map(event => renderEventCard(event, false))}
                            </View>
                        )}

                        {pastEvents.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>PAST EVENTS</Text>
                                {pastEvents.map(event => renderEventCard(event, true))}
                            </View>
                        )}
                    </>
                )}
            </ScrollView>

            <FloatingActionButton
                title="Create New Event"
                onPress={handleCreateEvent}
                icon={<FontAwesome6 name="plus" size={20} color={Colors.white} iconStyle="solid" />}
            />
        </ScreenLayout>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        marginBottom: Spacing.md,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.backgroundLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: FontSizes.xl,
        fontWeight: 'bold',
        color: Colors.text,
    },
    headerSpacer: {
        width: 44,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: Spacing.md,
        paddingBottom: 100,
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
        minHeight: 400,
    },
    emptyIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.lg,
    },
    emptyTitle: {
        fontSize: FontSizes.xl,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: Spacing.sm,
    },
    emptySubtitle: {
        fontSize: FontSizes.md,
        color: Colors.textSecondary,
        textAlign: 'center',
        paddingHorizontal: Spacing.xl,
    },
    section: {
        marginBottom: Spacing.xl,
    },
    sectionTitle: {
        fontSize: FontSizes.sm,
        fontWeight: '600',
        color: Colors.primary,
        marginBottom: Spacing.md,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    eventCard: {
        flexDirection: 'row',
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        shadowColor: Colors.black,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    eventIconContainer: {
        width: 56,
        height: 56,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    eventIcon: {
        fontSize: 28,
    },
    eventContent: {
        flex: 1,
    },
    eventHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Spacing.xs,
    },
    eventTitle: {
        fontSize: FontSizes.md,
        fontWeight: '600',
        color: Colors.text,
        flex: 1,
    },
    editButton: {
        padding: Spacing.xs,
    },
    eventDateLocation: {
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
        marginBottom: Spacing.sm,
    },
    eventFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    attendeesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: Colors.primaryLight,
        borderWidth: 2,
        borderColor: Colors.white,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: FontSizes.xs,
        color: Colors.primary,
        fontWeight: '600',
    },
    attendeesCount: {
        fontSize: FontSizes.sm,
        color: Colors.textSecondary,
        marginLeft: Spacing.sm,
    },
    statusBadge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: BorderRadius.sm,
    },
    statusBadgeLive: {
        backgroundColor: '#E6F7E6',
    },
    statusBadgeDraft: {
        backgroundColor: Colors.backgroundLight,
    },
    statusBadgeEnded: {
        backgroundColor: Colors.backgroundLight,
    },
    statusText: {
        fontSize: FontSizes.xs,
        fontWeight: '600',
    },
    statusTextLive: {
        color: '#4CAF50',
    },
    statusTextDraft: {
        color: Colors.textSecondary,
    },
    statusTextEnded: {
        color: Colors.textSecondary,
    },
    pastEventBadge: {
        alignSelf: 'flex-start',
        backgroundColor: Colors.backgroundLight,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: BorderRadius.sm,
    },
    pastEventText: {
        fontSize: FontSizes.xs,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
});

