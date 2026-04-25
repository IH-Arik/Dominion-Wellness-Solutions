import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontFamily, FontSize } from '../constants/typography';
import Colors from '../constants/colors';

interface TrendRowProps {
  title: string;
  trend: string;
  colors: string[];
}

const TrendRow = ({ title, trend, colors }: TrendRowProps) => {
  return (
    <View style={styles.rowContainer}>
      <View style={styles.rowHeader}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowTrend}>{trend}</Text>
      </View>
      <View style={styles.grid}>
        {colors.map((color: string, index: number) => (
          <View 
            key={index} 
            style={[styles.gridCell, { backgroundColor: color }]} 
          />
        ))}
      </View>
    </View>
  );
};

interface BehaviorTrendGridProps {
  data: Array<{
    key: string;
    label: string;
    status: string;
    bars: number[];
    color_scale: string[];
  }>;
}

const BehaviorTrendGrid = ({ data }: BehaviorTrendGridProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Behavior Trends</Text>
      <View style={styles.card}>
        {data.map((item) => (
          <TrendRow 
            key={item.key}
            title={item.label.toUpperCase()} 
            trend={item.status} 
            colors={item.color_scale} 
          />
        ))}
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: '#334155',
    marginBottom: 12,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    gap: 20,
  },
  rowContainer: {
    gap: 8,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    color: '#64748B',
    letterSpacing: 0.5,
  },
  rowTrend: {
    fontFamily: FontFamily.medium,
    fontSize: 9,
    color: '#334155',
  },
  grid: {
    flexDirection: 'row',
    gap: 4,
  },
  gridCell: {
    flex: 1,
    height: 12,
    borderRadius: 2,
  },
});

export default BehaviorTrendGrid;
