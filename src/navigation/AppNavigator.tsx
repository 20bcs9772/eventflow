import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  WelcomeScreen,
  LoginScreen,
  SignUpScreen,
  ForgotPasswordScreen,
  EmailVerificationScreen,
  AddScheduleBlockScreen,
  AddVenueScreen,
  CreateEventScreen,
  EventDetailsScreen,
  InvitePeopleScreen,
  SearchResultsScreen,
} from '../screens';
import { MainTabNavigator } from './MainTabNavigator';
import { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Welcome">
              {({ navigation }) => (
                <WelcomeScreen
                  onJoinEvent={() => setIsAuthenticated(true)}
                  onSignIn={() => navigation.navigate('Login')}
                />
              )}
            </Stack.Screen>

            <Stack.Screen name="Login">
              {({ navigation }) => (
                <LoginScreen
                  onLogin={() =>
                    navigation.navigate('EmailVerification', {
                      email: 'user@example.com',
                    })
                  }
                  onSignUp={() => navigation.navigate('SignUp')}
                  onForgotPassword={() => navigation.navigate('ForgotPassword')}
                />
              )}
            </Stack.Screen>

            <Stack.Screen name="SignUp">
              {({ navigation }) => (
                <SignUpScreen
                  onSignUp={() =>
                    navigation.navigate('EmailVerification', {
                      email: 'user@example.com',
                    })
                  }
                  onLogin={() => navigation.navigate('Login')}
                />
              )}
            </Stack.Screen>

            <Stack.Screen name="ForgotPassword">
              {({ navigation }) => (
                <ForgotPasswordScreen
                  onSendEmail={() => navigation.navigate('Login')}
                  onBack={() => navigation.navigate('Login')}
                />
              )}
            </Stack.Screen>

            <Stack.Screen name="EmailVerification">
              {({ navigation, route }) => (
                <EmailVerificationScreen
                  email={route.params?.email}
                  onVerify={() => setIsAuthenticated(true)}
                  onResend={() => console.log('Resend code')}
                  onBack={() => navigation.goBack()}
                />
              )}
            </Stack.Screen>
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen name="EventDetails" component={EventDetailsScreen} />
            <Stack.Screen name="CreateEvent" component={CreateEventScreen} />
            <Stack.Screen
              name="SearchResults"
              component={SearchResultsScreen}
            />
            <Stack.Screen
              name="AddScheduleBlock"
              component={AddScheduleBlockScreen}
            />
            <Stack.Screen name="AddVenue" component={AddVenueScreen} />
            <Stack.Screen name="InvitePeople" component={InvitePeopleScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
