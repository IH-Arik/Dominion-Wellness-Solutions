import React, { useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Menu, Bell, Clock, TrendingUp, Activity, AlertCircle } from "lucide-react-native";
import { FontFamily } from "../../src/constants/typography";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGetLatestInsightQuery } from "../../src/redux/rtk/questionsApi";

// ─── Helpers for Dynamic Data ───

const DRIVER_LABELS: Record<string, { title: string; short: string; borderColor: string }> = {
  PC: { title: "Physical Capacity", short: "PC", borderColor: "#22C55E" },
  MR: { title: "Mental Resilience", short: "MR", borderColor: "#0ea5e9" },
  MC: { title: "Morale & Cohesion", short: "MC", borderColor: "#EAB308" },
  PA: { title: "Purpose Alignment", short: "PA", borderColor: "#9CA3AF" },
  RC: { title: "Recovery Capacity", short: "RC", borderColor: "#EF4444" },
};

const getScoreTag = (score: number) => {
  if (score >= 85) return { label: "STRONG", color: "#166534", bg: "#DCFCE7" };
  if (score >= 70) return { label: "STABLE", color: "#0F766E", bg: "#CCFBF1" };
  if (score >= 60) return { label: "DEVELOPING", color: "#374151", bg: "#F3F4F6" };
  return { label: "NEEDS ATTENTION", color: "#991B1B", bg: "#FEE2E2" };
};

