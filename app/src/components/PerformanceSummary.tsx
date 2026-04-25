import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { FontFamily, FontSize } from '../constants/typography';
import Colors from '../constants/colors';

interface PerformanceSummaryProps {
  summary: string;
}

const PerformanceSummary = ({ summary }: PerformanceSummaryProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Sparkles size={20} color="#1CC8B0" />
        <Text style={styles.title}>Performance Summary</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.text}>{summary}</Text>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  card: {
    backgroundColor: '#05214D', // Very dark navy
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 24,
    marginBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.white,
  },
  content: {
    gap: 16,
  },
  text: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: '#CBD5E1',
    lineHeight: 20,
  },
  highlightTeal: {
    color: '#1CC8B0',
    fontFamily: FontFamily.bold,
  },
  highlightRed: {
    color: '#F87171',
    fontFamily: FontFamily.bold,
  },
  subtext: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: '#94A3B8',
    lineHeight: 20,
  },
});

export default PerformanceSummary;
