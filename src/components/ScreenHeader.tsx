import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { Colors } from '../constants/colors';
import { Spacing, BorderRadius, FontSizes } from '../constants/spacing';
import { useNavigation } from '@react-navigation/native';

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  rightAction?: {
    icon?: string;
    text?: string;
    onPress: () => void;
    iconStyle?: 'solid' | 'regular' | 'light' | 'thin' | 'duotone';
  };
  backIcon?: 'chevron-left' | 'arrow-left';
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  onBack,
  rightAction,
  backIcon = 'chevron-left',
}) => {
  const navigation = useNavigation<any>();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={handleBack}
        activeOpacity={0.7}
      >
        <FontAwesome6
          name={backIcon}
          size={20}
          color={Colors.text}
          iconStyle="solid"
        />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      {rightAction ? (
        <TouchableOpacity
          style={rightAction.text ? styles.rightTextButton : styles.rightButton}
          onPress={rightAction.onPress}
          activeOpacity={0.7}
        >
          {rightAction.text ? (
            <Text style={styles.rightButtonText}>{rightAction.text}</Text>
          ) : (
            <FontAwesome6
              name={rightAction.icon as any}
              size={18}
              color={Colors.text}
              iconStyle={(rightAction.iconStyle as any) || 'solid'}
            />
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.headerSpacer} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    minHeight: 56,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: Colors.text,
  },
  headerSpacer: {
    width: 44,
  },
  rightButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightTextButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightButtonText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});
