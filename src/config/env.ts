export const ENV = {
  // API Configuration
  API_URL: 'http://10.0.2.2:3000',

  // Google Sign-In
  GOOGLE_WEB_CLIENT_ID:
    '1042448137326-jbn2ejd15qahh7sh0v7bgf7srvj02cpi.apps.googleusercontent.com',

  // Feature Flags
  ENABLE_GOOGLE_SIGNIN: 'true',
  ENABLE_APPLE_SIGNIN: 'true',
  GOOGLE_MAPS_API_KEY: 'AIzaSyBoJrfr26uXgHUUaj70EiJhbjF7te9TlZ4',
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
    if (!value || String(value).includes('your_')) {
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
