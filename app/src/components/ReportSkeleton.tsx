import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Skeleton } from './Skeleton';

export const ReportSkeleton = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} scrollEnabled={false}>
      {/* Header */}
      <View style={styles.header}>
        <Skeleton width={150} height={28} />
      </View>

      {/* Filters */}
      <View style={styles.filtersRow}>
        <Skeleton width={80} height={36} borderRadius={18} />
        <Skeleton width={100} height={36} borderRadius={18} />
        <Skeleton width={60} height={36} borderRadius={18} />
      </View>

      {/* Summary Card */}
      <Skeleton height={180} borderRadius={16} style={{ marginBottom: 20 }} />

      {/* Chart */}
      <Skeleton height={250} borderRadius={16} style={{ marginBottom: 24 }} />

      {/* Trends Grid */}
      <View style={styles.grid}>
        <Skeleton width="48%" height={120} borderRadius={16} />
        <Skeleton width="48%" height={120} borderRadius={16} />
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});
