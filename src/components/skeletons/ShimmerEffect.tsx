import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';

interface ShimmerEffectProps {
  children: React.ReactNode;
  style?: ViewStyle;
  shimmerColor?: string;
  backgroundColor?: string;
}

/**
 * Shimmer effect component for glass-like skeleton loading
 */
export const ShimmerEffect: React.FC<ShimmerEffectProps> = ({
  children,
  style,
  shimmerColor = 'rgba(255, 255, 255, 0.3)',
  backgroundColor = 'rgba(0, 0, 0, 0.05)',
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    );

    shimmerAnimation.start();

    return () => {
      shimmerAnimation.stop();
    };
  }, [shimmerAnim]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 300],
  });

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 0.3, 0.5, 0.7, 1],
    outputRange: [0.2, 0.6, 0.9, 0.6, 0.2],
  });

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.content, { backgroundColor }]}>{children}</View>
      <Animated.View
        style={[
          styles.shimmer,
          {
            transform: [{ translateX }],
            opacity,
            backgroundColor: shimmerColor,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  content: {
    width: '100%',
    height: '100%',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '60%',
    height: '100%',
    borderRadius: 4,
  },
});
