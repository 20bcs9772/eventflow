import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SkeletonBox } from './SkeletonBox';
import { SkeletonText } from './SkeletonText';
import { Spacing } from '../../constants/spacing';
import { Colors } from '../../constants/colors';

interface AnnouncementItemSkeletonProps {
  showDivider?: boolean;
}

/**
 * Announcement item skeleton component
 */
export const AnnouncementItemSkeleton: React.FC<
  AnnouncementItemSkeletonProps
> = ({ showDivider = true }) => {
  return (
    <View
      style={[styles.container, showDivider && styles.containerWithDivider]}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <SkeletonBox width="60%" height={18} />
          <SkeletonBox width={8} height={8} borderRadius={4} />
        </View>
        <SkeletonBox width={60} height={14} />
      </View>
      <View style={styles.eventNameContainer}>
        <SkeletonBox width="40%" height={14} />
      </View>
      <View style={styles.messageContainer}>
        <SkeletonText width="100%" height={16} lines={2} spacing={6} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    backgroundColor: Colors.white,
  },
  containerWithDivider: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.sm,
    gap: Spacing.xs,
  },
  eventNameContainer: {
    marginBottom: Spacing.xs,
  },
  messageContainer: {
    marginTop: Spacing.xs,
  },
});
