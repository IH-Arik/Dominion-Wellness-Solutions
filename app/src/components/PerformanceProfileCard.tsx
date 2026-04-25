import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LineChart } from "lucide-react-native";
import { FontFamily, FontSize } from "../constants/typography";
import Colors from "../constants/colors";

interface PerformanceProfileCardProps {
  performance_profile: {
    current_ops_score: number;
    strongest_driver: string | null;
    focus_driver: string | null;
  };
}

const PerformanceProfileCard = ({ performance_profile }: PerformanceProfileCardProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>PERFORMANCE PROFILE</Text>
      <View style={styles.card}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.scoreLabel}>CURRENT OPS SCORE</Text>
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreMain}>{Math.round(performance_profile.current_ops_score || 0)}</Text>
              <Text style={styles.scoreTotal}> / 100</Text>
            </View>
          </View>
          <View style={styles.chartIconContainer}>
            <LineChart size={24} color="#1CC8B0" />
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.bottomRow}>
          <View style={styles.driverItem}>
            <Text style={styles.driverLabel}>STRONGEST DRIVER</Text>
            <Text style={styles.driverValueDetail}>{performance_profile.strongest_driver || 'N/A'}</Text>
          </View>
          <View style={styles.driverItem}>
            <Text style={styles.driverLabel}>FOCUS DRIVER</Text>
            <Text style={styles.driverValueFocus}>{performance_profile.focus_driver || 'N/A'}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: "#94A3B8",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#05214D", // Dark navy
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 4,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  scoreLabel: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    color: "#1CC8B0",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  scoreMain: {
    fontFamily: FontFamily.bold,
    fontSize: 36,
    color: Colors.white,
  },
  scoreTotal: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.lg,
    color: "#1CC8B0",
  },
  chartIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(28, 200, 176, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginBottom: 16,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  driverItem: {
    gap: 4,
    flex: 1,
  },
  driverLabel: {
    fontFamily: FontFamily.bold,
    fontSize: 9,
    color: "#94A3B8",
    letterSpacing: 0.5,
  },
  driverValueDetail: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: "#1CC8B0",
  },
  driverValueFocus: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: "#F97316",
  },
});

export default PerformanceProfileCard;
