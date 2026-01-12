import React from 'react';
import { ViewStyle } from 'react-native';
import { ShimmerEffect } from './ShimmerEffect';
import { Colors } from '../../constants/colors';

interface SkeletonBoxProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * Generic skeleton box component
 */
export const SkeletonBox: React.FC<SkeletonBoxProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}) => {
  return (
    <ShimmerEffect
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: Colors.backgroundLight,
        },
        style,
      ]}
      backgroundColor="rgba(107, 70, 193, 0.08)"
      shimmerColor="rgba(255, 255, 255, 0.4)"
    />
  );
};
