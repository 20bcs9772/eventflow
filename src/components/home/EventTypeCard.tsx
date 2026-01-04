import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { eventService } from '../../services';
import { Colors } from '../../constants/colors';
import { Spacing, FontSizes } from '../../constants/spacing';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { useNavigation } from '@react-navigation/native';

// Map event types to icons and colors
const eventTypeConfig: Record<string, { icon: string; gradient: [string, string] }> = {
  WEDDING: {
    icon: 'ring',
    gradient: ['#F3E8FF', '#E9D5FF'], // Purple gradient
  },
  BIRTHDAY: {
    icon: 'cake-candles',
    gradient: ['#FEF3C7', '#FDE68A'], // Yellow gradient
  },
  CORPORATE: {
    icon: 'briefcase',
    gradient: ['#DBEAFE', '#BFDBFE'], // Blue gradient
  },
  COLLEGE_FEST: {
    icon: 'graduation-cap',
    gradient: ['#FCE7F3', '#FBCFE8'], // Pink gradient
  },
  OTHER: {
    icon: 'calendar',
    gradient: ['#E5E7EB', '#D1D5DB'], // Gray gradient
  },
};

export const EventTypeCard = () => {
  const navigation = useNavigation<any>();
  const [eventTypes, setEventTypes] = useState<string[]>([]);

  useEffect(() => {
    const fetchEventTypes = async () => {
      const getEventTypes = await eventService.getAllEventTypes();
      if (getEventTypes.success && getEventTypes.data) {
        setEventTypes(getEventTypes.data);
      }
    };

    fetchEventTypes();
  }, []);

  const handleTypePress = (type: string) => {
    navigation.navigate('SearchResults', { query: type });
  };

  const getTypeConfig = (type: string) => {
    const upperType = type.toUpperCase();
    return eventTypeConfig[upperType] || eventTypeConfig.OTHER;
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {eventTypes.map((item, index) => {
          const config = getTypeConfig(item);
          const displayName = item.charAt(0) + item.slice(1).toLowerCase().replace(/_/g, ' ');
          
          return (
            <TouchableOpacity
              key={index}
              style={styles.card}
              onPress={() => handleTypePress(item)}
              activeOpacity={0.8}
            >
              <View style={[styles.cardContent, { backgroundColor: config.gradient[0] }]}>
                <View style={styles.iconWrapper}>
                  <FontAwesome6
                    name={config.icon as any}
                    size={24}
                    color={Colors.primary}
                    iconStyle="solid"
                  />
                </View>
                <Text style={styles.cardText} numberOfLines={2}>
                  {displayName}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.xs,
  },
  scrollContent: {
    paddingVertical: Spacing.xs,
    paddingRight: Spacing.md,
  },
  card: {
    width: 110,
    marginRight: Spacing.md,
  },
  cardContent: {
    borderRadius: 16,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(107, 70, 193, 0.1)',
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 18,
  },
});
