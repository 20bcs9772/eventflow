import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import {
  ScreenLayout,
  ScreenHeader,
  FloatingActionButton,
} from '../components';
import { Colors } from '../constants/colors';
import { Spacing, FontSizes } from '../constants/spacing';
import { RootStackParamList } from '../types';
import { announcementService } from '../services';
import { useAuth } from '../context/AuthContext';

type CreateAnnouncementRouteProp = RouteProp<
  RootStackParamList,
  'CreateAnnouncement'
>;

export const CreateAnnouncementScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<CreateAnnouncementRouteProp>();
  const { eventId } = route.params;
  const { backendUser } = useAuth();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendAnnouncement = async () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter an announcement title');
      return;
    }

    if (!message.trim()) {
      Alert.alert('Validation Error', 'Please enter a message');
      return;
    }

    if (!backendUser?.id) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setIsSending(true);

    try {
      const response = await announcementService.createAnnouncement({
        eventId,
        title: title.trim(),
        message: message.trim(),
        senderId: backendUser.id,
      });

      if (response.success) {
        Alert.alert('Success', 'Announcement sent successfully!', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert('Error', response.message || 'Failed to send announcement');
      }
    } catch (error: any) {
      console.error('Error sending announcement:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to send announcement. Please try again.',
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <ScreenLayout backgroundColor={Colors.backgroundLight}>
      <ScreenHeader title="Create Announcement" backIcon="arrow-left" />
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Subtitle */}
          <Text style={styles.subtitle}>Event Companion</Text>

          {/* Announcement Title */}
          <View style={styles.section}>
            <Text style={styles.label}>Announcement Title</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="e.g., Gate Opening Soon"
                placeholderTextColor={Colors.textLight}
                value={title}
                onChangeText={setTitle}
              />
            </View>
          </View>

          {/* Your Message */}
          <View style={styles.section}>
            <Text style={styles.label}>Your Message</Text>
            <View style={[styles.inputContainer, styles.textAreaContainer]}>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Write your announcement here..."
                placeholderTextColor={Colors.textLight}
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Information Text */}
          <View style={styles.infoContainer}>
            <FontAwesome6
              name="circle-info"
              size={16}
              color={Colors.textSecondary}
              iconStyle="solid"
            />
            <Text style={styles.infoText}>
              This message will be sent as a push notification to all the guests
              and added to the Activity feed.
            </Text>
          </View>
        </ScrollView>

        {/* Send Announcement Button */}
        <FloatingActionButton
          title={isSending ? 'Sending...' : 'Send Announcement'}
          onPress={handleSendAnnouncement}
          disabled={!title.trim() || !message.trim() || isSending}
          icon={
            isSending ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <FontAwesome6
                name="paper-plane"
                size={18}
                color={Colors.white}
                iconStyle="solid"
              />
            )
          }
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
  subtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
    fontWeight: '500',
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
    minHeight: 150,
  },
  textArea: {
    height: 150,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
