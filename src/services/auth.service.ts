/**
 * Auth Service
 *
 * Handles Firebase Authentication operations.
 * This service manages user authentication state and provides
 * methods for sign in, sign up, and sign out.
 *
 * NOTE: You need to install @react-native-firebase/app and @react-native-firebase/auth
 * Run: npm install @react-native-firebase/app @react-native-firebase/auth
 *
 * For Google Sign-In, also install: npm install @react-native-google-signin/google-signin
 * For Apple Sign-In, also install: npm install @invertase/react-native-apple-authentication
 */

import {
  AppleAuthProvider,
  createUserWithEmailAndPassword,
  FirebaseAuthTypes,
  getAuth,
  getIdToken,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut as signOff,
} from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import { getAuthErrorMessage } from '../config/firebase';
import { ENV } from '../config/env';
import { Platform } from 'react-native';
import { getApp } from '@react-native-firebase/app';

const auth = getAuth(getApp());

// Configure Google Sign-In (call this during app initialization)
export const configureGoogleSignIn = () => {
  const webClientId = ENV.GOOGLE_WEB_CLIENT_ID;

  if (!webClientId) {
    console.warn(
      '⚠️ GOOGLE_WEB_CLIENT_ID not configured in .env file!\n' +
        'Get it from: Firebase Console > Authentication > Sign-in method > Google',
    );
    return;
  }

  GoogleSignin.configure({
    webClientId,
    offlineAccess: true,
  });
};

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

export interface BackendUser {
  id: string;
  firebaseUid: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
  authProvider: 'EMAIL' | 'GOOGLE' | 'APPLE';
  role: string;
  createdAt: string;
  updatedAt: string;
}

class AuthService {
  private currentUser: FirebaseAuthTypes.User | null = null;
  private authStateListeners: Set<
    (user: FirebaseAuthTypes.User | null) => void
  > = new Set();

  constructor() {
    // Listen to auth state changes
    onAuthStateChanged(auth, user => {
      this.currentUser = user;
      this.authStateListeners.forEach(listener => listener(user));
    });
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChanged(
    callback: (user: FirebaseAuthTypes.User | null) => void,
  ): () => void {
    this.authStateListeners.add(callback);
    // Immediately call with current state
    callback(this.currentUser);

    // Return unsubscribe function
    return () => {
      this.authStateListeners.delete(callback);
    };
  }

  /**
   * Get current Firebase user
   */
  getCurrentUser(): FirebaseAuthTypes.User | null {
    return auth.currentUser;
  }

  /**
   * Get Firebase ID token for API requests
   */
  async getIdToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) return null;

    try {
      return await getIdToken(user);
    } catch (error) {
      console.error('Error getting ID token:', error);
      return null;
    }
  }

  /**
   * Sign up with email and password
   */
  async signUpWithEmail(
    email: string,
    password: string,
    name?: string,
  ): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // Update display name if provided
      if (name && credential.user) {
        await credential.user.updateProfile({ displayName: name });
      }

      await auth.currentUser?.sendEmailVerification();

      return {
        success: true,
        user: this.mapFirebaseUser(credential.user),
      };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return {
        success: false,
        error: getAuthErrorMessage(error.code),
      };
    }
  }

  /**
   * Sign in with email and password
   */
  async signInWithEmail(
    email: string,
    password: string,
  ): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      return {
        success: true,
        user: this.mapFirebaseUser(credential.user),
      };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return {
        success: false,
        error: getAuthErrorMessage(error.code),
      };
    }
  }

  /**
   * Sign in with Google
   */
  async signInWithGoogle(): Promise<{
    success: boolean;
    user?: AuthUser;
    error?: string;
  }> {
    try {
      // Check if Google Play Services are available (Android)
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      // Sign in with Google
      const signInResult = await GoogleSignin.signIn();
      const idToken = signInResult.data?.idToken;

      if (!idToken) {
        throw new Error('No ID token received from Google');
      }

      // Create Firebase credential
      const googleCredential = GoogleAuthProvider.credential(idToken);

      // Sign in to Firebase
      const credential = await signInWithCredential(auth, googleCredential);

      return {
        success: true,
        user: this.mapFirebaseUser(credential.user),
      };
    } catch (error: any) {
      console.error('Google sign in error:', error);

      // Handle specific Google Sign-In errors
      if (error.code === 'SIGN_IN_CANCELLED') {
        return { success: false, error: 'Sign-in was cancelled' };
      }

      return {
        success: false,
        error: getAuthErrorMessage(error.code) || error.message,
      };
    }
  }

  /**
   * Sign in with Apple
   */
  async signInWithApple(): Promise<{
    success: boolean;
    user?: AuthUser;
    error?: string;
  }> {
    try {
      // Only available on iOS
      if (Platform.OS !== 'ios') {
        return {
          success: false,
          error: 'Apple Sign-In is only available on iOS',
        };
      }

      // Perform Apple Sign-In
      const appleAuthResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      // Ensure Apple returned a user identityToken
      if (!appleAuthResponse.identityToken) {
        throw new Error('Apple Sign-In failed - no identity token returned');
      }

      // Create Firebase credential
      const { identityToken, nonce } = appleAuthResponse;
      const appleCredential = AppleAuthProvider.credential(
        identityToken,
        nonce,
      );

      // Sign in to Firebase
      const credential = await signInWithCredential(auth, appleCredential);

      // Apple may provide name only on first sign-in
      if (appleAuthResponse.fullName?.givenName && credential.user) {
        const displayName = [
          appleAuthResponse.fullName.givenName,
          appleAuthResponse.fullName.familyName,
        ]
          .filter(Boolean)
          .join(' ');

        if (displayName) {
          await credential.user.updateProfile({ displayName });
        }
      }

      return {
        success: true,
        user: this.mapFirebaseUser(credential.user),
      };
    } catch (error: any) {
      console.error('Apple sign in error:', error);

      if (error.code === appleAuth.Error.CANCELED) {
        return { success: false, error: 'Sign-in was cancelled' };
      }

      return {
        success: false,
        error: getAuthErrorMessage(error.code) || error.message,
      };
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      // Sign out from Google if signed in with Google
      try {
        await GoogleSignin.signOut();
      } catch (e) {
        console.error(e);
        // Ignore Google sign out errors
      }

      await signOff(auth);

      return { success: true };
    } catch (error: any) {
      console.error('Sign out error:', error);
      return {
        success: false,
        error: error.message || 'Failed to sign out',
      };
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(
    email: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error: any) {
      console.error('Password reset error:', error);
      return {
        success: false,
        error: getAuthErrorMessage(error.code),
      };
    }
  }

  /**
   * Map Firebase user to AuthUser type
   */
  private mapFirebaseUser(user: FirebaseAuthTypes.User): AuthUser {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
    };
  }
}

export const authService = new AuthService();
export default authService;
