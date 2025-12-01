import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Header, Card, Button, ScreenLayout } from '../components';
import { Colors } from '../constants/colors';
import { Spacing, FontSizes, BorderRadius } from '../constants/spacing';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { useNavigation } from '@react-navigation/native';

interface SettingsScreenProps {
  onNavigate: (route: string) => void;
  onLogout?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onLogout }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const navigation = useNavigation<any>();

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
              <Text style={styles.profileName}>Jessica Miller</Text>
              <Text style={styles.profileDevice}>iPhone 14 Pro</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </Card>

        {/* Create Event Button */}
        <TouchableOpacity
          style={styles.createEventButton}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('CreateEvent')}
        >
          <View style={styles.createEventIcon}>
            <FontAwesome6 name="plus" size={20} color={Colors.white} iconStyle="solid" />
          </View>
          <Text style={styles.createEventText}>Create Event</Text>
        </TouchableOpacity>

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
              onPress={() => {}}
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
            onPress={onLogout || (() => {})}
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
  createEventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  createEventIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  createEventText: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.white,
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
