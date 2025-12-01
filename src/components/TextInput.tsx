import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput as RNTextInput,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { Colors } from '../constants/colors';
import { Spacing, BorderRadius, FontSizes } from '../constants/spacing';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';

interface CustomTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: string;
  containerStyle?: ViewStyle;
  isPassword?: boolean;
}

export const TextInput: React.FC<CustomTextInputProps> = ({
  label,
  error,
  icon,
  containerStyle,
  isPassword = false,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
        ]}>
        {icon && (
          <View style={styles.iconContainer}>
            <FontAwesome6
              name={icon}
              size={18}
              color={error ? Colors.red : isFocused ? Colors.primary : Colors.textSecondary}
            />
          </View>
        )}
        <RNTextInput
          style={[styles.input, icon && styles.inputWithIcon]}
          placeholderTextColor={Colors.textLight}
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
            activeOpacity={0.7}>
            <FontAwesome6
              name={showPassword ? 'eye' : 'eye-slash'}
              size={18}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    minHeight: 52,
  },
  inputContainerFocused: {
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
  },
  inputContainerError: {
    borderColor: Colors.red,
  },
  iconContainer: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.text,
    paddingVertical: Spacing.md,
  },
  inputWithIcon: {
    paddingLeft: 0,
  },
  eyeIcon: {
    padding: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  errorText: {
    fontSize: FontSizes.xs,
    color: Colors.red,
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
});
