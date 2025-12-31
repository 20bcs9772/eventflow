import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import {
  ScreenLayout,
  FloatingActionButton,
  ScreenHeader,
} from '../components';
import { Colors } from '../constants/colors';
import { Spacing, FontSizes, BorderRadius } from '../constants/spacing';

export const InvitePeopleScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <ScreenLayout backgroundColor={Colors.backgroundLight}>
      <ScreenHeader title="Invite People" />
      <View style={styles.container}>
        {/* SEARCH BAR */}
        <View style={styles.searchBar}>
          <FontAwesome6
            name="magnifying-glass"
            size={16}
            color={Colors.textSecondary}
            style={{ marginRight: 10 }}
            iconStyle="solid"
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, email..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.textLight}
          />
        </View>

        {/* Invite from Contacts */}
        <TouchableOpacity style={styles.inviteFromContacts}>
          <FontAwesome6 name="address-book" size={20} color={Colors.primary} />
          <Text style={styles.inviteFromContactsText}>
            Invite from Contacts
          </Text>
        </TouchableOpacity>

        {/* Already invited row */}
        <Text style={styles.subheading}>Already invited</Text>
        <View style={styles.invitedRow}>
          <Image
            source={{ uri: 'https://i.pravatar.cc/100?img=55' }}
            style={styles.invitedAvatar}
          />
          <Image
            source={{ uri: 'https://i.pravatar.cc/100?img=66' }}
            style={styles.invitedAvatar}
          />
          <Image
            source={{ uri: 'https://i.pravatar.cc/100?img=77' }}
            style={styles.invitedAvatar}
          />
          <Text style={styles.invitedCount}>3 collaborators</Text>
        </View>
        {/* Floating Bottom Button */}
        <FloatingActionButton
          title="Send Invitations"
          onPress={() => {}}
          disabled={false}
        />
      </View>
    </ScreenLayout>
  );
};

/* -------------------- STYLES -------------------- */

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.lg },

  /* SEARCH */
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    marginBottom: Spacing.lg,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.text,
  },

  /* Invite from Contacts */
  inviteFromContacts: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
  inviteFromContactsText: {
    marginLeft: 10,
    fontSize: FontSizes.md,
    color: Colors.primary,
    fontWeight: '600',
  },

  /* Already invited */
  subheading: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },

  invitedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  invitedAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: -10,
    borderWidth: 2,
    borderColor: Colors.backgroundLight,
  },
  invitedCount: {
    marginLeft: 20,
    fontSize: FontSizes.sm,
    color: Colors.text,
  },

  /* Person List */
  personCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  personName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
  },
  personEmail: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },

  /* Invite buttons */
  inviteButton: {
    borderColor: Colors.primary,
    borderWidth: 1.5,
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: BorderRadius.full,
  },
  inviteButtonText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: FontSizes.sm,
  },

  invitedBadge: {
    backgroundColor: Colors.primary + '20',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.full,
  },
  invitedBadgeText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: FontSizes.sm,
  },
});
