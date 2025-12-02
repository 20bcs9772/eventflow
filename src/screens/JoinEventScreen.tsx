import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { FloatingActionButton, TextInput, ScreenLayout } from '../components';
import { Colors } from '../constants/colors';
import { Spacing, BorderRadius, FontSizes } from '../constants/spacing';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';

interface JoinEventScreenProps {
  onJoinEvent: (code: string, name: string) => void;
  onScanQR: () => void;
  onBack: () => void;
}

export const JoinEventScreen: React.FC<JoinEventScreenProps> = ({
  onJoinEvent,
  onScanQR,
  onBack,
}) => {
  const [eventCode, setEventCode] = useState('');
  const [name, setName] = useState('');

  const handleJoinEvent = () => {
    onJoinEvent(eventCode, name);
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
              onPress={onBack}
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
                  onPress={onScanQR}
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
              onPress={onScanQR}
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
        title="Join Event"
        onPress={handleJoinEvent}
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

