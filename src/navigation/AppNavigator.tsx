import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
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
  JoinEventScreen,
  JoinedEventsScreen,
  ManageEventsScreen,
} from '../screens';
import { MainTabNavigator } from './MainTabNavigator';
import { RootStackParamList } from '../types';
import { useAuth } from '../context';
import { Colors } from '../constants/colors';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  const { isAuthenticated, isLoading, backendUser, getPendingJoinAction, clearPendingJoinAction } = useAuth();
  const navigationRef = useRef<any>(null);
  const hasHandledPendingJoinRef = useRef(false);

  // Handle pending join action after authentication
  useEffect(() => {
    // Wait for both authentication and backend user to be ready
    if (isAuthenticated && !isLoading && backendUser && navigationRef.current) {
      const pendingJoin = getPendingJoinAction();
      if (pendingJoin && !hasHandledPendingJoinRef.current) {
        hasHandledPendingJoinRef.current = true;
        // Small delay to ensure navigation is ready and backend user is fully loaded
        setTimeout(() => {
          navigationRef.current?.navigate('JoinEvent', {
            eventCode: pendingJoin.eventCode,
            autoJoin: true, // Flag to auto-join
          });
          clearPendingJoinAction();
        }, 500);
      }
    } else if (!isAuthenticated) {
      hasHandledPendingJoinRef.current = false;
    }
  }, [isAuthenticated, isLoading, backendUser, getPendingJoinAction, clearPendingJoinAction]);

  // Show loading screen while checking auth state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Welcome">
              {({ navigation }) => (
                <WelcomeScreen
                  onJoinEvent={() => navigation.navigate('JoinEvent')}
                  onSignIn={() => navigation.navigate('Login')}
                />
              )}
            </Stack.Screen>

            <Stack.Screen name="JoinEvent">
              {({ navigation }) => (
                <JoinEventScreen
                  onJoinEvent={() => {
                    navigation.navigate('Login');
                  }}
                  onScanQR={() => console.log('Open QR Scanner')}
                  onBack={() => navigation.goBack()}
                />
              )}
            </Stack.Screen>

            <Stack.Screen name="Login">
              {({ navigation }) => (
                <LoginScreen
                  onLogin={() => {
                    // Auth state will automatically update via context
                    // Navigation will switch to authenticated stack
                  }}
                  onSignUp={() => navigation.navigate('SignUp')}
                  onForgotPassword={() => navigation.navigate('ForgotPassword')}
                />
              )}
            </Stack.Screen>

            <Stack.Screen name="SignUp">
              {({ navigation }) => (
                <SignUpScreen
                  onSignUp={() => {
                    // Auth state will automatically update via context
                    // Navigation will switch to authenticated stack
                  }}
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
                  onVerify={() => {
                    // Auth state will automatically update via context
                  }}
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
            <Stack.Screen name="ManageEvents" component={ManageEventsScreen} />
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
            <Stack.Screen name="JoinEvent" component={JoinEventScreen} />
            <Stack.Screen name="JoinedEvents">
              {({ navigation }) => (
                <JoinedEventsScreen
                  onBack={() => navigation.goBack()}
                  onEventPress={event =>
                    navigation.navigate('EventDetails', { event })
                  }
                />
              )}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
