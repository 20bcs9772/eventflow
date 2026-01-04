import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { Colors } from '../constants/colors';
import { Spacing, FontSizes, BorderRadius } from '../constants/spacing';
import { FullLocation } from '../context';

interface CurrentLocationButtonProps {
  location: FullLocation | null;
  isLoading: boolean;
  onPress: () => void;
}

export const CurrentLocationButton: React.FC<CurrentLocationButtonProps> = ({
  location,
  isLoading,
  onPress,
}) => {
  const locationText = location
    ? `${location.city || 'Unknown'}, ${location.state || ''}`.trim()
    : 'Location unavailable';

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <FontAwesome6
          name="location-crosshairs"
          size={20}
          color={Colors.primary}
          iconStyle="solid"
        />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Use my current location</Text>
        <Text style={styles.subtitle}>
          {isLoading ? 'Loading...' : locationText}
        </Text>
      </View>
      <View style={styles.chevronContainer}>
        <FontAwesome6
          name="chevron-right"
          size={14}
          color={Colors.textSecondary}
          iconStyle="solid"
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(107, 70, 193, 0.08)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(107, 70, 193, 0.15)',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  chevronContainer: {
    marginLeft: Spacing.sm,
  },
});

