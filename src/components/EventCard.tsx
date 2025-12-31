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
            <View style={styles.fullGradientOverlay} />
            <View style={styles.titleContainer}>
              <Text style={styles.largeTitle}>{event.title}</Text>
            </View>
            <View style={styles.contentContainer}>
              <View style={styles.largeInfo}>
                <View style={styles.largeInfoRow}>
                  <FontAwesome6
                    name="calendar-day"
                    color={Colors.white}
                    size={20}
                    iconStyle="solid"
                  />
                  <Text style={styles.largeInfoText}>{event.date}</Text>
                </View>

                <View style={styles.largeInfoRow}>
                  <FontAwesome6
                    name="map-location"
                    color={Colors.white}
                    size={20}
                    iconStyle="solid"
                  />
                  <Text style={styles.largeInfoText}>{event.location}</Text>
                </View>
              </View>
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
        {event.portraitImage ? (
          <Image
            source={{ uri: event.portraitImage }}
            style={styles.smallImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.smallImagePlaceholder}>
            <FontAwesome6
              name="image"
              size={24}
              color={Colors.textLight}
              iconStyle="solid"
            />
          </View>
        )}
      </View>

      <View style={styles.smallContent}>
        <Text style={styles.smallTitle} numberOfLines={1}>
          {event.title}
        </Text>
        <Text style={styles.smallDate}>{event.date}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  largeCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    height: 300,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  largeImage: { width: '100%', height: '100%' },
  largeImageStyle: { borderRadius: BorderRadius.lg },
  largeOverlay: {
    flex: 1,
    position: 'relative',
  },
  fullGradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 1,
  },
  titleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
    paddingTop: Spacing.md,
    zIndex: 2,
  },
  contentContainer: {
    flex: 1,
    padding: Spacing.lg,
    justifyContent: 'flex-end',
    paddingBottom: Spacing.xl,
    zIndex: 2,
  },
  largeTitle: {
    fontSize: FontSizes.xxxl,
    fontWeight: '800',
    color: Colors.white,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
    letterSpacing: -0.5,
  },
  largeInfo: { 
    gap: Spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 0,
  },
  largeInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  largeInfoText: { 
    fontSize: FontSizes.md, 
    color: Colors.white,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  smallCard: {
    width: 170,
    borderRadius: 20,
    backgroundColor: Colors.cardBackground,
    overflow: 'hidden',
    marginRight: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },

  smallImageContainer: {
    width: '100%',
    height: 160,
  },

  smallImage: {
    width: '100%',
    height: '100%',
  },

  smallImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  smallContent: {
    padding: Spacing.md,
  },

  smallTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
    letterSpacing: -0.2,
  },

  smallDate: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});
