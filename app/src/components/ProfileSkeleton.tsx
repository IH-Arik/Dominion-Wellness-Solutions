import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Skeleton } from './Skeleton';

export const ProfileSkeleton = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} scrollEnabled={false}>
      {/* Header */}
      <View style={styles.header}>
        <Skeleton width={120} height={28} />
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <Skeleton width={80} height={80} borderRadius={40} style={{ marginBottom: 16 }} />
        <Skeleton width={150} height={24} style={{ marginBottom: 8 }} />
        <Skeleton width={200} height={16} />
      </View>

      {/* Info Cards */}
      <Skeleton height={100} borderRadius={16} style={{ marginBottom: 16 }} />
      <Skeleton height={100} borderRadius={16} style={{ marginBottom: 16 }} />

      {/* Settings List */}
      <View style={styles.list}>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} height={60} borderRadius={12} style={{ marginBottom: 12 }} />
        ))}
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
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  profileCard: {
    alignItems: 'center',
    marginBottom: 32,
  },
  list: {
    marginTop: 20,
  },
});
