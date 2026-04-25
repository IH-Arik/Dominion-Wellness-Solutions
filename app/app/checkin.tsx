import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { X } from "lucide-react-native";
import { CheckInOptionGrid, SuccessState } from "../src/components";
import { FontFamily, FontSize } from "../src/constants/typography";
import Colors from "../src/constants/colors";
import {
  useGetDailyQuestionsQuery,
  useSubmitDailyCheckInMutation,
  useGetWeeklyQuestionsQuery,
  useSubmitWeeklyCheckInMutation,
  useGetMonthlyQuestionsQuery,
  useSubmitMonthlyCheckInMutation,
} from "../src/redux/rtk/questionsApi";
import { SafeAreaView } from "react-native-safe-area-context";

type CheckInType = "daily" | "weekly" | "monthly";

const UnifiedCheckInScreen = () => {
  const router = useRouter();
  const { type = "daily" } = useLocalSearchParams<{ type: CheckInType }>();
  const [step, setStep] = useState(1);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [submissionResult, setSubmissionResult] = useState<any>(null);

  // Hook Selection based on type
  const dailyQuery = useGetDailyQuestionsQuery(
    { page: step },
    { skip: type !== "daily" },
  );
  const weeklyQuery = useGetWeeklyQuestionsQuery(
    { page: step },
    { skip: type !== "weekly" },
  );
  const monthlyQuery = useGetMonthlyQuestionsQuery(
    { page: step },
    { skip: type !== "monthly" },
  );

  const [submitDaily] = useSubmitDailyCheckInMutation();
  const [submitWeekly] = useSubmitWeeklyCheckInMutation();
  const [submitMonthly] = useSubmitMonthlyCheckInMutation();

  const activeQuery =
    type === "weekly"
      ? weeklyQuery
      : type === "monthly"
        ? monthlyQuery
        : dailyQuery;

  const questions = activeQuery.data?.data?.questions || [];
  const totalPages = activeQuery.data?.data?.total_pages || 1;
  const isLoading = activeQuery.isLoading;
  const isError = activeQuery.isError;
  const error = activeQuery.error;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const getThemeColor = () => {
    switch (type) {
      case "weekly":
        return "#6366F1";
      case "monthly":
        return "#F59E0B";
      default:
        return "#0D2B6E";
    }
  };

  const getTitle = () => {
    switch (type) {
      case "weekly":
        return "Weekly Reflection";
      case "monthly":
        return "Monthly Review";
      default:
        return "Daily Check-In";
    }
  };

  const handleSelect = (id: string, option: string) => {
    setSelections((prev) => ({ ...prev, [id]: option }));
  };

  const isCurrentPageComplete =
    questions.length > 0 && questions.every((q) => selections[q.id]);

  const handleNext = () => {
    if (step < totalPages) {
      setStep((prev) => prev + 1);
    } else {
      handleDone();
    }
  };

  const handleDone = async () => {
    const answers = Object.entries(selections).map(([question_id, answer]) => ({
      question_id,
      answer,
    }));

    setIsSubmitting(true);
    try {
      let result;
      if (type === "weekly") {
        result = await submitWeekly({ answers }).unwrap();
      } else if (type === "monthly") {
        result = await submitMonthly({ answers }).unwrap();
      } else {
        result = await submitDaily({ answers }).unwrap();
      }
      setSubmissionResult(result.data);
      setStep(totalPages + 1); // Move to success state
    } catch (err) {
      console.error(`${type} submission failed:`, err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step > totalPages) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F6FCFB" }}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <X size={24} color="#0D2B6E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{getTitle()}</Text>
          <View style={{ width: 24 }} />
        </View>
        <SuccessState
          onReturn={() => router.replace("/(tabs)")}
          data={submissionResult}
          type={type}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <X size={24} color="#0D2B6E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getTitle()}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.progressHeader}>
        <Text style={styles.progressText}>
          {step}/{totalPages}
        </Text>
        <Text style={styles.stepText}>Step {step}</Text>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              marginTop: 50,
            }}
          >
            <ActivityIndicator size="large" color={getThemeColor()} />
          </View>
        ) : isError ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              marginTop: 50,
            }}
          >
            <Text style={{ color: Colors.error || "red", textAlign: "center" }}>
              Failed to load questions.{"\n"}
              Please check your connection or server.
            </Text>
            <TouchableOpacity
              onPress={() => setStep(1)}
              style={{
                marginTop: 20,
                padding: 10,
                backgroundColor: getThemeColor(),
                borderRadius: 8,
              }}
            >
              <Text style={{ color: "white" }}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          questions.map((q) => (
            <CheckInOptionGrid
              key={q.id}
              question={q.text}
              options={q.options}
              selectedOption={selections[q.id] || null}
              onSelect={(option) => handleSelect(q.id, option)}
            />
          ))
        )}

        <View style={styles.buttonRow}>
          {step > 1 && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setStep((prev) => prev - 1)}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[
              styles.nextButton,
              { backgroundColor: getThemeColor() },
              !isCurrentPageComplete && styles.disabledButton,
              step === 1 && { flex: 1 },
            ]}
            onPress={handleNext}
            disabled={!isCurrentPageComplete || isLoading || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.nextButtonText}>
                {step === totalPages ? "Finish" : "Next"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F6FCFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.lg,
    color: "#1E293B",
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  progressText: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    color: "#94A3B8",
  },
  stepText: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    color: "#94A3B8",
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 20,
  },
  backButton: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#94A3B8",
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonText: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: "#FFFFFF",
  },
  nextButton: {
    flex: 2,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  nextButtonText: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: "#FFFFFF",
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default UnifiedCheckInScreen;
