import React, { useState, useMemo } from "react";
import { View, StyleSheet, ScrollView, StatusBar, ActivityIndicator, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontFamily } from "../../src/constants/typography";
import Colors from "../../src/constants/colors";
import { useGetPerformanceReportQuery } from "../../src/redux/rtk/aiApi";

import ReportHeader from "../../src/components/ReportHeader";
import FilterSelector from "../../src/components/FilterSelector";
import OpsSummaryCard from "../../src/components/OpsSummaryCard";
import OpsTrendChart from "../../src/components/OpsTrendChart";
import DriverTrendSection from "../../src/components/DriverTrendSection";
import BehaviorTrendGrid from "../../src/components/BehaviorTrendGrid";
import PerformanceSummary from "../../src/components/PerformanceSummary";

export default function ReportScreen() {
  const [selectedWeek, setSelectedWeek] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("4"); // April (1-indexed)
  const [selectedYear, setSelectedYear] = useState(2026);

  const { data, isLoading, isError, refetch } = useGetPerformanceReportQuery({
    week: selectedWeek,
    month: selectedMonth,
    year: selectedYear,
  });

  const reportData = data?.data;

  const handleFilterChange = (type: "week" | "month" | "year", value: string | number) => {
    if (type === "week") setSelectedWeek(value.toString());
    if (type === "month") setSelectedMonth(value.toString());
    if (type === "year") setSelectedYear(Number(value));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <ReportHeader />
        
        <FilterSelector 
          selectedWeek={selectedWeek}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onFilterChange={handleFilterChange}
        />

        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Generating your report...</Text>
          </View>
        ) : isError ? (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>Failed to load report. Please try again.</Text>
            <Text style={styles.retryButton} onPress={() => refetch()}>Retry</Text>
          </View>
        ) : reportData ? (
          <>
            <OpsSummaryCard data={reportData.ops_summary} />
            <OpsTrendChart data={reportData.ops_trend} />
            <DriverTrendSection data={reportData.driver_trends} />
            <BehaviorTrendGrid data={reportData.behavior_trends} />
            <PerformanceSummary summary={reportData.performance_summary} />
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F6FCFB",
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  centerContainer: {
    flex: 1,
    paddingTop: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    fontFamily: FontFamily.regular,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  errorText: {
    fontFamily: FontFamily.medium,
    color: "#E53935",
    fontSize: 16,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 15,
    fontFamily: FontFamily.semiBold,
    color: Colors.primary,
    fontSize: 14,
    textDecorationLine: "underline",
  },
});
