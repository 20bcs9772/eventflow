/* eslint-disable react/no-unstable-nested-components */
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

import { FontAwesome6 } from "@react-native-vector-icons/fontawesome6";

const Tab = createBottomTabNavigator();

export const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1A1A1A',
          borderTopWidth: 0,
          borderRadius: 50,
          height: 75,
          paddingBottom: 12,
          paddingTop: 17,
          paddingHorizontal: 20,
          marginBottom: 16,
          marginHorizontal: 25,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: Colors.text,
        tabBarInactiveTintColor: Colors.white,
      }}
    >
      {/* Home */}
      <Tab.Screen
        name="Home"
        component={HomeScreenWrapper}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIconContainer focused={focused}>
              <FontAwesome6 name="house" size={22} color={color} iconStyle='solid' />
            </TabIconContainer>
          ),
        }}
      />

      {/* Event */}
      <Tab.Screen
        name="Event"
        component={CalendarScreenWrapper}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIconContainer focused={focused}>
              <FontAwesome6 name="calendar-days" size={22} color={color} />
            </TabIconContainer>
          ),
        }}
      />

      {/* Announcements */}
      <Tab.Screen
        name="Announcements"
        component={AnnouncementsScreenWrapper}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIconContainer focused={focused}>
              <FontAwesome6 name="bullhorn" size={22} color={color} iconStyle='solid' />
            </TabIconContainer>
          ),
        }}
      />

      {/* Profile */}
      <Tab.Screen
        name="Profile"
        component={SettingsScreenWrapper}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIconContainer focused={focused}>
              <FontAwesome6 name="user" size={22} color={color} />
            </TabIconContainer>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Screen wrappers
const HomeScreenWrapper = ({ navigation }) => (
  <HomeScreen onNavigate={route => navigation.navigate(route)} />
);

const CalendarScreenWrapper = ({ navigation }) => (
  <CalendarScreen onNavigate={route => navigation.navigate(route)} />
);

const AnnouncementsScreenWrapper = ({ navigation }) => (
  <AnnouncementsScreen onNavigate={route => navigation.navigate(route)} />
);

const SettingsScreenWrapper = ({ navigation }) => (
  <SettingsScreen onNavigate={route => navigation.navigate(route)} />
);

// Icon container with active circle
const TabIconContainer = ({ focused, children }) => (
  <View
    style={[styles.tabIconContainer, focused && styles.tabIconContainerFocused]}
  >
    {children}
  </View>
);

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
