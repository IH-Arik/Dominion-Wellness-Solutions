import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrendingUp } from 'lucide-react-native';
import { FontFamily, FontSize } from '../constants/typography';
import Colors from '../constants/colors';

interface OpsSummaryCardProps {
  data: {
    overall_score: number;
    status: string;
    percentage_change: number;
    progress_value: number;
    comparison_label: string;
  };
}

const OpsSummaryCard = ({ data }: OpsSummaryCardProps) => {
  const trendColor = data.percentage_change >= 0 ? "#10B981" : "#EF4444";
  const isPositive = data.percentage_change >= 0;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>OPS SUMMARY</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{data.status}</Text>
        </View>
      </View>
      
      <View style={styles.scoreContainer}>
        <View>
          <Text style={styles.scoreText}>
            <Text style={styles.boldScore}>{Math.round(data.overall_score)}</Text>/100
          </Text>
        </View>
        <View style={styles.trendContainer}>
          <TrendingUp size={14} color={trendColor} style={{ transform: [{ rotate: isPositive ? '0deg' : '180deg' }] }} />
          <Text style={[styles.trendText, { color: trendColor }]}>
            {isPositive ? '+' : ''}{data.percentage_change}% {data.comparison_label}
          </Text>
        </View>
      </View>
      
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${data.progress_value}%` }]} />
        </View>
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
    marginBottom: 12,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: '#94A3B8',
    letterSpacing: 1,
  },
  badge: {
    backgroundColor: '#E0F2F1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: '#1CC8B0',
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  scoreText: {
    fontSize: FontSize.xl,
    color: '#94A3B8',
    fontFamily: FontFamily.regular,
  },
  boldScore: {
    fontSize: 36,
    color: '#0D2B6E',
    fontFamily: FontFamily.bold,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: '#10B981',
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarBackground: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#1CC8B0',
    borderRadius: 4,
  },
});

export default OpsSummaryCard;