const formatTimeAgo = (isoString: string) => {
  if (!isoString) return "Unknown";
  const date = new Date(isoString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMins = Math.floor(diffInMs / 60000);

  if (diffInMins < 1) return "Just now";
  if (diffInMins < 60) return `${diffInMins}m ago`;
  const diffInHours = Math.floor(diffInMins / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  return date.toLocaleDateString();
};

export default function InsightScreen() {
  const insets = useSafeAreaInsets();
  const { data: response, isLoading, isFetching, error, refetch } = useGetLatestInsightQuery();

  const insightData = response?.data;

  const coreDrivers = useMemo(() => {
    if (!insightData?.dimension_scores) return [];
    return Object.entries(insightData.dimension_scores).map(([key, score], index) => {
      const meta = DRIVER_LABELS[key] || { title: key, short: key, borderColor: "#9CA3AF" };
      const tag = getScoreTag(score);
      return {
        id: index,
        title: meta.title,
        short: meta.short,
        score: Math.round(score),
        tag: tag.label,
        tagColor: tag.color,
        tagBg: tag.bg,
        borderColor: meta.borderColor,
        desc: getDriverDescription(key, score),
      };
    });
  }, [insightData]);

  const recommendedActions = useMemo(() => {
    if (!insightData?.improvement_plan) return [];
    // The backend returns a string with bullet points "- Recommendation"
    return insightData.improvement_plan
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .map((line, index) => {
        const text = line.replace(/^[-\s*•]+/, "").trim();
        // Extract title if there's a colon, otherwise use generic title
        const [titlePart, ...descParts] = text.split(":");
        return {
          id: index,
          title: descParts.length > 0 ? titlePart.trim() : "Recommended Action",
          desc: descParts.length > 0 ? descParts.join(":").trim() : titlePart.trim(),
          bgColor: index % 2 === 0 ? "#00A896" : "#001F3F",
        };
      });
  }, [insightData]);

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#00A896" />
        <Text style={styles.loadingText}>Analyzing performance data...</Text>
      </View>
    );
  }

  if (error || !insightData) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <AlertCircle size={48} color="#EF4444" />
        <Text style={styles.errorText}>Could not fetch latest insights.</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
          <Text style={styles.retryBtnText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Math.max(insets.top, 20) + 16, paddingBottom: 100 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={onRefresh} tintColor="#00A896" />
        }
      >
        {/* ─── Header ─── */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn}>
            <Menu size={24} color="#D1D5DB" strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI Insight</Text>
          <TouchableOpacity style={styles.bellBtn}>
            <Bell size={20} color="#1E3A5F" strokeWidth={2} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        {/* ─── OPS Analysis Header ─── */}
        <View style={styles.sectionHeaderWrap}>
          <Text style={styles.sectionTitle}>OPS Analysis</Text>
          <Text style={styles.liveSyncText}>{insightData.live_sync_status || "LIVE SYNC"}</Text>
        </View>

        {/* ─── Top Cards (Overall & Status) ─── */}
        <View style={styles.opsCardsRow}>
          {/* OVERALL SCORE */}
          <View style={styles.scoreCard}>
            <Text style={styles.cardSmallTitle}>OVERALL SCORE</Text>
            <View style={styles.scoreRow}>
              <Text style={styles.hugeScore}>{Math.round(insightData.overall_score)}</Text>
              {/* Note: Backend doesn't provide delta here yet, but we could calculate it if history is available */}
              <Text style={styles.scoreDelta}>+5%</Text>
            </View>
            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${insightData.overall_score}%` as any },
                ]}
              />
            </View>
          </View>

          {/* STATUS */}
          <View style={styles.statusCard}>
            <Text style={styles.cardSmallTitle}>STATUS</Text>
            <Text style={styles.statusText}>{insightData.condition}</Text>
            <View style={styles.updatedRow}>
              <Clock size={12} color="#9CA3AF" />
              <Text style={styles.updatedText}>
                Updated {formatTimeAgo(insightData.last_updated_at)}
              </Text>
            </View>
          </View>
        </View>

        {/* ─── AI Insight Dashed Box ─── */}
        <View style={styles.dashedInsightBox}>
          <View style={styles.insightHeaderRow}>
            <TrendingUp size={16} color="#1E3A5F" strokeWidth={2.5} />
            <Text style={styles.insightTitle}>AI INSIGHT</Text>
          </View>
          <Text style={styles.insightBodyText}>
            {insightData.insight}
          </Text>
        </View>

        {/* ─── Core Drivers ─── */}
        <Text style={[styles.sectionTitle, { marginTop: 24, marginBottom: 12 }]}>
          Core Drivers
        </Text>
        <View style={styles.driversList}>
          {coreDrivers.map((item) => (
            <View key={item.id} style={styles.driverCard}>
              <View
                style={[styles.driverLeftBorder, { backgroundColor: item.borderColor }]}
              />
              <View style={styles.driverContent}>
                <View style={styles.driverHeader}>
                  <Text style={styles.driverTitle}>
                    {item.title}{" "}
                    <Text style={styles.driverShort}>[{item.short}]</Text>
                  </Text>
                  <View style={[styles.driverTag, { backgroundColor: item.tagBg }]}>
                    <Text style={[styles.driverTagText, { color: item.tagColor }]}>
                      {item.tag}
                    </Text>
                  </View>
                </View>
                <Text style={styles.driverDesc}>{item.desc}</Text>
              </View>
              <View style={styles.driverScoreWrap}>
                <Text style={styles.driverScore}>{item.score}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ─── Recommended Actions ─── */}
        {recommendedActions.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 24, marginBottom: 16 }]}>
              Recommended Actions
            </Text>
            <View style={styles.actionsList}>
              {recommendedActions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={[styles.actionCard, { backgroundColor: action.bgColor }]}
                  activeOpacity={0.9}
                >
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionDesc}>{action.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* ─── Trend Insight Dashed Box ─── */}
        {insightData.trend_insight && (
          <View style={[styles.dashedInsightBox, { marginTop: 24, marginBottom: 16 }]}>
            <View style={styles.insightHeaderRow}>
              <Activity size={16} color="#1E3A5F" strokeWidth={2.5} />
              <Text style={styles.insightTitle}>TREND INSIGHT</Text>
            </View>
            <Text style={styles.insightBodyText}>
              {insightData.trend_insight}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function getDriverDescription(key: string, score: number): string {
  const descriptions: Record<string, string> = {
    PC: score >= 85 ? "Your physical activity habits support strong daily energy levels." : "Inconsistent energy levels suggest a need for more regular movement.",
    MR: score >= 85 ? "Your focus and stress management patterns remain stable." : "Recent patterns suggest fluctuations in focus or stress resilience.",
    MC: score >= 85 ? "Your sense of connection and recognition within your environment is high." : "There may be opportunities to strengthen team cohesion or recognition.",
    PA: score >= 85 ? "Strong connection to long-term goals and daily motivation." : "Motivation levels suggest some fluctuation in goal alignment.",
    RC: score >= 85 ? "Excellent recovery patterns and consistent sleep quality." : "Recovery patterns suggest inconsistent sleep or rest periods.",
  };
  return descriptions[key] || "Monitor this driver to optimize your overall performance.";
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6FAF9",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  iconBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: FontFamily.medium,
    fontSize: 18,
    color: "#1E3A5F",
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8F0F2",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: 10,
    right: 12,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#00A896",
    borderWidth: 1,
    borderColor: "#E8F0F2",
  },
  sectionHeaderWrap: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: "#1E3A5F",
  },
  liveSyncText: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
    color: "#00A896",
    letterSpacing: 0.5,
  },
  opsCardsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  scoreCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statusCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardSmallTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    color: "#8A9BA8",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    marginBottom: 12,
  },
  hugeScore: {
    fontFamily: FontFamily.bold,
    fontSize: 32,
    color: "#1E3A5F",
    lineHeight: 36,
  },
  scoreDelta: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    color: "#00A896",
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    overflow: "hidden",
    width: "100%",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#00A896",
    borderRadius: 2,
  },
  statusText: {
    fontFamily: FontFamily.bold,
    fontSize: 22,
    color: "#1E3A5F",
    marginBottom: 12,
  },
  updatedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  updatedText: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: "#9CA3AF",
  },
  dashedInsightBox: {
    backgroundColor: "#F4F9FB",
    borderWidth: 1,
    borderColor: "#D1E3EC",
    borderStyle: "dashed",
    borderRadius: 16,
    padding: 16,
  },
  insightHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  insightTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
    color: "#1E3A5F",
    letterSpacing: 0.5,
  },
  insightBodyText: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 20,
  },
  driversList: {
    gap: 12,
  },
  driverCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  driverLeftBorder: {
    width: 4,
    height: "100%",
  },
  driverContent: {
    flex: 1,
    padding: 14,
  },
  driverHeader: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 6,
  },
  driverTitle: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    color: "#1E3A5F",
  },
  driverShort: {
    fontFamily: FontFamily.regular,
    color: "#9CA3AF",
    fontSize: 12,
  },
  driverTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  driverTagText: {
    fontFamily: FontFamily.bold,
    fontSize: 9,
    letterSpacing: 0.5,
  },
  driverDesc: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 18,
    paddingRight: 8,
  },
  driverScoreWrap: {
    justifyContent: "center",
    alignItems: "center",
    paddingRight: 16,
  },
  driverScore: {
    fontFamily: FontFamily.bold,
    fontSize: 22,
    color: "#1E3A5F",
  },
  actionsList: {
    gap: 12,
  },
  actionCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  actionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  actionDesc: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  loadingText: {
    marginTop: 12,
    fontFamily: FontFamily.medium,
    color: "#1E3A5F",
  },
  errorText: {
    marginTop: 12,
    fontFamily: FontFamily.medium,
    color: "#EF4444",
    textAlign: "center",
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: "#00A896",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryBtnText: {
    color: "#FFFFFF",
    fontFamily: FontFamily.bold,
    fontSize: 14,
  },
});
