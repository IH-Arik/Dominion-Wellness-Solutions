import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, ActivityIndicator, RefreshControl } from 'react-native';
import { Zap, Target } from 'lucide-react-native';
import { 
  HomeHeader, 
  MetricCard, 
  WeeklyProgressChart, 
  ActionPlanSection, 
  BehaviorStreakGrid,
  DashboardIndicators,
  BurnoutAlert,
  CheckInBanner
} from '../../src/components';
import { FontFamily } from '../../src/constants/typography';
import Colors from '../../src/constants/colors';
import { useGetDashboardQuery } from '../../src/redux/rtk/aiApi';
import { useGetCheckInStatusQuery } from '../../src/redux/rtk/questionsApi';
import { useDispatch } from 'react-redux';
import { setDashboardData } from '../../src/redux/slices/aiSlice';
import { useAppSelector } from '../../src/redux/reduxHooks';

export default function HomeScreen() {
  const dispatch = useDispatch();
  const { data: dashboard, isLoading, error, refetch, isFetching } = useGetDashboardQuery();
  const { data: checkInStatus, isLoading: isStatusLoading } = useGetCheckInStatusQuery();
  const { dashboardData } = useAppSelector((state) => state.ai);

  useEffect(() => {
    if (dashboard) {
      if (dashboard.success && dashboard.data) {
        dispatch(setDashboardData(dashboard.data));
      }
    }
  }, [dashboard, dispatch]);

  const onRefresh = React.useCallback(() => {
    refetch();
  }, [refetch]);

  const getStatusColors = (tag: string) => {
    switch (tag?.toLowerCase()) {
      case 'critical':
        return { border: "#EF4444", bg: "#FEF2F2", text: "#EF4444" };
      case 'warning':
        return { border: "#F59E0B", bg: "#FFFBEB", text: "#F59E0B" };
      case 'steady':
        return { border: "#1CC8B0", bg: "#E6F9F6", text: "#1CC8B0" };
      default:
        return { border: "#3B82F6", bg: "#EFF6FF", text: "#3B82F6" };
    }
  };

  if (isLoading && !dashboardData) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#1CC8B0" />
      </View>
    );
  }

  const data = dashboardData || dashboard?.data;

  const metrics = data?.dimension_breakdown.map(d => {
    const colors = getStatusColors(d.status_tag);
    return {
      title: d.label,
      status: d.condition.toUpperCase(),
      description: d.description,
      score: Math.round(d.score),
      leftBorderColor: colors.border,
      statusBgColor: colors.bg,
      statusTextColor: colors.text
    };
  }) || [];

  const improvementPlan = data?.personalized_improvement_plan || [];
  const leaderPlan = data?.leader_action_plan || [];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={isFetching} 
            onRefresh={onRefresh} 
            tintColor="#1CC8B0"
            colors={["#1CC8B0"]}
          />
        }
      >
        <HomeHeader />
        
        <View style={styles.mainContent}>
          {/* Wellness Alerts */}
          {/* <BurnoutAlert alert={data?.burnout_alert} /> */}

          {/* Check-In Banner */}
          <CheckInBanner type={(checkInStatus?.data?.next_checkin_type as any) || 'none'} />

          {/* Key Indicators */}
          <DashboardIndicators indicators={data?.dashboard_indicators} />

          {/* Tiered Metrics */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dimension Breakdown</Text>
            {metrics.map((metric, index) => (
              <MetricCard key={index} {...metric} />
            ))}
          </View>
 
          {/* Weekly Chart */}
          <WeeklyProgressChart data={data?.last_7_days_progress} />

          {/* Personalized Plan */}
          <ActionPlanSection 
            title="Personalized Improvement Plan" 
            icon={Zap}
            items={improvementPlan}
            backgroundColor="#E6F9F6"
          />

          {/* Leader Plan */}
          <ActionPlanSection 
            title="Leader Action Plan" 
            icon={Target}
            items={leaderPlan}
            backgroundColor="#EBF2FF"
          />

          {/* Streaks */}
          <BehaviorStreakGrid data={data?.behavior_streaks} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6FCFB',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  mainContent: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: '#0D2B6E',
    marginBottom: 16,
  },
});
