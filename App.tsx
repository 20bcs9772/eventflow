import React, { useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation';
import { AuthProvider } from './src/context';
import { configureGoogleSignIn, locationService } from './src/services';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    configureGoogleSignIn();

    const initLocation = async () => {
      try {
        const allowed = await locationService.requestLocationPermission();

        if (!allowed) return;

        const location = await locationService.getCurrentLocation();

        console.log('Location:', location);
      } catch (err) {
        console.log('Location init failed:', err);
      }
    };

    initLocation();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;
