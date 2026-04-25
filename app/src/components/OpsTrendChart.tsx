import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontFamily, FontSize } from '../constants/typography';
import Colors from '../constants/colors';

interface OpsTrendChartProps {
  data: Array<{
    label: string;
    value: number;
    is_current: boolean;
  }>;
}

const OpsTrendChart = ({ data }: OpsTrendChartProps) => {
  const periods = ['7D', '30D', '90D'];
  const activePeriod = '30D';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>OPS Trend</Text>
        <View style={styles.periodSelector}>
          {periods.map((period) => (
            <TouchableOpacity 
              key={period} 
              style={[
                styles.periodButton, 
                activePeriod === period && styles.activePeriodButton
              ]}
            >
              <Text style={[
                styles.periodText, 
                activePeriod === period && styles.activePeriodText
              ]}>
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.chartContainer}>
        {data.map((item, index) => (
          <View key={index} style={styles.column}>
            <View style={styles.barsRow}>
              <View 
                style={[
                  styles.bar, 
                  { 
                    height: Math.max(item.value, 5), // Min height for visibility
                    backgroundColor: item.is_current ? '#0D2B6E' : '#1CC8B0',
                    width: 12,
                    borderRadius: 6
                  }
                ]} 
              />
            </View>
            <Text style={styles.label}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: '#334155',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 2,
  },
  periodButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  activePeriodButton: {
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  periodText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: '#94A3B8',
  },
  activePeriodText: {
    color: '#0D2B6E',
    fontFamily: FontFamily.bold,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingHorizontal: 10,
  },
  column: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  bar: {
    width: 6,
    borderRadius: 3,
  },
  label: {
    fontFamily: FontFamily.medium,
    fontSize: 9,
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
});

export default OpsTrendChart;
