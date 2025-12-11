import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { eventService } from '../../services';
import { Colors } from '../../constants/colors';

export const EventTypeCard = () => {
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

  // Split items into 2 rows
  const row1 = eventTypes.filter((_, i) => i % 2 === 0);
  const row2 = eventTypes.filter((_, i) => i % 2 !== 0);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.container}>
        {/* Row 1 */}
        <View style={styles.row}>
          {row1.map((item, index) => (
            <View key={index} style={styles.card}>
              <Text>{item}</Text>
            </View>
          ))}
        </View>

        {/* Row 2 */}
        <View style={styles.row}>
          {row2.map((item, index) => (
            <View key={index} style={styles.card}>
              <Text>{item}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    paddingVertical: 10,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  card: {
    width: 150,
    height: 70,
    backgroundColor: Colors.background,
    borderRadius: 12,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
