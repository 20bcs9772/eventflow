import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/colors';
import { Spacing, FontSizes, BorderRadius } from '../constants/spacing';

interface SearchResultCardProps {
  title: string;
  date: string;
  location: string;
  image: string;
  onViewEvent: () => void;
}

export const SearchResultCard: React.FC<SearchResultCardProps> = ({
  title,
  date,
  location,
  image,
  onViewEvent,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.details}>
          {date} • {location}
        </Text>
        <TouchableOpacity style={styles.viewButton} onPress={onViewEvent}>
          <Text style={styles.viewButtonText}>View Event</Text>
        </TouchableOpacity>
      </View>
      <Image source={{ uri: image }} style={styles.image} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  content: {
    flex: 1,
    paddingRight: Spacing.md,
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  details: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  viewButton: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryLight + '30',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  viewButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.primary,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.md,
  },
});
