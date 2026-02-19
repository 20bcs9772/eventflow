import React, { useState } from 'react';
import {
  ImageBackground,
  ImageBackgroundProps,
  StyleSheet,
  View,
} from 'react-native';
import { ImageSkeleton } from './ImageSkeleton';

interface SkeletonImageBackgroundProps extends ImageBackgroundProps {
  skeletonHeight?: number;
  skeletonWidth?: number | string;
  skeletonBorderRadius?: number;
}

/**
 * ImageBackground component with automatic skeleton loading state
 */
export const SkeletonImageBackground: React.FC<
  SkeletonImageBackgroundProps
> = ({
  source,
  style,
  children,
  skeletonHeight,
  skeletonWidth,
  skeletonBorderRadius,
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
      <View style={[styles.container, { width, height, borderRadius }]}>
        <ImageSkeleton width="100%" height="100%" borderRadius={borderRadius} />
        {children}
      </View>
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
          />
        </View>
      )}
      <ImageBackground
        {...props}
        source={source}
        style={[style, isLoading && styles.hidden]}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
      >
        {children}
      </ImageBackground>
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
