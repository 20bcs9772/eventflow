import React, { useState } from 'react';
import { Image, ImageProps, StyleSheet, View } from 'react-native';
import { ImageSkeleton } from './ImageSkeleton';

interface SkeletonImageProps extends ImageProps {
  skeletonHeight?: number;
  skeletonWidth?: number | string;
  skeletonBorderRadius?: number;
  skeletonBorderTopLeftRadius?: number;
  skeletonBorderTopRightRadius?: number;
  skeletonBorderBottomLeftRadius?: number;
  skeletonBorderBottomRightRadius?: number;
}

/**
 * Image component with automatic skeleton loading state
 */
export const SkeletonImage: React.FC<SkeletonImageProps> = ({
  source,
  style,
  skeletonHeight,
  skeletonWidth,
  skeletonBorderRadius,
  skeletonBorderTopLeftRadius,
  skeletonBorderTopRightRadius,
  skeletonBorderBottomLeftRadius,
  skeletonBorderBottomRightRadius,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // Get dimensions from style if available
  const imageStyle = StyleSheet.flatten(style);
  const width = skeletonWidth || imageStyle?.width || '100%';
  const height = skeletonHeight || imageStyle?.height || 200;
  const borderRadius = skeletonBorderRadius || imageStyle?.borderRadius || 0;

  if (hasError || !source) {
    return (
      <ImageSkeleton
        width={width}
        height={height}
        borderRadius={borderRadius}
        borderTopLeftRadius={skeletonBorderTopLeftRadius}
        borderTopRightRadius={skeletonBorderTopRightRadius}
        borderBottomLeftRadius={skeletonBorderBottomLeftRadius}
        borderBottomRightRadius={skeletonBorderBottomRightRadius}
      />
    );
  }

  return (
    <View style={[styles.container, { width, height }]}>
      {isLoading && (
        <View style={StyleSheet.absoluteFill}>
          <ImageSkeleton
            width="100%"
            height="100%"
            borderRadius={borderRadius}
            borderTopLeftRadius={skeletonBorderTopLeftRadius}
            borderTopRightRadius={skeletonBorderTopRightRadius}
            borderBottomLeftRadius={skeletonBorderBottomLeftRadius}
            borderBottomRightRadius={skeletonBorderBottomRightRadius}
          />
        </View>
      )}
      <Image
        {...props}
        source={source}
        style={[style, isLoading && styles.hidden]}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  hidden: {
    opacity: 0,
  },
});
