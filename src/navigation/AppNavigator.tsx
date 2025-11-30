import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WelcomeScreen } from '../screens';
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
          <Stack.Screen name="Main" component={MainTabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

