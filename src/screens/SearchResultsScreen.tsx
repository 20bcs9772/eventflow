import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { ScreenLayout, SearchResultCard, FilterChip } from '../components';
import { Colors } from '../constants/colors';
import { Spacing, FontSizes, BorderRadius } from '../constants/spacing';
import { RootStackParamList, Event } from '../types';

type SearchResultsRouteProp = RouteProp<RootStackParamList, 'SearchResults'>;

interface SearchEvent extends Event {
  image: string;
}

const mockSearchResults: SearchEvent[] = [
  {
    id: '1',
    title: "Alice & Bob's Wedding",
    date: 'Sat, Oct 26, 2024',
    location: 'The Grand Ballroom, New York',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400',
  },
  {
    id: '2',
    title: 'Innovate Corporate Summit',
    date: 'Mon, Nov 11, 2024',
    location: 'Convention Center, San Francisco',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
  },
  {
    id: '3',
    title: 'Summer Music Festival',
    date: 'Fri, Aug 16, 2024',
    location: 'Central Park, New York',
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400',
  },
];

type FilterType = 'date' | 'type' | 'location';

export const SearchResultsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<SearchResultsRouteProp>();
  const initialQuery = route.params?.query || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState<FilterType>('date');

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleViewEvent = (event: SearchEvent) => {
    navigation.navigate('EventDetails', { event });
  };

  const filteredResults = mockSearchResults.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScreenLayout backgroundColor={Colors.backgroundLight}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <FontAwesome6
              name="chevron-left"
              size={18}
              color={Colors.text}
              iconStyle="solid"
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Search Results</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <FontAwesome6
              name="magnifying-glass"
              size={16}
              color={Colors.textSecondary}
              iconStyle="solid"
            />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search events..."
              placeholderTextColor={Colors.textLight}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={handleClearSearch}>
                <FontAwesome6
                  name="circle-xmark"
                  size={18}
                  color={Colors.textSecondary}
                  iconStyle="solid"
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          <FilterChip
            label="Sort by Date"
            isActive={activeFilter === 'date'}
            onPress={() => setActiveFilter('date')}
          />
          <FilterChip
            label="Event Type"
            isActive={activeFilter === 'type'}
            onPress={() => setActiveFilter('type')}
          />
          <FilterChip
            label="Location"
            isActive={activeFilter === 'location'}
            onPress={() => setActiveFilter('location')}
          />
        </ScrollView>

        {/* Results */}
        <ScrollView
          style={styles.resultsContainer}
          contentContainerStyle={styles.resultsContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredResults.length > 0 ? (
            filteredResults.map(event => (
              <SearchResultCard
                key={event.id}
                title={event.title}
                date={event.date}
                location={event.location}
                image={event.image}
                onViewEvent={() => handleViewEvent(event)}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <FontAwesome6
                name="magnifying-glass"
                size={48}
                color={Colors.textLight}
                iconStyle="solid"
              />
              <Text style={styles.emptyTitle}>No events found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your search or filters
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  headerSpacer: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.text,
    marginLeft: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  filtersContainer: {
    maxHeight: 50,
    marginBottom: Spacing.md,
  },
  filtersContent: {
    paddingHorizontal: Spacing.lg,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
});



