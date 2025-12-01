import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { ScreenLayout, FloatingActionButton } from '../components';
import { Colors } from '../constants/colors';
import { Spacing, FontSizes, BorderRadius } from '../constants/spacing';
import { RootStackParamList } from '../types';

type AddVenueRouteProp = RouteProp<RootStackParamList, 'AddVenue'>;

export const AddVenueScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<AddVenueRouteProp>();
  const { onSave } = route.params || {};

  const [selectedVenue, setSelectedVenue] = useState<any>(null);
  const [searchText, setSearchText] = useState('');

  /* Mock suggested venues — replace with API */
  const venues = [
    {
      name: 'The Grand Hall',
      address: '123 Main St, Anytown, USA',
    },
    {
      name: 'Lakeside Conference Center',
      address: '456 Lake Rd, Lakeside, USA',
    },
    {
      name: 'The City View Rooftop',
      address: '789 Skyline Ave, Metropolis, USA',
    },
  ];

  const handleSelectVenue = () => {
    if (onSave && selectedVenue) {
      onSave(selectedVenue);
    }
    navigation.goBack();
  };

  return (
    <ScreenLayout backgroundColor={Colors.backgroundLight}>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <FontAwesome6
              name="arrow-left"
              size={20}
              iconStyle="solid"
              color={Colors.text}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Venue</Text>
          <View style={{ width: 20 }} />
        </View>

        {/* SEARCH */}
        <View style={styles.searchContainer}>
          <FontAwesome6
            name="magnifying-glass"
            size={18}
            color={Colors.textSecondary}
            iconStyle="solid"
            style={{ marginRight: 10 }}
          />
          <TextInput
            placeholder="Search for a venue..."
            placeholderTextColor={Colors.textLight}
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* SUGGESTED VENUES */}
        <View style={styles.suggestedHeader}>
          <Text style={styles.suggestedTitle}>Suggested Venues</Text>
        </View>

        <ScrollView style={{ flex: 1 }}>
          {venues.map((v, index) => {
            const isSelected = selectedVenue?.name === v.name;

            return (
              <TouchableOpacity
                key={index}
                style={styles.venueRow}
                onPress={() => setSelectedVenue(v)}
              >
                {/* Icon */}
                <View style={styles.venueIcon}>
                  <FontAwesome6
                    name="location-dot"
                    size={18}
                    iconStyle="solid"
                    color={Colors.primary}
                  />
                </View>

                {/* Texts */}
                <View style={styles.venueInfo}>
                  <Text style={styles.venueName}>{v.name}</Text>
                  <Text style={styles.venueAddress}>{v.address}</Text>
                </View>

                {/* Checkmark */}
                {isSelected && (
                  <View style={styles.checkCircle}>
                    <FontAwesome6
                      name="check"
                      iconStyle="solid"
                      size={14}
                      color={'white'}
                    />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}

          {/* ADD CUSTOM VENUE */}
          <TouchableOpacity style={styles.customVenueBtn} onPress={() => {}}>
            <FontAwesome6
              name="location-dot"
              size={18}
              color={Colors.primary}
              iconStyle="solid"
            />
            <Text style={styles.customVenueText}>Add Custom Venue</Text>
          </TouchableOpacity>

          <View style={{ height: 140 }} />
        </ScrollView>

        {/* Floating Button */}
        <FloatingActionButton
          title="Select Venue"
          onPress={handleSelectVenue}
          disabled={!selectedVenue}
        />
      </View>
    </ScreenLayout>
  );
};

/* -------------------- STYLES -------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },

  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.text,
  },

  /* SEARCH */
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.lg,
  },

  searchInput: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.text,
  },

  /* Suggested Header */
  suggestedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },

  suggestedTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.text,
  },

  /* Venue List */
  venueRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  venueIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#F2EEFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },

  venueInfo: {
    flex: 1,
  },

  venueName: {
    fontWeight: '700',
    fontSize: FontSizes.md,
    color: Colors.text,
    marginBottom: 2,
  },

  venueAddress: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
  },

  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Add Custom Venue */
  customVenueBtn: {
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.lg,
    paddingVertical: 18,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    marginTop: Spacing.lg,
  },

  customVenueText: {
    fontSize: FontSizes.md,
    color: Colors.primary,
    fontWeight: '600',
  },

});
