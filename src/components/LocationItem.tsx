import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { Colors } from '../constants/colors';
import { Spacing, FontSizes } from '../constants/spacing';
import { LocationSearchResult } from '../services';

interface LocationItemProps {
  location: LocationSearchResult;
  onPress: (location: LocationSearchResult) => void;
  icon?: string;
  iconStyle?: 'solid' | 'regular' | 'light' | 'thin' | 'duotone';
  showChevron?: boolean;
}

export const LocationItem: React.FC<LocationItemProps> = ({
  location,
  onPress,
  icon = 'location-dot',
  iconStyle = 'solid',
  showChevron = true,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(location)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <FontAwesome6
          name={icon}
          size={18}
          color={Colors.textSecondary}
          iconStyle={iconStyle}
        />
      </View>
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {location.name}
        </Text>
        <Text style={styles.address} numberOfLines={1}>
          {location.fullAddress}
        </Text>
      </View>
      {showChevron && (
        <View style={styles.chevronContainer}>
          <FontAwesome6
            name="chevron-right"
            size={14}
            color={Colors.textSecondary}
            iconStyle="solid"
          />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  address: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  chevronContainer: {
    marginLeft: Spacing.sm,
  },
});

