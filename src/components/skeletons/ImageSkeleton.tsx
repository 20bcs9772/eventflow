import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { ShimmerEffect } from './ShimmerEffect';
import { Colors } from '../../constants/colors';
import { BorderRadius } from '../../constants/spacing';

interface ImageSkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  borderTopLeftRadius?: number;
  borderTopRightRadius?: number;
  borderBottomLeftRadius?: number;
  borderBottomRightRadius?: number;
  style?: ViewStyle;
  variant?: 'square' | 'rounded' | 'circle';
}

/**
 * Image skeleton component with glass-like shimmer effect
 */
export const ImageSkeleton: React.FC<ImageSkeletonProps> = ({
  width = '100%',
  height = 200,
  borderRadius,
  borderTopLeftRadius,
  borderTopRightRadius,
  borderBottomLeftRadius,
  borderBottomRightRadius,
  style,
  variant = 'square',
}) => {
  let finalBorderRadius = borderRadius;

  if (!finalBorderRadius || finalBorderRadius !== null) {
    switch (variant) {
      case 'circle':
        finalBorderRadius = typeof height === 'number' ? height / 2 : 999;
        break;
      case 'rounded':
        finalBorderRadius = BorderRadius.lg;
        break;
      default:
        finalBorderRadius = BorderRadius.md;
    }
  }

  const borderRadiusStyle: any = {};
  if (borderTopLeftRadius !== undefined) {
    borderRadiusStyle.borderTopLeftRadius = borderTopLeftRadius;
  }
  if (borderTopRightRadius !== undefined) {
    borderRadiusStyle.borderTopRightRadius = borderTopRightRadius;
  }
  if (borderBottomLeftRadius !== undefined) {
    borderRadiusStyle.borderBottomLeftRadius = borderBottomLeftRadius;
  }
  if (borderBottomRightRadius !== undefined) {
    borderRadiusStyle.borderBottomRightRadius = borderBottomRightRadius;
  }
  if (
    borderRadius !== undefined &&
    Object.keys(borderRadiusStyle).length === 0
  ) {
    borderRadiusStyle.borderRadius = finalBorderRadius;
  }

  return (
    <View style={[styles.container, { width, height }, style]}>
      <ShimmerEffect
        style={[
          styles.skeleton,
          {
            backgroundColor: Colors.backgroundLight,
            ...borderRadiusStyle,
          },
        ]}
        backgroundColor="rgba(107, 70, 193, 0.1)"
        shimmerColor="rgba(255, 255, 255, 0.5)"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  skeleton: {
    width: '100%',
    height: '100%',
  },
});
