import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { Colors } from '../constants/colors';
import { Spacing, BorderRadius, FontSizes } from '../constants/spacing';
import { Event } from '../types';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { useNavigation } from '@react-navigation/native';

interface EventCardProps {
  event: Event;
  onPress?: () => void;
  variant?: 'large' | 'small';
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onPress,
  variant = 'large',
}) => {
  const navigation = useNavigation<any>();

  // Default navigation if onPress not provided
  const handlePress = () => {
    if (onPress) return onPress();

    navigation.navigate('EventDetails', { event });
  };

  if (variant === 'large') {
    return (
      <TouchableOpacity
        style={styles.largeCard}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <ImageBackground
          source={
            event.coverImage
              ? { uri: event.coverImage }
              : {
                  uri: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80',
                }
          }
          style={styles.largeImage}
          imageStyle={styles.largeImageStyle}
        >
          <View style={styles.largeOverlay}>
            <Text style={styles.largeTitle}>{event.title}</Text>

            <View style={styles.largeInfo}>
              <View style={styles.largeInfoRow}>
                <FontAwesome6
                  name="calendar-day"
                  color={Colors.background}
                  size={20}
                  iconStyle="solid"
                />
                <Text style={styles.largeInfoText}>{event.date}</Text>
              </View>

              <View style={styles.largeInfoRow}>
                <FontAwesome6
                  name="map-location"
                  color={Colors.background}
                  size={20}
                  iconStyle="solid"
                />
                <Text style={styles.largeInfoText}>{event.location}</Text>
              </View>
            </View>

            <View style={styles.largeFooter}>
              <View style={styles.attendeesContainer}>
                {event.attendeesAvatars?.slice(0, 3).map((avatar, index) => (
                  <View
                    key={index}
                    style={[styles.avatar, { marginLeft: index > 0 ? -8 : 0 }]}
                  >
                    <View style={styles.avatarPlaceholder} />
                  </View>
                ))}
                {event.attendees && event.attendees > 3 && (
                  <View style={[styles.avatar, styles.avatarMore]}>
                    <Text style={styles.avatarMoreText}>
                      {event.attendees - 3}+
                    </Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={styles.joinButton}
                activeOpacity={0.7}
                onPress={e => {
                  e.stopPropagation();
                  handlePress();
                }}
              >
                <Text style={styles.joinButtonText}>View</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.smallCard}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.smallImageContainer}>
        {event.image ? (
          <Image
            source={{ uri: event.image }}
            style={styles.smallImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.smallImagePlaceholder}>
            <Text style={styles.smallImageIcon}>🎂</Text>
          </View>
        )}
      </View>

      <View style={styles.smallContent}>
        <Text style={styles.smallTitle}>{event.title}</Text>
        <Text style={styles.smallDate}>{event.date}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  largeCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    height: 280,
  },
  largeImage: { width: '100%', height: '100%' },
  largeImageStyle: { borderRadius: BorderRadius.lg },
  largeOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: Spacing.lg,
    justifyContent: 'space-between',
  },
  largeTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: Spacing.sm,
  },
  largeInfo: { gap: Spacing.xs },
  largeInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  largeInfoText: { fontSize: FontSizes.md, color: Colors.white },
  largeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attendeesContainer: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: Colors.white,
    backgroundColor: Colors.primaryLight,
    overflow: 'hidden',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.primaryLight,
  },
  avatarMore: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarMoreText: {
    fontSize: FontSizes.xs,
    color: Colors.white,
    fontWeight: '600',
  },
  joinButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  joinButtonText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  smallCard: {
    width: 170,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.cardBackground,
    overflow: 'hidden',
    marginRight: Spacing.md,
  },
  smallImageContainer: { width: '100%', height: 120 },
  smallImage: { width: '100%', height: '100%' },
  smallImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallImageIcon: { fontSize: 40 },
  smallContent: { padding: Spacing.md },
  smallTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  smallDate: { fontSize: FontSizes.sm, color: Colors.textSecondary },
});
