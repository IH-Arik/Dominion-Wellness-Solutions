import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Check, Flame } from 'lucide-react-native';
import { FontFamily, FontSize } from '../constants/typography';
import Colors from '../constants/colors';

import { SubmitDailyCheckInResponse } from '../redux/rtk/questionsApi';

interface SuccessStateProps {
  onReturn: () => void;
  data: any;
  type: 'daily' | 'weekly' | 'monthly';
}

const SuccessState = ({ onReturn, data, type }: SuccessStateProps) => {
  const { 
    reflection_streak_days = 0, 
    week_progress = [], 
    weekly_completed_days = 0,
    motivation_message = "Small daily actions build strong performance.",
    // Weekly specific
    achievement_title,
    achievement_summary,
    focus_score,
    focus_score_label,
    focus_driver,
    // Monthly specific
    monthly_progress_text,
    message,
    optimal_performance_score
  } = data || {};

  const getThemeColor = () => {
    switch (type) {
      case 'weekly': return '#6366F1';
      case 'monthly': return '#F59E0B';
      default: return '#1CC8B0';
    }
  };

  // Calculate progress percentage (out of 7 days)
  const progressPercentage = (weekly_completed_days / 7) * 100;

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.iconContainer}>
        <View style={styles.ripple1}>
          <View style={styles.ripple2}>
            <View style={[styles.checkBg, { backgroundColor: getThemeColor(), shadowColor: getThemeColor() }]}>
              <Check size={40} color={Colors.white} strokeWidth={3} />
            </View>
          </View>
        </View>
      </View>

      <Text style={styles.title}>{type === 'daily' ? 'Check-in Complete' : type === 'weekly' ? 'Weekly Review Done' : 'Monthly Analysis Set'}</Text>
      <Text style={styles.subtitle}>{motivation_message || message || achievement_summary}</Text>

      {type === 'daily' ? (
        <>
          <View style={styles.streakCard}>
            <Text style={styles.streakLabel}>REFLECTION STREAK</Text>
            <View style={styles.streakRow}>
              <Text style={styles.streakValue}>{reflection_streak_days}</Text>
              <Flame size={24} color="#FF5A5A" style={styles.flameIcon} />
              <Text style={styles.streakDays}>Days</Text>
            </View>

            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progressPercentage}%`, backgroundColor: getThemeColor() }]} />
            </View>

            <Text style={styles.streakQuote}>
              {reflection_streak_days >= 4 
                ? "You're on a roll! Keep it up to reach your weekly goal."
                : "Good start! Keep checking in to build your momentum."}
            </Text>
          </View>

          <View style={styles.calendarRow}>
            {week_progress.map((day, index) => (
              <View key={index} style={[
                styles.dayCircle, 
                day.completed && { backgroundColor: getThemeColor() },
                day.is_today && styles.currentDay
              ]}>
                <Text style={[
                  styles.dayText, 
                  day.completed && styles.completedDayText
                ]}>
                  {day.day_label}
                </Text>
              </View>
            ))}
          </View>
        </>
      ) : type === 'weekly' ? (
        <View style={styles.streakCard}>
          <Text style={styles.streakLabel}>{focus_driver?.toUpperCase() || 'FOCUS DRIVER'}</Text>
          <View style={styles.streakRow}>
            <Text style={styles.streakValue}>{Math.round(focus_score || 0)}</Text>
            <Text style={[styles.streakDays, { marginLeft: 8 }]}>%</Text>
          </View>
          <Text style={[styles.badge, { backgroundColor: '#EEF2FF', color: '#6366F1' }]}>{focus_score_label}</Text>
          
          <View style={{ height: 1, backgroundColor: '#F1F5F9', width: '100%', marginVertical: 20 }} />
          
          <Text style={[styles.streakLabel, { marginBottom: 8 }]}>WEEKLY ACHIEVEMENT</Text>
          <Text style={[styles.title, { fontSize: 20, textAlign: 'center' }]}>{achievement_title}</Text>
          <Text style={styles.streakQuote}>{achievement_summary}</Text>
        </View>
      ) : (
        <View style={styles.streakCard}>
          <Text style={styles.streakLabel}>OPTIMAL PERFORMANCE</Text>
          <View style={styles.streakRow}>
            <Text style={styles.streakValue}>{Math.round(optimal_performance_score || 0)}</Text>
            <Text style={[styles.streakDays, { marginLeft: 8 }]}>/100</Text>
          </View>
          
          <View style={{ height: 1, backgroundColor: '#F1F5F9', width: '100%', marginVertical: 20 }} />
          
          <Text style={[styles.streakLabel, { marginBottom: 8 }]}>MONTHLY PROGRESS</Text>
          <Text style={[styles.title, { fontSize: 20, textAlign: 'center' }]}>{monthly_progress_text}</Text>
          <Text style={styles.streakQuote}>{message}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.returnButton} onPress={onReturn}>
        <Text style={styles.returnButtonText}>Return to Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6FCFB',
  },
  contentContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  iconContainer: {
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ripple1: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(28, 200, 176, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ripple2: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(28, 200, 176, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1CC8B0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1CC8B0',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 28,
    color: '#0D2B6E',
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: FontFamily.medium,
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 40,
  },
  streakCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 5,
    marginBottom: 32,
  },
  streakLabel: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    color: '#94A3B8',
    letterSpacing: 2,
    marginBottom: 16,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  streakValue: {
    fontFamily: FontFamily.bold,
    fontSize: 64,
    color: '#0D2B6E',
  },
  flameIcon: {
    marginHorizontal: 8,
  },
  streakDays: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    color: '#0D2B6E',
  },
  progressBarBg: {
    width: '100%',
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressBarFill: {
    width: '60%',
    height: '100%',
    backgroundColor: '#1CC8B0',
    borderRadius: 4,
  },
  streakQuote: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },
  calendarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 60,
  },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EDF2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedDay: {
    backgroundColor: '#1CC8B0',
  },
  currentDay: {
    borderWidth: 2,
    borderColor: 'rgba(28, 200, 176, 0.3)',
    shadowColor: '#1CC8B0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  dayText: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    color: '#94A3B8',
  },
  completedDayText: {
    color: Colors.white,
  },
  returnButton: {
    backgroundColor: '#0D2B6E',
    height: 56,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  returnButtonText: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: Colors.white,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    fontFamily: FontFamily.semiBold,
    fontSize: 12,
    overflow: 'hidden',
  }
});

export default SuccessState;
