import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { Colors } from '../constants/colors';
import { Spacing, BorderRadius, FontSizes } from '../constants/spacing';
import dayjs from 'dayjs';

export type EventStatus = 'Live' | 'Past' | 'Upcoming';

interface EventListCardProps {
  // Event data
  title: string;
  date: string | Date;
  attendeesCount?: number;
  imageUri?: string;
  status?: EventStatus;
  
  // Actions
  onPress?: () => void;
  onOptionsPress?: () => void;
  
  // Optional styling
  showOptions?: boolean;
}

export const EventListCard: React.FC<EventListCardProps> = ({
  title,
  date,
  attendeesCount = 0,
  imageUri,
  status,
  onPress,
  onOptionsPress,
  showOptions = true,
}) => {
  // Format date as "DD Mon, YYYY" (e.g., "24 Sep, 2024")
  const formattedDate = dayjs(date).format('DD MMM, YYYY');
  
  // Format attendees count
  const formatAttendees = (count: number): string => {
    if (count >= 500) {
      return '500+ Joined';
    }
    return `${count} Joined`;
  };

  // Determine status badge colors
  const getStatusStyle = (eventStatus?: EventStatus) => {
    switch (eventStatus) {
      case 'Live':
        return {
          backgroundColor: '#4CAF50',
          textColor: Colors.white,
        };
      case 'Past':
        return {
          backgroundColor: '#E0E0E0',
          textColor: '#757575',
        };
      case 'Upcoming':
        return {
          backgroundColor: '#BBDEFB',
          textColor: '#2196F3',
        };
      default:
        return {
          backgroundColor: '#E0E0E0',
          textColor: '#757575',
        };
    }
  };

  const statusStyle = getStatusStyle(status);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Left Section - Image Thumbnail */}
      <View style={styles.imageContainer}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <FontAwesome6
              name="calendar"
              size={24}
              color={Colors.primary}
              iconStyle="solid"
            />
          </View>
        )}
      </View>

      {/* Right Section - Event Details */}
      <View style={styles.contentContainer}>
        {/* Top Row - Status Tag and Options Icon */}
        <View style={styles.topRow}>
          {status && (
            <View
              style={[
                styles.statusTag,
                { backgroundColor: statusStyle.backgroundColor },
              ]}
            >
              <Text
                style={[styles.statusText, { color: statusStyle.textColor }]}
              >
                {status}
              </Text>
            </View>
          )}
          {showOptions && (
            <TouchableOpacity
              style={styles.optionsButton}
              onPress={(e) => {
                e.stopPropagation();
                onOptionsPress?.();
              }}
              activeOpacity={0.7}
            >
              <FontAwesome6
                name="ellipsis-vertical"
                size={16}
                color={Colors.textSecondary}
                iconStyle="solid"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Event Title */}
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>

        {/* Date */}
        <Text style={styles.date}>{formattedDate}</Text>

        {/* Attendees Count */}
        <View style={styles.attendeesRow}>
          <FontAwesome6
            name="users"
            size={14}
            color={Colors.textSecondary}
            iconStyle="solid"
          />
          <Text style={styles.attendeesText}>
            {formatAttendees(attendeesCount)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginRight: Spacing.md,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  statusTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  optionsButton: {
    padding: Spacing.xs,
  },
  title: {
    fontSize: FontSizes.md,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.xs,
    lineHeight: 20,
  },
  date: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  attendeesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  attendeesText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
});
