import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ImageSkeleton } from './ImageSkeleton';
import { SkeletonText } from './SkeletonText';
import { SkeletonBox } from './SkeletonBox';
import { Spacing, BorderRadius } from '../../constants/spacing';
import { Colors } from '../../constants/colors';

interface EventCardSkeletonProps {
  variant?: 'large' | 'small';
}

/**
 * Event card skeleton component
 */
export const EventCardSkeleton: React.FC<EventCardSkeletonProps> = ({
  variant = 'large',
}) => {
  if (variant === 'large') {
    return (
      <View style={styles.largeCard}>
        <ImageSkeleton
          width="100%"
          height={250}
          borderRadius={BorderRadius.lg}
        />
        <View style={styles.largeOverlay}>
          <View style={styles.largeContent}>
            <SkeletonBox width="80%" height={28} borderRadius={8} />
            <View style={styles.largeInfoContainer}>
              <SkeletonBox width="60%" height={20} borderRadius={8} />
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.smallCard}>
      <ImageSkeleton
        width="100%"
        height={160}
        borderRadius={0}
        borderTopLeftRadius={20}
        borderTopRightRadius={20}
      />
      <View style={styles.smallContent}>
        <SkeletonText width="90%" height={18} lines={1} />
        <View style={styles.smallSpacer} />
        <SkeletonText width="60%" height={14} lines={1} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  largeCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    height: 250,
    backgroundColor: Colors.backgroundLight,
  },
  largeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  largeContent: {
    gap: Spacing.md,
  },
  largeInfoContainer: {
    marginTop: Spacing.sm,
  },
  smallCard: {
    width: 170,
    borderRadius: 20,
    backgroundColor: Colors.cardBackground,
    overflow: 'hidden',
    marginRight: Spacing.md,
    marginBottom: Spacing.md,
  },
  smallContent: {
    padding: Spacing.md,
  },
  smallSpacer: {
    height: Spacing.xs,
  },
});
