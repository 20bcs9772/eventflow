import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Button } from '../components';
import { Colors } from '../constants/colors';
import { Spacing, BorderRadius, FontSizes } from '../constants/spacing';

interface WelcomeScreenProps {
  onJoinEvent: () => void;
  onSignIn: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onJoinEvent,
  onSignIn,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logoOuter}>
            <View style={styles.logoInner}>
              <Text style={styles.logoIcon}>🎉</Text>
            </View>
          </View>
        </View>
        
        <Text style={styles.title}>Hap</Text>
        <Text style={styles.subtitle}>Your live event companion</Text>
        
        <View style={styles.buttonContainer}>
          <Button
            title="Join Event"
            onPress={onJoinEvent}
            variant="primary"
            size="large"
            style={styles.joinButton}
          />
        </View>
        
        <View style={styles.signInContainer}>
          <Text style={styles.signInText}>Are you an organizer? </Text>
          <Text style={styles.signInLink} onPress={onSignIn}>
            Sign in
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  logoContainer: {
    marginBottom: Spacing.xl,
  },
  logoOuter: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  logoInner: {
    width: 90,
    height: 90,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: {
    fontSize: 50,
  },
  title: {
    fontSize: FontSizes.xxxl,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSizes.lg,
    color: Colors.textSecondary,
    marginBottom: Spacing.xxl,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: Spacing.xxl,
  },
  joinButton: {
    width: '100%',
  },
  signInContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signInText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  signInLink: {
    fontSize: FontSizes.md,
    color: Colors.primary,
    fontWeight: '600',
  },
});

