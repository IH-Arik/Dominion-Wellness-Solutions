import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Skeleton } from './Skeleton';

export const InsightSkeleton = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} scrollEnabled={false}>
      {/* Header Skeleton */}
      <View style={styles.header}>
        <Skeleton width={40} height={40} borderRadius={20} />
        <Skeleton width={100} height={24} />
        <Skeleton width={40} height={40} borderRadius={20} />
      </View>

      <View style={styles.sectionHeader}>
        <Skeleton width={120} height={20} />
        <Skeleton width={60} height={14} />
      </View>

      <View style={styles.row}>
        <Skeleton width="48%" height={120} borderRadius={16} />
        <Skeleton width="48%" height={120} borderRadius={16} />
      </View>

      {/* AI Insight Box */}
      <Skeleton height={120} borderRadius={16} style={{ marginTop: 20 }} />

      <Skeleton width={150} height={20} style={{ marginTop: 24, marginBottom: 12 }} />

      {/* Core Drivers */}
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} height={80} borderRadius={12} style={{ marginBottom: 12 }} />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6FAF9',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
