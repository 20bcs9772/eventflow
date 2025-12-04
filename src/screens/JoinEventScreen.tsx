import React, { useState } from 'react';
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
import { FloatingActionButton, TextInput, ScreenLayout } from '../components';
import { Colors } from '../constants/colors';
import { Spacing, BorderRadius, FontSizes } from '../constants/spacing';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { eventService, guestService } from '../services';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

interface JoinEventScreenProps {
  onJoinEvent?: (code: string, name: string) => void;
  onScanQR?: () => void;
  onBack?: () => void;
}

export const JoinEventScreen: React.FC<JoinEventScreenProps> = ({
  onJoinEvent,
  onScanQR,
  onBack,
}) => {
  const navigation = useNavigation<any>();
  const { backendUser } = useAuth();
  const [eventCode, setEventCode] = useState('');
  const [name, setName] = useState(backendUser?.name || '');
  const [isJoining, setIsJoining] = useState(false);

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
        Alert.alert('Error', eventResponse.message || 'Event not found. Please check the code and try again.');
        setIsJoining(false);
        return;
      }

      const eventId = eventResponse.data.id;

      // Join the event
      const joinData: any = {
        eventId,
      };

      // Add name if provided and user is not authenticated
      if (!backendUser && name.trim()) {
        joinData.name = name.trim();
      } else if (backendUser) {
        joinData.userId = backendUser.id;
      }

      const joinResponse = await guestService.joinEvent(joinData);

      if (joinResponse.success) {
        Alert.alert('Success', 'You have joined the event!', [
          {
            text: 'OK',
            onPress: () => {
              if (onBack) {
                onBack();
              } else {
                navigation.goBack();
              }
            },
          },
        ]);
      } else {
        Alert.alert('Error', joinResponse.message || 'Failed to join event');
      }
    } catch (error: any) {
      console.error('Error joining event:', error);
      Alert.alert('Error', error.message || 'Failed to join event. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <ScreenLayout backgroundColor={Colors.background}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={onBack || (() => navigation.goBack())}
              activeOpacity={0.7}
            >
              <FontAwesome6
                name="chevron-left"
                size={20}
                color={Colors.text}
                iconStyle="solid"
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Join Event</Text>
            <View style={styles.headerSpacer} />
          </View>

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

            {/* Name Input */}
            <TextInput
              label="Your Name"
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
            />

            {/* Divider */}
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
        icon={isJoining ? <ActivityIndicator color={Colors.white} size="small" /> : undefined}
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
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
    marginVertical: Spacing.xl,
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

