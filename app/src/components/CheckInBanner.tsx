import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, ChevronRight, ClipboardCheck, Sparkles } from 'lucide-react-native';
import { FontFamily } from '../constants/typography';
import { useRouter } from 'expo-router';

interface CheckInBannerProps {
  type: 'daily' | 'weekly' | 'monthly' | 'none';
}

const CheckInBanner: React.FC<CheckInBannerProps> = ({ type }) => {
  const router = useRouter();

  if (type === 'none') return null;

  const getDetails = () => {
    switch (type) {
      case 'daily':
        return {
          title: 'Daily Check-In',
          subtitle: 'Keep your streak alive and track your daily rhythm.',
          icon: <Sparkles size={24} color="#FFFFFF" />,
          colors: ['#1CC8B0', '#0D2B6E'] as const,
          path: '/checkin?type=daily'
        };
      case 'weekly':
        return {
          title: 'Weekly Reflection',
          subtitle: 'Summarize your week and set goals for the next one.',
          icon: <Calendar size={24} color="#FFFFFF" />,
          colors: ['#6366F1', '#4338CA'] as const,
          path: '/checkin?type=weekly'
        };
      case 'monthly':
        return {
          title: 'Monthly Review',
          subtitle: 'A deep dive into your performance and wellness trends.',
          icon: <ClipboardCheck size={24} color="#FFFFFF" />,
          colors: ['#F59E0B', '#D97706'] as const,
          path: '/checkin?type=monthly'
        };
      default:
        return null;
    }
  };

  const details = getDetails();
  if (!details) return null;

  return (
    <TouchableOpacity 
      activeOpacity={0.9} 
      onPress={() => router.push(details.path as any)}
      style={styles.container}
    >
      <LinearGradient
        colors={details.colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.iconContainer}>
          {details.icon}
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>{details.title}</Text>
          <Text style={styles.subtitle}>{details.subtitle}</Text>
        </View>

        <View style={styles.arrowContainer}>
          <ChevronRight size={20} color="#FFFFFF" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 0,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    minHeight: 80,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  arrowContainer: {
    marginLeft: 8,
  }
});

export default CheckInBanner;
