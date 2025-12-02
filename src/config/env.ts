/**
 * Environment Configuration
 *
 * This file provides access to environment variables.
 * Uses react-native-config to read from .env file.
 *
 * Setup:
 * 1. npm install react-native-config
 * 2. For Android, add to android/app/build.gradle:
 *    apply from: project(':react-native-config').projectDir.getPath() + "/dotenv.gradle"
 * 3. Copy .env.example to .env and fill in your values
 * 4. Rebuild the app after changing .env
 */

import Config from 'react-native-config';

// Default values for development
const DEFAULTS = {
  API_URL: 'http://10.0.2.2:3000',
  GOOGLE_WEB_CLIENT_ID: '',
  ENABLE_GOOGLE_SIGNIN: 'true',
  ENABLE_APPLE_SIGNIN: 'true',
};

console.log('Config', Config);
export const ENV = {
  // API Configuration
  API_URL: Config.API_URL || DEFAULTS.API_URL,

  // Google Sign-In
  GOOGLE_WEB_CLIENT_ID:
    Config.GOOGLE_WEB_CLIENT_ID || DEFAULTS.GOOGLE_WEB_CLIENT_ID,

  // Feature Flags
  ENABLE_GOOGLE_SIGNIN:
    (Config.ENABLE_GOOGLE_SIGNIN || DEFAULTS.ENABLE_GOOGLE_SIGNIN) === 'true',
  ENABLE_APPLE_SIGNIN:
    (Config.ENABLE_APPLE_SIGNIN || DEFAULTS.ENABLE_APPLE_SIGNIN) === 'true',
} as const;

/**
 * Validate required environment variables
 * Call this on app startup to catch missing config early
 */
export const validateEnv = (): { valid: boolean; missing: string[] } => {
  const required: (keyof typeof ENV)[] = ['GOOGLE_WEB_CLIENT_ID'];
  const missing: string[] = [];

  required.forEach(key => {
    const value = ENV[key];
    if (!value || value === '' || String(value).includes('your_')) {
      missing.push(key);
    }
  });

  if (missing.length > 0 && __DEV__) {
    console.warn(
      `⚠️ Missing environment variables: ${missing.join(', ')}\n` +
        'Please check your .env file and rebuild the app.',
    );
  }

  return { valid: missing.length === 0, missing };
};

export default ENV;
