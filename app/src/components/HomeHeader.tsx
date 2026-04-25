import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell, ArrowUpRight, CheckCircle2 } from 'lucide-react-native';
import Svg, { Polygon, Line, G, Text as SvgText } from 'react-native-svg';
import { FontFamily, FontSize } from '../constants/typography';
import Colors from '../constants/colors';
import { useAppSelector } from '../redux/reduxHooks';
import { RadarChartData } from '../redux/rtk/aiApi';

const RadarChart = ({ data }: { data: RadarChartData[] | null }) => {
  const size = 200;
  const center = size / 2;
  const radius = 70;
  const angles = [0, 72, 144, 216, 288]; // 5 points for pentagon
  const labels = ['PC', 'MR', 'MC', 'PA', 'RC'];
  
  // Data points (normalized 0-1)
  const chartData = data && data.length === 5 ? data.map(d => (d.score || 0) / 100) : [0.6, 0.6, 0.6, 0.6, 0.6];
  
  const getPoint = (angle: number, r: number) => {
    const rad = (angle - 90) * (Math.PI / 180);
    return `${center + r * Math.cos(rad)},${center + r * Math.sin(rad)}`;
  };

  const points = angles.map((angle, i) => getPoint(angle, radius * chartData[i])).join(' ');
  const bgPoints = [radius, radius * 0.75, radius * 0.5, radius * 0.25].map(r => 
    angles.map(angle => getPoint(angle, r)).join(' ')
  );

  return (
    <View style={styles.chartContainer}>
      <Svg height={size} width={size}>
        {/* Background grids */}
        {bgPoints.map((p, i) => (
          <Polygon key={i} points={p} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        ))}
        {/* Axis lines and Labels */}
        {angles.map((angle, i) => {
          const x2 = center + radius * Math.cos((angle - 90) * (Math.PI / 180));
          const y2 = center + radius * Math.sin((angle - 90) * (Math.PI / 180));
          const lx = center + (radius + 20) * Math.cos((angle - 90) * (Math.PI / 180));
          const ly = center + (radius + 20) * Math.sin((angle - 90) * (Math.PI / 180));
          
          return (
            <G key={i}>
              <Line 
                x1={center} y1={center} 
                x2={x2} y2={y2} 
                stroke="rgba(255,255,255,0.2)" 
              />
              <SvgText
                x={lx}
                y={ly}
                fill="rgba(255,255,255,0.5)"
                fontSize="10"
                fontWeight="bold"
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {data ? data[i]?.key : labels[i]}
              </SvgText>
            </G>
          );
        })}
        {/* Data polygon */}
        <Polygon points={points} fill="rgba(28, 200, 176, 0.4)" stroke="#1CC8B0" strokeWidth="2" />
      </Svg>
    </View>
  );
};

const HomeHeader = () => {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const { dashboardData } = useAppSelector((state) => state.ai);
  
  const performance = dashboardData?.overall_performance;
  const userSummary = dashboardData?.user_summary;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "GOOD MORNING";
    if (hour < 18) return "GOOD AFTERNOON";
    return "GOOD EVENING";
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.userInfo}>
          <View style={styles.avatarBorder}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop' }} 
              style={styles.avatar}
            />
          </View>
          <View style={styles.nameWrap}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>{user?.name || "User"}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notificationBtn}>
          <Bell size={24} color={Colors.white} />
          <View style={styles.dot} />
        </TouchableOpacity>
      </View>

      {/* Radar Chart Section */}
      <RadarChart data={dashboardData?.radar_chart_data || null} />

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>OPTIMAL PERFORMANCE SCORE</Text>
        <View style={styles.scoreRow}>
          <Text style={styles.scoreText}>
            {Math.round(performance?.overall_score || 0)}{" "}
            <Text style={styles.scoreMax}>/ 100</Text>
          </Text>
          <View style={styles.trendBadge}>
            <ArrowUpRight size={14} color="#1CC8B0" />
            <Text style={styles.trendText}>
              {performance?.percentage_change !== undefined ? (performance.percentage_change >= 0 ? `+${performance.percentage_change}%` : `${performance.percentage_change}%`) : "0%"}
            </Text>
          </View>
        </View>
        <Text style={styles.statusText}>{performance?.score_label || "Pending"}</Text>
        <Text style={styles.description}>
          {performance?.summary_text || "Complete your assessment to see your performance profile."}
        </Text>
      </View>

      {/* CTA Button */}
      {dashboardData?.next_checkin_type && dashboardData?.next_checkin_type !== 'none' && (
        <TouchableOpacity 
          style={[
            styles.ctaButton, 
            dashboardData?.next_checkin_type === 'weekly' && { backgroundColor: '#6366F1' },
            dashboardData?.next_checkin_type === 'monthly' && { backgroundColor: '#F59E0B' }
          ]} 
          onPress={() => router.push({ pathname: '/checkin', params: { type: dashboardData?.next_checkin_type } } as any)}
        >
          <CheckCircle2 size={20} color={Colors.white} style={styles.ctaIcon} />
          <Text style={styles.ctaText}>
            Complete {dashboardData?.next_checkin_type.charAt(0).toUpperCase()}{dashboardData?.next_checkin_type.slice(1)} Check-in
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#002B5B',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBorder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#1CC8B0',
    padding: 2,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  nameWrap: {
    marginLeft: 12,
  },
  greeting: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    color: '#1CC8B0',
    letterSpacing: 1,
  },
  userName: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    color: Colors.white,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF5A5A',
    borderWidth: 1.5,
    borderColor: '#002B5B',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 180,
    marginVertical: 10,
  },
  summaryCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 20,
  },
  summaryLabel: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    color: '#1CC8B0',
    letterSpacing: 1,
    marginBottom: 8,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 2,
  },
  scoreText: {
    fontFamily: FontFamily.bold,
    fontSize: 40,
    color: Colors.white,
  },
  scoreMax: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.4)',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(28, 200, 176, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  trendText: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    color: '#1CC8B0',
    marginLeft: 4,
  },
  statusText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    color: '#1CC8B0',
    marginBottom: 12,
  },
  description: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 18,
  },
  linkText: {
    color: '#1CC8B0',
    textDecorationLine: 'underline',
  },
  ctaButton: {
    backgroundColor: '#1CC8B0',
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaIcon: {
    marginRight: 10,
  },
  ctaText: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: Colors.white,
  },
});

export default HomeHeader;
