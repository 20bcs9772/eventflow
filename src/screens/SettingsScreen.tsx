import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Header, Card, Button, ScreenLayout } from '../components';
import { Colors } from '../constants/colors';
import { Spacing, FontSizes, BorderRadius } from '../constants/spacing';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context';

interface SettingsScreenProps {
  onNavigate: (route: string) => void;
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
        <Card style={styles.profileCard}>
          <TouchableOpacity
            style={styles.profileContent}
            activeOpacity={0.7}
            onPress={() => {}}
          >
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  <FontAwesome6 name="user" size={30} iconStyle="solid" />
                </Text>
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {backendUser?.name || user?.displayName || 'User'}
              </Text>
              <Text style={styles.profileDevice}>
                {backendUser?.email || user?.email || 'No email'}
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </Card>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GENERAL</Text>
          <Card style={styles.settingsCard}>
            <TouchableOpacity
              style={styles.settingItem}
              activeOpacity={0.7}
              onPress={() => {}}
            >
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>
                  <FontAwesome6 name="bell" size={20} iconStyle="solid" />
                </Text>
                <Text style={styles.settingLabel}>Notifications</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{
                  false: Colors.border,
                  true: Colors.primary,
                }}
                thumbColor={Colors.white}
              />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.settingItem}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('ManageEvents')}
            >
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>
                  <FontAwesome6 name="calendar-check" size={20} iconStyle="solid" />
                </Text>
                <Text style={styles.settingLabel}>Manage Events</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.settingItem}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('JoinedEvents')}
            >
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>
                  <FontAwesome6 name="calendar" size={20} iconStyle="solid" />
                </Text>
                <Text style={styles.settingLabel}>Joined Events</Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={styles.settingValue}>2</Text>
                <Text style={styles.chevron}>›</Text>
              </View>
            </TouchableOpacity>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SUPPORT</Text>
          <Card style={styles.settingsCard}>
            <TouchableOpacity
              style={styles.settingItem}
              activeOpacity={0.7}
              onPress={() => {}}
            >
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>❓</Text>
                <Text style={styles.settingLabel}>Help & Support</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.settingItem}
              activeOpacity={0.7}
              onPress={() => {}}
            >
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>📄</Text>
                <Text style={styles.settingLabel}>Terms of Service</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </Card>
        </View>

        <View style={styles.logoutSection}>
          <Button
            title="Log Out"
            onPress={async () => {
              Alert.alert(
                'Log Out',
                'Are you sure you want to log out?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Log Out',
                    style: 'destructive',
                    onPress: async () => {
                      await signOut();
                      onLogout?.();
                    },
                  },
                ]
              );
            }}
            variant="text"
            style={styles.logoutButton}
            textStyle={styles.logoutButtonText}
          />
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
    padding: Spacing.md,
    paddingBottom: 100,
  },
  profileCard: {
    marginBottom: Spacing.lg,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: Spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 30,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  profileDevice: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  chevron: {
    fontSize: FontSizes.xl,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingsCard: {
    padding: 0,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 20,
    marginRight: Spacing.md,
  },
  settingLabel: {
    fontSize: FontSizes.md,
    color: Colors.text,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginRight: Spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: Spacing.md,
  },
  logoutSection: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  logoutButton: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.md,
  },
  logoutButtonText: {
    color: Colors.red,
    fontSize: FontSizes.md,
  },
});
