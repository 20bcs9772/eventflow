import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WelcomeScreen, EventDetailsScreen, CreateEventScreen, SearchResultsScreen, AddScheduleBlockScreen, AddVenueScreen, InvitePeopleScreen } from '../screens';
import { MainTabNavigator } from './MainTabNavigator';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Welcome">
            {() => (
              <WelcomeScreen
                onJoinEvent={() => setIsAuthenticated(true)}
                onSignIn={() => setIsAuthenticated(true)}
              />
            )}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen name="EventDetails" component={EventDetailsScreen} />
            <Stack.Screen name="CreateEvent" component={CreateEventScreen} />
            <Stack.Screen name="SearchResults" component={SearchResultsScreen} />
            <Stack.Screen name="AddScheduleBlock" component={AddScheduleBlockScreen} />
            <Stack.Screen name="AddVenue" component={AddVenueScreen} />
            <Stack.Screen name="InvitePeople" component={InvitePeopleScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

