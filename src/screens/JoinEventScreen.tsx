import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  FloatingActionButton,
  TextInput,
  ScreenLayout,
  ScreenHeader,
} from '../components';
import { Colors } from '../constants/colors';
import { Spacing, BorderRadius, FontSizes } from '../constants/spacing';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { eventService, guestService } from '../services';
import { useAuth } from '../context/AuthContext';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import dayjs from 'dayjs';

interface JoinEventScreenProps {
  onJoinEvent?: (code: string) => void;
  onScanQR?: () => void;
  onBack?: () => void;
}

type JoinEventRouteProp = RouteProp<RootStackParamList, 'JoinEvent'>;

export const JoinEventScreen: React.FC<JoinEventScreenProps> = ({
  onScanQR,
  onBack,
}) => {
  const navigation = useNavigation<any>();
  const route = useRoute<JoinEventRouteProp>();
  const { backendUser } = useAuth();
  const routeEventCode = route.params?.eventCode;
  const autoJoin = route.params?.autoJoin;
  const [eventCode, setEventCode] = useState(routeEventCode || '');
  const [isJoining, setIsJoining] = useState(false);

  // Auto-join when user is authenticated and autoJoin flag is set
  const hasAutoJoinedRef = React.useRef(false);
  useEffect(() => {
    if (
      autoJoin &&
      eventCode &&
      backendUser &&
      !isJoining &&
      !hasAutoJoinedRef.current
    ) {
      hasAutoJoinedRef.current = true;
      handleJoinEvent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoJoin, eventCode, backendUser]);

  const extractShortCode = (codeOrLink: string): string => {
    // Extract short code from link or use code directly
    const linkMatch = codeOrLink.match(/\/code\/([A-Z0-9]+)/i);
    if (linkMatch) {
      return linkMatch[1].toUpperCase();
    }
    // Remove any whitespace and convert to uppercase
    return codeOrLink.trim().toUpperCase();
  };

  const handleJoinEvent = async () => {
    // Check if user is authenticated
    if (!backendUser) {
      Alert.alert(
        'Authentication Required',
        'Please sign in to join events. This helps us keep track of your events and provide a better experience.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Sign In',
            onPress: () => {
              const shortCode = eventCode.trim()
                ? extractShortCode(eventCode)
                : undefined;
              navigation.navigate('Login', {
                returnTo: 'JoinEvent',
                eventCode: shortCode,
              });
            },
          },
          {
            text: 'Sign Up',
            style: 'default',
            onPress: () => {
              const shortCode = eventCode.trim()
                ? extractShortCode(eventCode)
                : undefined;
              navigation.navigate('SignUp', {
                returnTo: 'JoinEvent',
                eventCode: shortCode,
              });
            },
          },
        ],
      );
      return;
    }

    if (!eventCode.trim()) {
      Alert.alert('Validation Error', 'Please enter an event code');
      return;
    }

    setIsJoining(true);

    try {
      const shortCode = extractShortCode(eventCode);

      // First, get the event by short code to get the event ID
      const eventResponse = await eventService.getEventByShortCode(shortCode);

      if (!eventResponse.success || !eventResponse.data) {
        Alert.alert(
          'Error',
          eventResponse.message ||
            'Event not found. Please check the code and try again.',
        );
        setIsJoining(false);
        return;
      }

      const eventId = eventResponse.data.id;

      // Join the event - user must be authenticated
      const joinData = {
        eventId,
        userId: backendUser.id,
      };

      const joinResponse = await guestService.joinEvent(joinData);

      if (joinResponse.success) {
        // Clear event cache to refresh data
        eventService.clearCache(eventId);
        guestService.clearCache('my-events');

        // Navigate to event details page
        const eventData = eventResponse.data;
        const startDate = new Date(eventData.startDate);
        const frontendEvent = {
          id: eventData.id,
          shortCode: eventData.shortCode,
          title: eventData.name,
          date: dayjs(startDate).format('MMM D, YYYY'),
          location: eventData.location || 'Location TBA',
          attendees: eventData._count?.guestEvents || 0,
          attendeesAvatars: [], // Will be populated by EventDetailsScreen
          startTime: dayjs(startDate).format('h:mm A'),
          endTime: eventData.endDate
            ? dayjs(new Date(eventData.endDate)).format('h:mm A')
            : undefined,
        };

        Alert.alert('Success', 'You have joined the event!', [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to event details
              navigation.navigate('EventDetails', { event: frontendEvent });
            },
          },
        ]);
      } else {
        // Handle different error cases
        const errorMessage =
          joinResponse.message || joinResponse.error || 'Failed to join event';

        // Check for specific error types
        if (
          errorMessage.includes('already joined') ||
          errorMessage.includes('already exists')
        ) {
          Alert.alert('Already Joined', 'You have already joined this event.');
        } else if (
          errorMessage.includes('private') ||
          errorMessage.includes('Private')
        ) {
          Alert.alert(
            'Private Event',
            'This event is private and requires an invitation.',
          );
        } else if (
          errorMessage.includes('not found') ||
          errorMessage.includes('Not found')
        ) {
          Alert.alert(
            'Event Not Found',
            'The event could not be found. Please check the code and try again.',
          );
        } else {
          Alert.alert('Error', errorMessage);
        }
      }
    } catch (error: any) {
      console.error('Error joining event:', error);
      const errorMessage =
        error.message || 'Failed to join event. Please try again.';

      // Handle network errors
      if (
        errorMessage.includes('Network') ||
        errorMessage.includes('timeout')
      ) {
        Alert.alert(
          'Network Error',
          'Please check your internet connection and try again.',
        );
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <ScreenLayout backgroundColor={Colors.backgroundLight}>
      <ScreenHeader title="Join Event" onBack={onBack} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Form */}
          <View style={styles.formContainer}>
            {/* Event Code Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Event Code or Link</Text>
              <View style={styles.codeInputContainer}>
                <TextInput
                  placeholder="Enter code or paste link"
                  value={eventCode}
                  onChangeText={setEventCode}
                  autoCapitalize="none"
                  containerStyle={styles.codeInput}
                />
                <TouchableOpacity
                  style={styles.qrIconButton}
                  onPress={onScanQR || (() => {})}
                  activeOpacity={0.7}
                >
                  <FontAwesome6
                    name="qrcode"
                    size={22}
                    color={Colors.primary}
                    iconStyle="solid"
                  />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.dividerContainer}>
              <Text style={styles.dividerText}>or</Text>
            </View>
            {/* Scan QR Button */}
            <TouchableOpacity
              style={styles.scanQRButton}
              onPress={onScanQR || (() => {})}
              activeOpacity={0.7}
            >
              <FontAwesome6
                name="camera"
                size={20}
                color={Colors.textSecondary}
                iconStyle="solid"
              />
              <Text style={styles.scanQRText}>Scan QR Code from Camera</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Floating Join Button */}
      <FloatingActionButton
        title={isJoining ? 'Joining...' : 'Join Event'}
        onPress={handleJoinEvent}
        disabled={isJoining}
        icon={
          isJoining ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : undefined
        }
      />
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  formContainer: {
    flex: 1,
  },
  inputWrapper: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  codeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  codeInput: {
    flex: 1,
    marginBottom: 0,
  },
  qrIconButton: {
    position: 'absolute',
    right: Spacing.md,
    padding: Spacing.sm,
  },
  dividerContainer: {
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  dividerText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  scanQRButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    gap: Spacing.sm,
  },
  scanQRText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});
