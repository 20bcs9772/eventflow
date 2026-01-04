import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Image,
} from 'react-native';
import { Header, ScreenLayout } from '../components';
import { Colors } from '../constants/colors';
import { Spacing, FontSizes } from '../constants/spacing';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context';

interface SettingsScreenProps {
  onLogout?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onLogout }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const navigation = useNavigation<any>();
  const { signOut, backendUser, user } = useAuth();

  return (
    <ScreenLayout backgroundColor={Colors.backgroundLight}>
      <Header title="Settings" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileHeader}>
          <View style={styles.profileGradient} />
          <View style={styles.decorativeCircles}>
            <View style={[styles.circle, styles.circle1]} />
            <View style={[styles.circle, styles.circle2]} />
            <View style={[styles.circle, styles.circle3]} />
            <View style={[styles.circle, styles.circle4]} />
            <View style={[styles.circle, styles.circle5]} />
          </View>
          <TouchableOpacity
            style={styles.profileContent}
            activeOpacity={0.7}
            onPress={() => {}}
          >
            <View style={styles.avatarContainer}>
              {user?.photoURL || backendUser?.avatarUrl ? (
                <Image
                  source={{
                    uri: user?.photoURL || backendUser?.avatarUrl || '',
                  }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatarFallback}>
                  <FontAwesome6
                    name="user"
                    size={40}
                    color={Colors.white}
                    iconStyle="solid"
                  />
                </View>
              )}
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {backendUser?.name || user?.displayName || 'User'}
              </Text>
              <Text style={styles.profileEmail}>
                {backendUser?.email || user?.email || 'No email'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GENERAL</Text>
          <View style={styles.settingsContainer}>
            <TouchableOpacity
              style={styles.settingItem}
              activeOpacity={0.6}
              onPress={() => {}}
            >
              <View style={styles.settingLeft}>
                <View
                  style={[styles.iconContainer, styles.iconContainerGeneral]}
                >
                  <FontAwesome6
                    name="bell"
                    size={18}
                    iconStyle="regular"
                    color={Colors.primary}
                  />
                </View>
                <Text style={styles.settingLabel}>Notifications</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{
                  false: '#E5E7EB',
                  true: Colors.primary,
                }}
                thumbColor={Colors.white}
                ios_backgroundColor="#E5E7EB"
              />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.settingItem}
              activeOpacity={0.6}
              onPress={() => navigation.navigate('ManageEvents')}
            >
              <View style={styles.settingLeft}>
                <View
                  style={[styles.iconContainer, styles.iconContainerGeneral]}
                >
                  <FontAwesome6
                    name="calendar-check"
                    size={18}
                    iconStyle="regular"
                    color={Colors.primary}
                  />
                </View>
                <Text style={styles.settingLabel}>Manage Events</Text>
              </View>
              <FontAwesome6
                name="chevron-right"
                size={14}
                color={Colors.textLight}
                iconStyle="solid"
              />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.settingItem}
              activeOpacity={0.6}
              onPress={() => navigation.navigate('JoinedEvents')}
            >
              <View style={styles.settingLeft}>
                <View
                  style={[styles.iconContainer, styles.iconContainerGeneral]}
                >
                  <FontAwesome6
                    name="calendar"
                    size={18}
                    iconStyle="regular"
                    color={Colors.primary}
                  />
                </View>
                <Text style={styles.settingLabel}>Joined Events</Text>
              </View>
              <View style={styles.settingRight}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>2</Text>
                </View>
                <FontAwesome6
                  name="chevron-right"
                  size={14}
                  color={Colors.textLight}
                  iconStyle="solid"
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SUPPORT</Text>
          <View style={styles.settingsContainer}>
            <TouchableOpacity
              style={styles.settingItem}
              activeOpacity={0.6}
              onPress={() => {}}
            >
              <View style={styles.settingLeft}>
                <View
                  style={[styles.iconContainer, styles.iconContainerSupport]}
                >
                  <FontAwesome6
                    name="circle-question"
                    size={18}
                    iconStyle="regular"
                    color="#6B7280"
                  />
                </View>
                <Text style={styles.settingLabel}>Help & Support</Text>
              </View>
              <FontAwesome6
                name="chevron-right"
                size={14}
                color={Colors.textLight}
                iconStyle="solid"
              />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.settingItem}
              activeOpacity={0.6}
              onPress={() => {}}
            >
              <View style={styles.settingLeft}>
                <View
                  style={[styles.iconContainer, styles.iconContainerSupport]}
                >
                  <FontAwesome6
                    name="file-lines"
                    size={18}
                    iconStyle="regular"
                    color="#6B7280"
                  />
                </View>
                <Text style={styles.settingLabel}>Terms of Service</Text>
              </View>
              <FontAwesome6
                name="chevron-right"
                size={14}
                color={Colors.textLight}
                iconStyle="solid"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.logoutSection}>
          <TouchableOpacity
            style={styles.logoutButton}
            activeOpacity={0.7}
            onPress={async () => {
              Alert.alert('Log Out', 'Are you sure you want to log out?', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Log Out',
                  style: 'destructive',
                  onPress: async () => {
                    await signOut();
                    onLogout?.();
                  },
                },
              ]);
            }}
          >
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Spacing.md,
    paddingBottom: 100,
  },
  profileHeader: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: Spacing.xl,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    borderWidth: 0,
    position: 'relative',
    overflow: 'hidden',
  },
  profileGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: 'rgba(107, 70, 193, 0.05)',
  },
  decorativeCircles: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    zIndex: 0,
    overflow: 'hidden',
  },
  circle: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: 'rgba(107, 70, 193, 0.08)',
  },
  circle1: {
    width: 80,
    height: 80,
    top: -25,
    left: '5%',
  },
  circle2: {
    width: 60,
    height: 60,
    top: 15,
    right: '5%',
  },
  circle3: {
    width: 100,
    height: 100,
    top: -35,
    right: '25%',
  },
  circle4: {
    width: 45,
    height: 45,
    top: 25,
    left: '35%',
  },
  circle5: {
    width: 70,
    height: 70,
    top: -15,
    left: '70%',
  },
  profileContent: {
    alignItems: 'center',
    width: '100%',
    zIndex: 1,
  },
  avatarContainer: {
    marginBottom: Spacing.md,
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.backgroundLight,
    borderWidth: 3,
    borderColor: Colors.white,
  },
  avatarFallback: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.white,
  },
  profileInfo: {
    alignItems: 'center',
    width: '100%',
  },
  profileName: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  profileEmail: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  settingsContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    minHeight: 56,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  iconContainerGeneral: {
    backgroundColor: 'rgba(107, 70, 193, 0.1)',
  },
  iconContainerSupport: {
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
  },
  settingLabel: {
    fontSize: FontSizes.md,
    color: Colors.text,
    fontWeight: '500',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  badge: {
    backgroundColor: 'rgba(107, 70, 193, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 56,
  },
  logoutSection: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  logoutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderRadius: 16,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  logoutButtonText: {
    color: '#DC2626',
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
});
