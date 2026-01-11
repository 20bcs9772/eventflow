import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../constants/colors';
import { Spacing, FontSizes } from '../constants/spacing';

interface FloatingActionButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  style,
  textStyle,
  icon,
}) => {
  const getButtonStyle = () => {
    const baseStyle: ViewStyle = {
      backgroundColor: Colors.primary,
      height: 56,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      gap: Spacing.sm,
      shadowColor: Colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 8,
    };

    if (variant === 'secondary') {
      baseStyle.backgroundColor = Colors.white;
      baseStyle.borderWidth = 1.5;
      baseStyle.borderColor = Colors.primary;
    } else if (variant === 'danger') {
      baseStyle.backgroundColor = Colors.red;
    } else {
      baseStyle.backgroundColor = Colors.primary;
    }

    if (disabled) {
      baseStyle.backgroundColor = '#D1D5DB';
      baseStyle.opacity = 0.6;
    }

    return [baseStyle, style];
  };

  const getTextStyle = () => {
    const baseStyle: TextStyle = {
      color: variant === 'secondary' ? Colors.primary : Colors.white,
      fontSize: FontSizes.lg,
      fontWeight: '700',
    };

    if (disabled) {
      baseStyle.color = Colors.white;
    }

    return [baseStyle, textStyle];
  };

  return (
    <View style={styles.container}>
      <View style={styles.gradientBackground} />
      <TouchableOpacity
        style={getButtonStyle()}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator
            color={variant === 'secondary' ? Colors.primary : Colors.white}
          />
        ) : (
          <>
            {icon}
            <Text style={getTextStyle()}>{title}</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 24,
    backgroundColor: 'transparent',
    zIndex: 1000,
  },
  gradientBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: Colors.backgroundLight,
    opacity: 0.95,
  },
});
