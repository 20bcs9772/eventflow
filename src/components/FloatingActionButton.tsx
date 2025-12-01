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
import { Spacing, FontSizes, BorderRadius } from '../constants/spacing';

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
      borderRadius: BorderRadius.full,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      gap: Spacing.sm,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 8,
    };

    if (variant === 'secondary') {
      baseStyle.backgroundColor = Colors.white;
      baseStyle.borderWidth = 1.5;
      baseStyle.borderColor = Colors.primary;
    } else if (variant === 'danger') {
      baseStyle.backgroundColor = Colors.red;
    }

    if (disabled) {
      baseStyle.backgroundColor = Colors.textLight;
      baseStyle.opacity = 0.5;
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
      <TouchableOpacity
        style={getButtonStyle()}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color={variant === 'secondary' ? Colors.primary : Colors.white} />
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
    bottom: Spacing.lg,
    left: Spacing.lg,
    right: Spacing.lg,
    zIndex: 1000,
  },
});

