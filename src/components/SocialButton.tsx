import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { Colors } from '../constants/colors';
import { Spacing, BorderRadius, FontSizes } from '../constants/spacing';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';

interface SocialButtonProps {
  provider: 'google' | 'apple';
  onPress: () => void;
  style?: ViewStyle;
}

export const SocialButton: React.FC<SocialButtonProps> = ({
  provider,
  onPress,
  style,
}) => {
  const getProviderConfig = () => {
    if (provider === 'google') {
      return {
        icon: 'google',
        text: 'Continue with Google',
        backgroundColor: Colors.white,
        textColor: Colors.text,
        borderColor: Colors.border,
      };
    } else {
      return {
        icon: 'apple',
        text: 'Continue with Apple',
        backgroundColor: Colors.black,
        textColor: Colors.white,
        borderColor: Colors.black,
      };
    }
  };

  const config = getProviderConfig();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: config.backgroundColor,
          borderColor: config.borderColor,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <FontAwesome6 name={config.icon} size={20} color={config.textColor} />
        <Text style={[styles.text, { color: config.textColor }]}>
          {config.text}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    marginLeft: Spacing.md,
  },
});
