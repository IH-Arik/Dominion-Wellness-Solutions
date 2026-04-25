import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Skeleton } from './Skeleton';

export const HomeSkeleton = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} scrollEnabled={false}>
      {/* Header Skeleton */}
      <View style={styles.header}>
        <View>
          <Skeleton width={120} height={24} style={{ marginBottom: 8 }} backgroundColor="#334155" />
          <Skeleton width={180} height={16} backgroundColor="#334155" />
        </View>
        <Skeleton width={40} height={40} borderRadius={20} backgroundColor="#334155" />
      </View>

      <View style={styles.mainContent}>
        {/* Banner Skeleton */}
        <Skeleton height={100} borderRadius={16} style={{ marginBottom: 24 }} />

        {/* Indicators Skeleton */}
        <View style={styles.indicatorsRow}>
          <Skeleton width="48%" height={120} borderRadius={16} />
          <Skeleton width="48%" height={120} borderRadius={16} />
        </View>

        {/* Section Title */}
        <Skeleton width={150} height={20} style={{ marginBottom: 16, marginTop: 24 }} />

        {/* Metric Cards Skeletons */}
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} height={100} borderRadius={16} style={{ marginBottom: 12 }} />
        ))}

        {/* Chart Skeleton */}
        <Skeleton height={200} borderRadius={16} style={{ marginTop: 24 }} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6FCFB',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#001F3F',
  },
  mainContent: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  indicatorsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
});
