/**
 * Firebase Configuration
 * 
 * React Native Firebase reads configuration automatically from:
 * - Android: android/app/google-services.json
 * - iOS: ios/eventflow/GoogleService-Info.plist
 * 
 * No manual configuration needed in JavaScript!
 */

/**
 * Firebase Auth Error Messages
 * User-friendly error messages for Firebase Auth errors
 */
export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  // Email/Password errors
  'auth/email-already-in-use': 'This email is already registered. Please sign in instead.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/operation-not-allowed': 'This sign-in method is not enabled.',
  'auth/weak-password': 'Password should be at least 6 characters.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/user-not-found': 'No account found with this email.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/invalid-credential': 'Invalid email or password. Please try again.',
  'auth/too-many-requests': 'Too many attempts. Please try again later.',
  
  // Social auth errors
  'auth/account-exists-with-different-credential': 
    'An account already exists with this email using a different sign-in method.',
  'auth/popup-closed-by-user': 'Sign-in was cancelled.',
  'auth/cancelled-popup-request': 'Sign-in was cancelled.',
  
  // Network errors
  'auth/network-request-failed': 'Network error. Please check your connection.',
  
  // Default
  default: 'An error occurred. Please try again.',
};

/**
 * Get user-friendly error message from Firebase error code
 */
export const getAuthErrorMessage = (errorCode: string): string => {
  return AUTH_ERROR_MESSAGES[errorCode] || AUTH_ERROR_MESSAGES.default;
};
