import React, { useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation';
import { AuthProvider, LocationProvider } from './src/context';
import { configureGoogleSignIn } from './src/services';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    configureGoogleSignIn();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <LocationProvider>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </LocationProvider>
    </SafeAreaProvider>
  );
}

export default App;
