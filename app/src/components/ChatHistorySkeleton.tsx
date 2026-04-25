import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from './Skeleton';

export const ChatHistorySkeleton = () => {
  return (
    <View style={styles.container}>
      {/* Left Message Skeleton */}
      <View style={styles.leftContainer}>
        <Skeleton width="70%" height={60} borderRadius={16} style={{ borderTopLeftRadius: 4 }} />
      </View>

      {/* Right Message Skeleton */}
      <View style={styles.rightContainer}>
        <Skeleton width="60%" height={40} borderRadius={16} style={{ borderBottomRightRadius: 4 }} />
      </View>

      {/* Left Message Skeleton */}
      <View style={styles.leftContainer}>
        <Skeleton width="85%" height={100} borderRadius={16} style={{ borderTopLeftRadius: 4 }} />
      </View>

      {/* Right Message Skeleton */}
      <View style={styles.rightContainer}>
        <Skeleton width="50%" height={40} borderRadius={16} style={{ borderBottomRightRadius: 4 }} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 54,
  },
  leftContainer: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  rightContainer: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
});
