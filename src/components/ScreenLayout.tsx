import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';

interface ScreenLayoutProps {
  children: React.ReactNode;
  backgroundColor?: string;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

export const ScreenLayout: React.FC<ScreenLayoutProps> = ({
  children,
  backgroundColor = Colors.backgroundLight,
  edges = ['top'],
}) => {
  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={edges}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <View style={[styles.content, { backgroundColor }]}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 5,
  },
});
