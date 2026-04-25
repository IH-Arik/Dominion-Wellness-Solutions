import { api } from "./baseApi";

export interface UserSummary {
  name: string;
  greeting_message: string;
  profile_image: string | null;
}

export interface OverallPerformance {
  overall_score: number;
  score_label: string;
  percentage_change: number;
  summary_text: string;
}

export interface DimensionBreakdown {
  key: string;
  label: string;
  score: number;
  condition: string;
  description: string;
  status_tag: string;
}

export interface RadarChartData {
  key: string;
  label: string;
  score: number;
}

export interface ProgressDay {
  day_label: string;
  score_value: number | null;
}

export interface ImprovementPlanItem {
  title: string;
  description: string;
  based_on_dimension: string;
}

export interface BehaviorStreak {
  type: string;
  current_days: number;
  status: string;
}

export interface DashboardIndicator {
  key: string;
  label: string;
  value: string;
  status: string;
  meta: any;
}

export interface DashboardResponse {
  success: boolean;
  message: string;
  data: {
    user_summary: UserSummary;
    overall_performance: OverallPerformance;
    dimension_breakdown: DimensionBreakdown[];
    radar_chart_data: RadarChartData[];
    last_7_days_progress: ProgressDay[];
    personalized_improvement_plan: ImprovementPlanItem[];
    leader_action_plan: ImprovementPlanItem[];
    behavior_streaks: BehaviorStreak[];
    daily_checkin_status: {
      should_show_daily_checkin: boolean;
      last_checkin_date: string | null;
      daily_checkin_completed_today: boolean;
    };
    next_checkin_type: "daily" | "weekly" | "monthly" | "none";
    trend_insight: string;
    dashboard_indicators: DashboardIndicator[];
    burnout_alert: any;
    last_updated_at: string;
    live_sync_status: string;
  };
}

export interface PerformanceReportResponse {
  success: boolean;
  message: string;
  data: {
    filters: {
      weeks: Array<{ label: string; value: string | number }>;
      months: Array<{ label: string; value: number }>;
      years: Array<{ label: string; value: number }>;
      selected_week: string;
      selected_month: number;
      selected_year: number;
    };
    ops_summary: {
      overall_score: number;
      status: string;
      percentage_change: number;
      progress_value: number;
      comparison_label: string;
    };
    ops_trend: Array<{
      label: string;
      value: number;
      is_current: boolean;
    }>;
    driver_trends: Array<{
      key: string;
      label: string;
      current_score: number;
      delta: number;
      delta_label: string;
      color: string;
      sparkline: number[];
    }>;
    behavior_trends: Array<{
      key: string;
      label: string;
      status: string;
      bars: number[];
      color_scale: string[];
    }>;
    performance_summary: string;
    is_fallback_data: boolean;
    period_label: string;
  };
}

export interface ChatMessage {
  role: "assistant" | "user";
  content: string;
  created_at: string;
}

export interface ChatGreeting {
  title: string;
  status: string;
  greeting_message: string;
}

export interface ChatSuggestion {
  text: string;
}

export const aiApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDashboard: builder.query<DashboardResponse, void>({
      query: () => "/dashboard/home",
      providesTags: ["Dashboard"],
    }),
    getPerformanceReport: builder.query<
      PerformanceReportResponse,
      { week?: string; month?: number; year?: number }
    >({
      query: (params) => ({
        url: "/dashboard/report",
        params,
      }),
      providesTags: ["PerformanceReport"],
    }),
    getChatGreeting: builder.query<{ success: boolean; data: ChatGreeting }, void>({
      query: () => "/insights/chat/greeting",
    }),
    getChatSuggestions: builder.query<{ success: boolean; data: { suggestions: ChatSuggestion[] } }, void>({
      query: () => "/insights/chat/suggestions",
    }),
    getChatHistory: builder.query<{ success: boolean; data: { messages: ChatMessage[] } }, void>({
      query: () => "/insights/chat/history",
      providesTags: ["ChatHistory"],
    }),
    sendChatMessage: builder.mutation<{ success: boolean; data: string }, { message: string }>({
      query: (payload) => ({
        url: "/insights/chat",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["ChatHistory"],
    }),
  }),
  overrideExisting: false,
});

export const { 
  useGetDashboardQuery, 
  useGetPerformanceReportQuery,
  useGetChatGreetingQuery,
  useGetChatSuggestionsQuery,
  useGetChatHistoryQuery,
  useSendChatMessageMutation
} = aiApi;

