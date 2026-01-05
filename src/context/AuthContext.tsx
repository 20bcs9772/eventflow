/**
 * Auth Context
 *
 * Provides authentication state and methods throughout the app.
 * Handles Firebase auth state changes and syncs with backend.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from 'react';
import {
  authService,
  apiService,
  deviceService,
  AuthUser,
  BackendUser,
} from '../services';
import { API_ENDPOINTS } from '../config';
import { requestPermission, getFcmToken } from '../notifications';
import { getMessaging, onTokenRefresh } from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';
import { getUniqueId } from 'react-native-device-info';

interface AuthContextType {
  // State
  user: AuthUser | null;
  backendUser: BackendUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Auth methods
  signUpWithEmail: (
    email: string,
    password: string,
    name?: string,
  ) => Promise<{ success: boolean; error?: string }>;
  signInWithEmail: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signInWithApple: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;

  // Utility methods
  refreshUser: () => Promise<void>;
  // Pending join action
  setPendingJoinAction: (eventCode: string, eventId?: string) => void;
  getPendingJoinAction: () => { eventCode: string; eventId?: string } | null;
  clearPendingJoinAction: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [backendUser, setBackendUser] = useState<BackendUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deviceId, setDeviceId] = useState('');
  const pendingTokenRef = useRef<string | null>(null);

  // Track if we're currently syncing to prevent duplicate requests
  const isSyncingRef = useRef(false);
  // Track the last synced Firebase UID to prevent re-syncing
  const lastSyncedUidRef = useRef<string | null>(null);
  // Track if we're in the middle of an explicit sign-up operation
  const isSigningUpRef = useRef(false);
  // Store pending join action (event code) to execute after authentication
  const pendingJoinActionRef = useRef<{
    eventCode: string;
    eventId?: string;
  } | null>(null);

  /**
   * Register FCM token for push notifications
   */
  const registerFcmToken = async (userId: string): Promise<void> => {
    try {
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        return;
      }

      const fcmToken = await getFcmToken();
      if (!fcmToken) {
        return;
      }

      if (!deviceId) return;

      const response = await deviceService.saveFcmToken(
        userId,
        fcmToken,
        deviceId,
      );
      if (!response.success) {
        console.error('Failed to register FCM token:', response.error);
      }
    } catch (error) {
      console.error('Error registering FCM token:', error);
    }
  };

  const updateFcmToken = async (token: string) => {
    try {
      if (!deviceId || deviceId === '' || !backendUser?.id) {
        pendingTokenRef.current = token;
        return;
      }
      const response = await deviceService.updateFcmToken(
        deviceId,
        token,
        backendUser.id,
      );
      if (!response.success) {
        console.error('Failed to update FCM token:', response.error);
      }
    } catch (error) {
      console.error('Error updating FCM token:', error);
    }
  };

  /**
   * Sync user with backend after Firebase auth
   * Returns the backend user if successful
   */
  const syncWithBackend = async (
    displayName?: string | null,
  ): Promise<BackendUser | null> => {
    // Prevent duplicate sync requests
    if (isSyncingRef.current) {
      console.log('Already syncing, skipping duplicate request');
      return null;
    }

    isSyncingRef.current = true;

    try {
      const response = await apiService.post<BackendUser>(
        API_ENDPOINTS.AUTH.LOGIN,
        { name: displayName },
      );

      if (response.success && response.data) {
        setBackendUser(response.data);
        // Register FCM token after successful backend sync
        if (response.data.id) {
          registerFcmToken(response.data.id).catch(err => {
            console.error('FCM token registration failed:', err);
          });
        }

        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Backend sync error:', error);
      return null;
    } finally {
      isSyncingRef.current = false;
    }
  };

  /**
   * Listen to Firebase auth state changes
   */
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async firebaseUser => {
      if (firebaseUser) {
        const authUser: AuthUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
        };
        setUser(authUser);

        // Only sync if this is a different user than last synced
        // Skip automatic sync if we're in the middle of an explicit sign-up
        // (the sign-up method will handle the sync with the correct name)
        if (
          lastSyncedUidRef.current !== firebaseUser.uid &&
          !isSyncingRef.current &&
          !isSigningUpRef.current
        ) {
          lastSyncedUidRef.current = firebaseUser.uid;
          await syncWithBackend(firebaseUser.displayName);
        }
      } else {
        setUser(null);
        setBackendUser(null);
        lastSyncedUidRef.current = null;
        isSigningUpRef.current = false;
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getUniqueId().then(setDeviceId);
  }, []);

  useEffect(() => {
    if (deviceId && backendUser?.id && pendingTokenRef.current) {
      updateFcmToken(pendingTokenRef.current);
      pendingTokenRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceId, backendUser?.id]);

  useEffect(() => {
    if (!backendUser?.id) return;

    const unsubscribe = onTokenRefresh(
      getMessaging(getApp()),
      async newToken => {
        try {
          await updateFcmToken(newToken);
        } catch (err) {
          console.error('FCM token refresh failed', err);
        }
      },
    );
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendUser?.id]);

  /**
   * Sign up with email
   */
  const signUpWithEmail = async (
    email: string,
    password: string,
    name?: string,
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    // Set flag to prevent automatic sync in auth state listener
    isSigningUpRef.current = true;

    try {
      const result = await authService.signUpWithEmail(email, password, name);

      if (result.success && result.user) {
        setUser(result.user);
        lastSyncedUidRef.current = result.user.uid;

        // Wait a bit for Firebase to update the displayName profile
        // This ensures the auth state listener doesn't interfere
        await new Promise<void>(resolve => setTimeout(() => resolve(), 100));

        // Sync with backend using the name parameter (most reliable)
        // This will create/update the user in the backend with the correct name
        await syncWithBackend(name || result.user.displayName);
      }

      return result;
    } finally {
      setIsLoading(false);
      // Clear the sign-up flag after sync completes
      isSigningUpRef.current = false;
    }
  };

  /**
   * Sign in with email
   */
  const signInWithEmail = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const result = await authService.signInWithEmail(email, password);

      if (result.success && result.user) {
        setUser(result.user);
        lastSyncedUidRef.current = result.user.uid;

        // Sync with backend
        await syncWithBackend(result.user.displayName);
      }

      return result;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Sign in with Google
   */
  const signInWithGoogle = async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    setIsLoading(true);
    try {
      const result = await authService.signInWithGoogle();

      if (result.success && result.user) {
        setUser(result.user);
        lastSyncedUidRef.current = result.user.uid;

        // Sync with backend
        await syncWithBackend(result.user.displayName);
      }

      return result;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Sign in with Apple
   */
  const signInWithApple = async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    setIsLoading(true);
    try {
      const result = await authService.signInWithApple();

      if (result.success && result.user) {
        setUser(result.user);
        lastSyncedUidRef.current = result.user.uid;

        // Sync with backend
        await syncWithBackend(result.user.displayName);
      }

      return result;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Sign out
   */
  const signOut = async (): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const result = await authService.signOut();
      if (deviceId && backendUser?.id) {
        await deviceService.deleteFcmToken(deviceId, backendUser.id);
      }

      if (result.success) {
        setUser(null);
        setBackendUser(null);
        setDeviceId('');
        lastSyncedUidRef.current = null;
      }

      return result;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Refresh user data from backend
   */
  const refreshUser = async (): Promise<void> => {
    if (!user) return;

    try {
      const response = await apiService.get<BackendUser>(API_ENDPOINTS.AUTH.ME);
      if (response.success && response.data) {
        setBackendUser(response.data);
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  /**
   * Set pending join action (to execute after authentication)
   */
  const setPendingJoinAction = (eventCode: string, eventId?: string): void => {
    pendingJoinActionRef.current = { eventCode, eventId };
  };

  /**
   * Get pending join action
   */
  const getPendingJoinAction = (): {
    eventCode: string;
    eventId?: string;
  } | null => {
    return pendingJoinActionRef.current;
  };

  /**
   * Clear pending join action
   */
  const clearPendingJoinAction = (): void => {
    pendingJoinActionRef.current = null;
  };

  const value: AuthContextType = {
    user,
    backendUser,
    isLoading,
    isAuthenticated: !!user,
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    signInWithApple,
    signOut,
    refreshUser,
    setPendingJoinAction,
    getPendingJoinAction,
    clearPendingJoinAction,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
