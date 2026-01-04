import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Button, TextInput, SocialButton, ScreenLayout } from '../components';
import { Colors } from '../constants/colors';
import { Spacing, BorderRadius, FontSizes } from '../constants/spacing';
import { useAuth } from '../context';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';

interface LoginScreenProps {
  onLogin: () => void;
  onSignUp: () => void;
  onForgotPassword: () => void;
}

type LoginRouteProp = RouteProp<RootStackParamList, 'Login'>;

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  onSignUp,
  onForgotPassword,
}) => {
  const route = useRoute<LoginRouteProp>();
  const {
    signInWithEmail,
    signInWithGoogle,
    signInWithApple,
    isLoading,
    setPendingJoinAction,
  } = useAuth();
  const returnTo = route.params?.returnTo;
  const eventCode = route.params?.eventCode;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    if (!email.trim()) {
      setError('Please enter your email');
      return false;
    }
    if (!password) {
      setError('Please enter your password');
      return false;
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    setError(null);

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const result = await signInWithEmail(email.trim(), password);

      if (result.success) {
        // Store pending join action if user was trying to join an event
        if (returnTo === 'JoinEvent' && eventCode) {
          setPendingJoinAction(eventCode);
        }
        onLogin();
      } else {
        setError(result.error || 'Failed to sign in');
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      // Store pending join action BEFORE auth (if user was trying to join an event)
      if (returnTo === 'JoinEvent' && eventCode) {
        setPendingJoinAction(eventCode);
      }

      const result = await signInWithGoogle();

      if (result.success) {
        onLogin();
      } else if (result.error !== 'Sign-in was cancelled') {
        setError(result.error || 'Failed to sign in with Google');
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAppleLogin = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      // Store pending join action BEFORE auth (if user was trying to join an event)
      if (returnTo === 'JoinEvent' && eventCode) {
        setPendingJoinAction(eventCode);
      }

      const result = await signInWithApple();

      if (result.success) {
        onLogin();
      } else if (result.error !== 'Sign-in was cancelled') {
        setError(result.error || 'Failed to sign in with Apple');
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormDisabled = isLoading || isSubmitting;

  return (
    <ScreenLayout backgroundColor={Colors.background}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Sign in to continue to EventFlow
            </Text>
          </View>

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Social Login Buttons */}
          <View style={styles.socialContainer}>
            <SocialButton
              provider="google"
              onPress={handleGoogleLogin}
              style={styles.socialButton}
              disabled={isFormDisabled}
            />
            {Platform.OS === 'ios' && (
              <SocialButton
                provider="apple"
                onPress={handleAppleLogin}
                style={styles.socialButton}
                disabled={isFormDisabled}
              />
            )}
          </View>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Email and Password */}
          <View style={styles.formContainer}>
            <TextInput
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={text => {
                setEmail(text);
                setError(null);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              icon="envelope"
              editable={!isFormDisabled}
            />

            <TextInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={text => {
                setPassword(text);
                setError(null);
              }}
              isPassword
              icon="lock"
              editable={!isFormDisabled}
            />

            {/* Forgot Password */}
            <TouchableOpacity
              onPress={onForgotPassword}
              style={styles.forgotPasswordContainer}
              activeOpacity={0.7}
              disabled={isFormDisabled}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <Button
            title={isSubmitting ? '' : 'Sign In'}
            onPress={handleLogin}
            variant="primary"
            size="large"
            style={styles.loginButton}
            disabled={isFormDisabled}
            icon={
              isSubmitting ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : undefined
            }
          />

          {/* Sign Up Link */}
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Don't have an account? </Text>
            <TouchableOpacity
              onPress={onSignUp}
              activeOpacity={0.7}
              disabled={isFormDisabled}
            >
              <Text style={styles.signUpLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    marginTop: Spacing.lg,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSizes.xxxl,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: `${Colors.red}15`,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: `${Colors.red}30`,
  },
  errorText: {
    color: Colors.red,
    fontSize: FontSizes.sm,
    textAlign: 'center',
  },
  socialContainer: {
    marginBottom: Spacing.lg,
  },
  socialButton: {
    marginBottom: Spacing.md,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginHorizontal: Spacing.md,
  },
  formContainer: {
    marginBottom: Spacing.lg,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: -Spacing.sm,
  },
  forgotPasswordText: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: '600',
  },
  loginButton: {
    marginBottom: Spacing.lg,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  signUpText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  signUpLink: {
    fontSize: FontSizes.md,
    color: Colors.primary,
    fontWeight: '600',
  },
});
