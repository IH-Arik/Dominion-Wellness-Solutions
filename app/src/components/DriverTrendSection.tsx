import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Dumbbell, Brain, Battery, Target, Users } from 'lucide-react-native';
import { FontFamily, FontSize } from '../constants/typography';
import Colors from '../constants/colors';

interface DriverTrendItemProps {
  icon: any;
  title: string;
  trend: string;
  bars: number[];
  color: string;
}

const DriverTrendItem = ({ icon: Icon, title, trend, bars, color }: DriverTrendItemProps) => {
  return (
    <View style={styles.itemContainer}>
      <View style={styles.leftContent}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
          <Icon size={18} color={color} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.itemTitle}>{title}</Text>
          <Text style={[styles.itemTrend, { color: trend.startsWith('+') ? '#10B981' : (trend.startsWith('-') ? '#EF4444' : '#64748B') }]}>
            {trend}
          </Text>
        </View>
      </View>
      
      <View style={styles.miniChart}>
        {bars.map((val: number, index: number) => {
          // Normalize height to container (max 20px)
          const barHeight = Math.max(2, (val / 100) * 20);
          return (
            <View 
              key={index} 
              style={[
                styles.miniBar, 
                { 
                  height: barHeight, 
                  backgroundColor: index === bars.length - 1 ? color : `${color}80` 
                }
              ]} 
            />
          );
        })}
      </View>
    </View>
  );
};

interface DriverTrendSectionProps {
  data: Array<{
    key: string;
    label: string;
    current_score: number;
    delta: number;
    delta_label: string;
    color: string;
    sparkline: number[];
  }>;
}

const getDriverIcon = (key: string) => {
  switch (key) {
    case 'PC': return Dumbbell;
    case 'MR': return Brain;
    case 'RC': return Battery;
    case 'PA': return Target;
    case 'MC': return Users;
    default: return Target;
  }
};

const DriverTrendSection = ({ data }: DriverTrendSectionProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>DRIVER TRENDS</Text>
      <View style={styles.card}>
        {data.map((trend, index) => (
          <React.Fragment key={trend.key}>
            <DriverTrendItem 
              icon={getDriverIcon(trend.key)}
              title={trend.label}
              trend={trend.delta_label}
              bars={trend.sparkline}
              color={trend.color}
            />
            {index < data.length - 1 && <View style={styles.separator} />}
          </React.Fragment>
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
    fontSize: FontSize.xs,
    color: '#64748B',
    marginBottom: 12,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    gap: 2,
  },
  itemTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: '#1E293B',
  },
  itemTrend: {
    fontFamily: FontFamily.medium,
    fontSize: 10,
  },
  miniChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: 20,
    width: 60,
    justifyContent: 'flex-end',
  },
  miniBar: {
    width: 10,
    borderRadius: 2,
  },
  separator: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 16,
  },
});

export default DriverTrendSection;
