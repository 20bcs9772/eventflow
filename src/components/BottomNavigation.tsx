import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Colors } from '../constants/colors';
import { Spacing, BorderRadius } from '../constants/spacing';

interface BottomNavigationProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentRoute,
  onNavigate,
}) => {
  const tabs = [
    { key: 'Home', icon: '🏠', label: 'Home' },
    { key: 'Calendar', icon: '📅', label: 'Calendar' },
    { key: 'Announcements', icon: '🔔', label: 'Announcements' },
    { key: 'Profile', icon: '👤', label: 'Profile' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = currentRoute === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => onNavigate(tab.key)}
            activeOpacity={0.7}>
            <View
              style={[
                styles.iconContainer,
                isActive && styles.iconContainerActive,
              ]}>
              <Text style={styles.icon}>{tab.icon}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.navigationBar,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.full,
  },
  iconContainerActive: {
    backgroundColor: Colors.primary,
  },
  icon: {
    fontSize: 20,
  },
});

