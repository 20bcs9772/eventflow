import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  HomeScreen,
  CalendarScreen,
  AnnouncementsScreen,
  SettingsScreen,
} from '../screens';
import { Colors } from '../constants/colors';
import {
  HomeIcon,
  EventIcon,
  AnnouncementsIcon,
  ProfileIcon,
} from '../components/icons/TabIcons';

const Tab = createBottomTabNavigator();

export const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1A1A1A', // Very dark grey/black to match design
          borderTopWidth: 0,
          borderRadius: 28, // Rounded on all corners for floating effect
          height: 70,
          paddingBottom: 12,
          paddingTop: 12,
          paddingHorizontal: 20,
          marginBottom: 16, // Spacing from bottom of screen
          marginHorizontal: 16, // Spacing from sides
          elevation: 8, // Shadow for floating effect (Android)
          shadowColor: '#000', // Shadow for floating effect (iOS)
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: Colors.text,
        tabBarInactiveTintColor: Colors.white,
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreenWrapper}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIconContainer focused={focused}>
              <HomeIcon focused={focused} size={22} />
            </TabIconContainer>
          ),
        }}
      />
      <Tab.Screen
        name="Event"
        component={CalendarScreenWrapper}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIconContainer focused={focused}>
              <EventIcon focused={focused} size={22} />
            </TabIconContainer>
          ),
        }}
      />
      <Tab.Screen
        name="Announcements"
        component={AnnouncementsScreenWrapper}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIconContainer focused={focused}>
              <AnnouncementsIcon focused={focused} size={22} />
            </TabIconContainer>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={SettingsScreenWrapper}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIconContainer focused={focused}>
              <ProfileIcon focused={focused} size={22} />
            </TabIconContainer>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Wrapper components to handle navigation
const HomeScreenWrapper = ({ navigation }: any) => {
  return (
    <HomeScreen
      onNavigate={(route) => {
        navigation.navigate(route);
      }}
    />
  );
};

const CalendarScreenWrapper = ({ navigation }: any) => {
  return (
    <CalendarScreen
      onNavigate={(route) => {
        navigation.navigate(route);
      }}
    />
  );
};

const AnnouncementsScreenWrapper = ({ navigation }: any) => {
  return (
    <AnnouncementsScreen
      onNavigate={(route) => {
        navigation.navigate(route);
      }}
    />
  );
};

const SettingsScreenWrapper = ({ navigation }: any) => {
  return (
    <SettingsScreen
      onNavigate={(route) => {
        navigation.navigate(route);
      }}
    />
  );
};

// Tab icon container with white circle for active state
const TabIconContainer: React.FC<{
  focused: boolean;
  children: React.ReactNode;
}> = ({ focused, children }) => {
  return (
    <View
      style={[
        styles.tabIconContainer,
        focused && styles.tabIconContainerFocused,
      ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  tabIconContainer: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconContainerFocused: {
    backgroundColor: Colors.white,
    borderRadius: 22,
  },
});

