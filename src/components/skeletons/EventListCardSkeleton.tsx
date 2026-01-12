import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SkeletonBox } from './SkeletonBox';
import { ImageSkeleton } from './ImageSkeleton';
import { Spacing, BorderRadius } from '../../constants/spacing';
import { Colors } from '../../constants/colors';

/**
 * Event list card skeleton component
 */
export const EventListCardSkeleton: React.FC = () => {
  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <ImageSkeleton
          width={120}
          height={120}
          borderRadius={BorderRadius.md}
        />
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.topRow}>
          <SkeletonBox
            width={60}
            height={20}
            borderRadius={BorderRadius.full}
          />
          <SkeletonBox width={24} height={24} borderRadius={12} />
        </View>
        <View style={styles.titleContainer}>
          <SkeletonBox width="90%" height={20} />
          <SkeletonBox width="70%" height={20} style={styles.titleSpacer} />
        </View>
        <View style={styles.dateContainer}>
          <SkeletonBox width={120} height={16} />
        </View>
        <View style={styles.attendeesContainer}>
          <SkeletonBox width={80} height={14} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
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
  contentContainer: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  titleContainer: {
    marginBottom: Spacing.xs,
  },
  titleSpacer: {
    marginTop: Spacing.xs,
  },
  dateContainer: {
    marginBottom: Spacing.xs,
  },
  attendeesContainer: {
    marginTop: Spacing.xs,
  },
});
