import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SkeletonBox } from './SkeletonBox';
import { SkeletonText } from './SkeletonText';
import { Spacing, BorderRadius } from '../../constants/spacing';
import { Colors } from '../../constants/colors';

/**
 * Event type card skeleton component
 */
export const EventTypeCardSkeleton: React.FC = () => {
  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <SkeletonBox width={56} height={56} borderRadius={28} />
        <View style={styles.textContainer}>
          <SkeletonText width="80%" height={14} lines={2} spacing={6} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 110,
    marginRight: Spacing.md,
  },
  cardContent: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textContainer: {
    marginTop: Spacing.md,
    width: '100%',
    alignItems: 'center',
  },
});
