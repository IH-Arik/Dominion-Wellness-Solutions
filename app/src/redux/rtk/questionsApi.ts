import { api } from "./baseApi";

export interface Question {
  id: string;
  text: string;
  driver: string;
  response_type: "scale" | "multiple_choice";
  options: string[];
  weight: number;
  order: number;
  step?: number;
}

export interface QuestionsResponse {
  success: boolean;
  message: string;
  data: {
    total?: number;
    total_questions?: number;
    page: number;
    size?: number;
    page_size?: number;
    total_pages: number;
    questions: Question[];
  };
}

export interface DailyCheckInAnswer {
  question_id: string;
  answer: string;
}

export interface DayProgress {
  day_label: string;
  date: string;
  completed: boolean;
  is_today: boolean;
}

export interface SubmitDailyCheckInResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    user_id: string;
    submitted_at: string;
    reflection_streak_days: number;
    week_progress: DayProgress[];
    weekly_completed_days: number;
    motivation_message: string;
  };
}

export interface SubmitWeeklyCheckInResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    user_id: string;
    submitted_at: string;
    overall_score: number;
    condition: string;
    current_daily_streak_days: number;
    achievement_title: string;
    achievement_delta: number;
    achievement_summary: string;
    weekly_progress_delta: number;
    focus_score: number;
    focus_score_label: string;
    focus_driver: string;
  };
}

export interface InsightData {
  insight: string;
  improvement_plan: string;
  goal_plan?: string;
  risk_plan?: string;
  overall_score: number;
  condition: string;
  dimension_scores: {
    PC: number;
    MR: number;
    MC: number;
    PA: number;
    RC: number;
  };
  trend_insight: string;
  last_updated_at: string;
  live_sync_status: string;
}

export interface InsightResponse {
  success: boolean;
  message: string;
  data: InsightData;
}

export interface DailyCheckInPayload {
  answers: DailyCheckInAnswer[];
  behaviors?: string[];
}

export const questionsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getQuestions: builder.query<QuestionsResponse, { page: number; size?: number }>({
      query: ({ page, size = 5 }) => ({
        url: "/questions",
        params: { page, size },
      }),
    }),
    getDailyQuestions: builder.query<QuestionsResponse, { page: number }>({
      query: ({ page }) => ({
        url: "/daily-checkins/questions",
        params: { page },
      }),
    }),
    submitDailyCheckIn: builder.mutation<SubmitDailyCheckInResponse, DailyCheckInPayload>({
      query: (payload) => ({
        url: "/daily-checkins",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ['CheckInStatus', 'Dashboard'],
    }),
    getWeeklyQuestions: builder.query<QuestionsResponse, { page: number }>({
      query: ({ page }) => ({
        url: "/weekly-checkins/questions",
        params: { page },
      }),
    }),
    submitWeeklyCheckIn: builder.mutation<SubmitWeeklyCheckInResponse, DailyCheckInPayload>({
      query: (payload) => ({
        url: "/weekly-checkins",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ['CheckInStatus', 'Dashboard'],
    }),
    getMonthlyQuestions: builder.query<QuestionsResponse, { page: number }>({
      query: ({ page }) => ({
        url: "/monthly-checkins/questions",
        params: { page },
      }),
    }),
    submitMonthlyCheckIn: builder.mutation<SubmitMonthlyCheckInResponse, DailyCheckInPayload>({
      query: (payload) => ({
        url: "/monthly-checkins",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ['CheckInStatus', 'Dashboard'],
    }),
    getCheckInStatus: builder.query<{ success: boolean; data: { next_checkin_type: string } }, void>({
      query: () => "/dashboard/checkin-status",
      providesTags: ['CheckInStatus'],
    }),
    getLatestInsight: builder.query<InsightResponse, void>({
      query: () => "/insights/latest",
      providesTags: ['Dashboard'], // Invalidate on check-in submission
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetQuestionsQuery,
  useLazyGetQuestionsQuery,
  useGetDailyQuestionsQuery,
  useSubmitDailyCheckInMutation,
  useGetWeeklyQuestionsQuery,
  useSubmitWeeklyCheckInMutation,
  useGetMonthlyQuestionsQuery,
  useSubmitMonthlyCheckInMutation,
  useGetCheckInStatusQuery,
  useGetLatestInsightQuery,
} = questionsApi;
