import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

interface IconProps {
  focused?: boolean;
  size?: number;
}

export const HomeIcon: React.FC<IconProps> = ({ focused = false, size = 24 }) => {
  const iconColor = focused ? Colors.text : Colors.white;
  
  return (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
      {/* Three horizontal lines with vertical line (W/menu icon) */}
      <View style={styles.menuContainer}>
        <View style={[styles.menuLine, { backgroundColor: iconColor }]} />
        <View style={[styles.menuLine, { backgroundColor: iconColor }]} />
        <View style={[styles.menuLine, { backgroundColor: iconColor }]} />
        <View style={[styles.menuVertical, { backgroundColor: iconColor }]} />
      </View>
    </View>
  );
};

export const EventIcon: React.FC<IconProps> = ({ focused = false, size = 24 }) => {
  const iconColor = focused ? Colors.text : Colors.white;
  
  return (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
      {/* 3x3 Grid of dots */}
      <View style={styles.grid3x3}>
        {[...Array(9)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.gridDot3x3,
              { backgroundColor: focused ? Colors.white : iconColor },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

export const AnnouncementsIcon: React.FC<IconProps> = ({ focused = false, size = 24 }) => {
  const iconColor = focused ? Colors.text : Colors.white;
  
  return (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
      {/* Circular arrow/refresh icon with dot */}
      <View style={styles.refreshContainer}>
        <View style={[styles.refreshArc, { borderColor: iconColor }]}>
          <View style={[styles.refreshArrowHead, { borderColor: iconColor }]} />
        </View>
        <View
          style={[
            styles.refreshDot,
            { backgroundColor: focused ? Colors.white : iconColor },
          ]}
        />
      </View>
    </View>
  );
};

export const ProfileIcon: React.FC<IconProps> = ({ focused = false, size = 24 }) => {
  const iconColor = focused ? Colors.text : Colors.white;
  
  return (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
      {/* Profile/Person icon */}
      <View style={styles.profileContainer}>
        <View style={[styles.profileHead, { borderColor: iconColor }]} />
        <View style={[styles.profileBody, { borderColor: iconColor }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Home icon styles - three horizontal lines with vertical line
  menuContainer: {
    width: 14,
    height: 14,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLine: {
    width: 10,
    height: 1.5,
    marginVertical: 2,
  },
  menuVertical: {
    width: 1.5,
    height: 10,
    position: 'absolute',
    left: 6.25,
  },
  // Event icon styles - 3x3 grid
  grid3x3: {
    width: 14,
    height: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'space-between',
  },
  gridDot3x3: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  // Announcements icon styles - circular arrow/refresh with dot
  refreshContainer: {
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  refreshArc: {
    width: 10,
    height: 10,
    borderWidth: 1.5,
    borderRadius: 5,
    borderTopWidth: 0,
    borderRightWidth: 0,
    position: 'relative',
    transform: [{ rotate: '-45deg' }],
  },
  refreshArrowHead: {
    width: 0,
    height: 0,
    borderLeftWidth: 2.5,
    borderRightWidth: 0,
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    position: 'absolute',
    top: -2,
    right: -1,
    transform: [{ rotate: '45deg' }],
  },
  refreshDot: {
    width: 2.5,
    height: 2.5,
    borderRadius: 1.25,
    position: 'absolute',
    bottom: 0,
    right: 2,
  },
  // Profile/Person icon styles
  profileContainer: {
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileHead: {
    width: 6,
    height: 6,
    borderWidth: 1.5,
    borderRadius: 3,
    marginBottom: 1,
  },
  profileBody: {
    width: 10,
    height: 6,
    borderWidth: 1.5,
    borderRadius: 5,
    borderTopWidth: 0,
  },
});

