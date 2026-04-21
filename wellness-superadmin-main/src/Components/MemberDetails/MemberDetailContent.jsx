import { useEffect, useMemo, useState } from "react";
import { message } from "antd";
import {
  Activity,
  CheckSquare,
  ChevronDown,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { RefreshingOverlay } from "../App/AsyncState";

function clampPercent(value) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getInitials(name) {
  return String(name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";
}

function formatDateLabel(value) {
  if (!value) {
    return "N/A";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "N/A";
  }
  return parsed.toLocaleDateString();
}

function formatRelativeTime(value) {
  if (!value) {
    return "Recently";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Recently";
  }

  const diffMs = Date.now() - parsed.getTime();
  const diffDays = Math.max(Math.floor(diffMs / (1000 * 60 * 60 * 24)), 0);
  if (diffDays === 0) {
    return "Today";
  }
  if (diffDays === 1) {
    return "1 day ago";
  }
  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }
  if (diffDays < 14) {
    return "1 week ago";
  }
  return `${Math.floor(diffDays / 7)} weeks ago`;
}

function getConditionTone(condition) {
  const normalized = String(condition || "").toLowerCase();
  if (normalized.includes("optimal") || normalized.includes("success")) {
    return {
      pill: "bg-teal-100 text-teal-700",
      text: "text-teal-500",
      accent: "bg-teal-500",
      border: "border-teal-200",
      signal: "success",
    };
  }
  if (normalized.includes("stable") || normalized.includes("steady")) {
    return {
      pill: "bg-cyan-100 text-cyan-700",
      text: "text-cyan-600",
      accent: "bg-cyan-500",
      border: "border-cyan-200",
      signal: "steady",
    };
  }
  if (
    normalized.includes("strain") ||
    normalized.includes("watch") ||
    normalized.includes("moderate") ||
    normalized.includes("low")
  ) {
    return {
      pill: "bg-amber-100 text-amber-700",
      text: "text-amber-600",
      accent: "bg-amber-500",
      border: "border-amber-200",
      signal: "warning",
    };
  }
  return {
    pill: "bg-rose-100 text-rose-700",
    text: "text-rose-600",
    accent: "bg-rose-500",
    border: "border-rose-200",
    signal: "critical",
  };
}

function getRiskSignalTone(signalKey) {
  return signalKey === "none"
    ? {
        border: "border-t-teal-600",
        icon: "text-teal-600",
        heading: "text-teal-600",
        subheading: "text-teal-500",
      }
    : {
        border: "border-t-rose-600",
        icon: "text-rose-600",
        heading: "text-rose-600",
        subheading: "text-rose-500",
      };
}

function normalizeSignalItem(item) {
  const tone = getConditionTone(item.status);
  return {
    ...item,
    tone,
    valueLabel:
      typeof item.value === "number" && Number.isFinite(item.value)
        ? `${Math.round(item.value)}`
        : null,
  };
}

function normalizeActionEntry(entry) {
  const scopeLabel = entry.scope_label || entry.team || entry.department || "Selected scope";
  return {
    id: entry.id || `${entry.created_at || entry.action || "log"}-${scopeLabel}`,
    title: entry.title || entry.action || "Leadership action logged",
    description:
      entry.description ||
      entry.note ||
      `Logged for ${scopeLabel}.`,
    relativeTime:
      entry.relative_time ||
      entry.created_at_label ||
      formatRelativeTime(entry.created_at),
    scopeLabel,
    selectedFromRecommended: Boolean(entry.selected_from_recommended),
  };
}

function buildOpsTrendSeries(trendPayload) {
  const points = trendPayload?.points || [];
  return points.map((point) => ({
    ...point,
    actual:
      typeof point.actual === "number" && Number.isFinite(point.actual)
        ? Math.round(point.actual * 100) / 100
        : null,
    benchmark:
      typeof point.benchmark === "number" && Number.isFinite(point.benchmark)
        ? Math.round(point.benchmark * 100) / 100
        : null,
  }));
}

function OpsTrendTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }

  const actual = payload.find((item) => item.dataKey === "actual")?.value;
  const benchmark = payload.find((item) => item.dataKey === "benchmark")?.value;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <div className="mt-2 space-y-1 text-sm font-semibold text-slate-600">
        <p>Actual: {actual ?? "No score"}</p>
        <p>Benchmark: {benchmark ?? "N/A"}</p>
      </div>
    </div>
  );
}

export default function MemberDetailContent({
  data,
  isRefreshing = false,
  refreshingLabel = "Updating member details...",
  onSubmitAction,
  isSubmittingAction = false,
  hideLeadershipActionForm = false,
}) {
  const [apiMessage, contextHolder] = message.useMessage();
  const [recommendedAction, setRecommendedAction] = useState("");
  const [customAction, setCustomAction] = useState("");
  const [notes, setNotes] = useState("");

  const member = data.member_summary || {};
  const riskSignal = data.primary_risk_signal || {};
  const drivers = data.core_wellness_drivers || [];
  const indicators = data.indicator_cards || [];
  const signalsPanel = data.signals_14_day || { items: [] };
  const actionLog = data.leadership_action_log || [];
  const actionForm = data.leadership_action_form || {};
  const readOnly = Boolean(data.read_only);
  const showLeadershipActionForm = !readOnly && !hideLeadershipActionForm;

  const scoreTone = getConditionTone(member.current_status_label || member.current_condition);
  const riskSignalTone = getRiskSignalTone(riskSignal.key);
  const normalizedDrivers = useMemo(
    () =>
      drivers.map((driver) => ({
        ...driver,
        percent: clampPercent(driver.score),
        tone: getConditionTone(driver.condition),
      })),
    [drivers]
  );
  const normalizedIndicators = useMemo(
    () =>
      indicators.map((indicator) => ({
        ...indicator,
        tone: getConditionTone(indicator.status || indicator.value),
      })),
    [indicators]
  );
  const normalizedSignals = useMemo(
    () => (signalsPanel.items || []).map(normalizeSignalItem),
    [signalsPanel.items]
  );
  const normalizedActionLog = useMemo(
    () => actionLog.map(normalizeActionEntry),
    [actionLog]
  );
  const opsTrendSeries = useMemo(
    () => buildOpsTrendSeries(data.ops_score_trend),
    [data.ops_score_trend]
  );
  const hasOpsTrendData = opsTrendSeries.some((point) => typeof point.actual === "number");
  const currentOpsScore =
    typeof member.current_ops_score === "number" && Number.isFinite(member.current_ops_score)
      ? Math.round(member.current_ops_score)
      : null;

  useEffect(() => {
    setRecommendedAction("");
    setCustomAction("");
    setNotes("");
  }, [member.user_id]);

  async function handleSubmitAction() {
    if (!onSubmitAction || readOnly) {
      return;
    }

    const selectedRecommendedAction = recommendedAction.trim();
    const selectedCustomAction = customAction.trim();
    const actionText = selectedCustomAction || selectedRecommendedAction;

    if (!actionText) {
      apiMessage.error("Select a recommended action or write a custom action.");
      return;
    }

    try {
      await onSubmitAction({
        action: actionText,
        note: notes.trim(),
        selectedFromRecommended:
          Boolean(selectedRecommendedAction) && selectedCustomAction.length === 0,
      });
      apiMessage.success("Leadership action logged successfully.");
      setRecommendedAction("");
      setCustomAction("");
      setNotes("");
    } catch (error) {
      apiMessage.error(
        error?.response?.data?.message ||
          error?.response?.data?.detail?.message ||
          "Failed to log leadership action."
      );
    }
  }

  return (
    <div
      className="relative min-h-screen bg-[#f9fafb] p-6 pt-24 font-sans"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {contextHolder}
      {isRefreshing ? <RefreshingOverlay label={refreshingLabel} /> : null}

      <div className="mb-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            {member.profile_image_url ? (
              <img
                src={member.profile_image_url}
                alt={member.name}
                className="h-24 w-24 rounded-[24px] object-cover shadow-md"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-[24px] bg-slate-900 text-3xl font-black uppercase text-white shadow-md">
                {getInitials(member.name)}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-[#0b1b36]">
                    {member.name || "Unknown Member"}
                  </h1>
                  <p className="mt-2 text-sm font-medium text-slate-500">
                    {member.role || "Role unavailable"}
                    {member.company ? ` at ${member.company}` : ""}
                  </p>
                </div>

                {readOnly ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Read Only
                  </span>
                ) : null}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {member.department ? (
                  <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                    {member.department}
                  </span>
                ) : null}
                {member.team ? (
                  <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                    {member.team}
                  </span>
                ) : null}
                <span className={`rounded-md px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${scoreTone.pill}`}>
                  {member.current_status_label || member.current_condition || "No score"}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  Last updated: {formatDateLabel(member.updated_at)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0b1b36] via-[#16355d] to-[#0e766e] p-6 text-white shadow-xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-300">
                Current OPS Score
              </p>
              <div className="mt-4 flex items-end gap-2">
                <span className="text-6xl font-black leading-none">
                  {currentOpsScore ?? "--"}
                </span>
                <span className="pb-1 text-lg font-bold text-slate-300">/ 100</span>
              </div>
            </div>
            <Sparkles className="h-5 w-5 text-cyan-300" />
          </div>

          <div className="mt-5 rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-slate-200">Condition</span>
              <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${scoreTone.border} ${scoreTone.text}`}>
                {member.current_status_label || member.current_condition || "No score"}
              </span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full ${scoreTone.accent}`}
                style={{ width: `${clampPercent(member.current_ops_score)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="space-y-6">
          <div className={`rounded-[28px] border border-slate-100 border-t-4 bg-white p-6 shadow-sm ${riskSignalTone.border}`}>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                Primary Risk Signal
              </span>
              <Activity className={`h-4 w-4 ${riskSignalTone.icon}`} />
            </div>
            <h2 className={`text-3xl font-black tracking-tight ${riskSignalTone.heading}`}>
              {riskSignal.headline || riskSignal.label || "No Immediate Risk"}
            </h2>
            <p className={`mt-2 text-xs font-black uppercase tracking-[0.2em] ${riskSignalTone.subheading}`}>
              {riskSignal.trend || "Stable"}
            </p>
            <p className="mt-4 text-[13px] font-medium leading-relaxed text-slate-600">
              {riskSignal.summary || "No summary available for this member yet."}
            </p>
          </div>

          {!showLeadershipActionForm ? (
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-slate-100 p-3 text-slate-600">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0b1b36]">Read-Only Member View</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    This drill-down is scoped for review only. Team actions stay available from the main management views.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-slate-700" />
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Log Leadership Action</h3>
                  <p className="text-xs text-slate-400">
                    Record the next intervention for this member&apos;s current team scope.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                    Recommended Action
                  </label>
                  <div className="relative">
                    <select
                      value={recommendedAction}
                      onChange={(event) => setRecommendedAction(event.target.value)}
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-4 pr-10 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-slate-200"
                    >
                      <option value="">Select from recommendations...</option>
                      {(actionForm.recommended_actions || []).map((action) => (
                        <option key={action} value={action}>
                          {action}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                    Custom Action
                  </label>
                  <input
                    type="text"
                    value={customAction}
                    onChange={(event) => setCustomAction(event.target.value)}
                    placeholder={actionForm.custom_action_placeholder || "Enter custom leadership action..."}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder={actionForm.notes_placeholder || "Add context or follow-up notes..."}
                    className="h-32 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSubmitAction}
                  disabled={isSubmittingAction}
                  className="w-full rounded-xl bg-[#0b1b36] py-3.5 text-sm font-bold text-white shadow-md transition-colors hover:bg-[#112750] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmittingAction ? "Sending..." : "Send Action"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-slate-100 bg-white p-8 shadow-sm">
            <h3 className="mb-8 text-sm font-extrabold text-[#0b1b36]">Core Wellness Drivers</h3>
            <div className="space-y-6">
              {normalizedDrivers.length === 0 ? (
                <p className="text-sm text-slate-400">No driver data is available for this member yet.</p>
              ) : (
                normalizedDrivers.map((driver) => (
                  <div key={driver.key}>
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <span className="text-[13px] font-bold text-slate-700">{driver.label}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-[13px] font-black text-slate-700">
                          {clampPercent(driver.score)}%
                        </span>
                        <span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${driver.tone.pill}`}>
                          {driver.condition}
                        </span>
                      </div>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${driver.tone.accent}`}
                        style={{ width: `${driver.percent}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {normalizedIndicators.map((card) => (
              <div
                key={card.key}
                className={`rounded-[24px] border bg-white p-6 shadow-sm ${
                  card.tone.signal === "critical"
                    ? "border-rose-100 border-l-[6px] border-l-rose-500"
                    : "border-slate-100"
                }`}
              >
                <h4 className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  {card.label}
                </h4>
                <p className={`text-2xl font-black ${card.tone.text}`}>{card.value}</p>
                <p className="mt-1 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                  {card.status}
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${card.tone.accent}`} />
                  <span className="text-[13px] font-medium text-slate-500">
                    {card.note || "Monitoring the latest member signal."}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_320px]">
            <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#0b1b36]">
                    OPS Score Trend ({data.selected_range || "30d"})
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Historical member score versus the benchmark line.
                  </p>
                </div>
                <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                    {data.ops_score_trend?.benchmark_label || "Benchmark"}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-teal-600" />
                    {data.ops_score_trend?.actual_label || "Actual"}
                  </div>
                </div>
              </div>

              {hasOpsTrendData ? (
                <div className="h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={opsTrendSeries} margin={{ top: 8, right: 16, left: -12, bottom: 8 }}>
                      <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="4 4" />
                      <XAxis
                        dataKey="day_label"
                        axisLine={false}
                        tickLine={false}
                        minTickGap={32}
                        tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 700 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        width={38}
                        domain={[0, 100]}
                        tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 700 }}
                      />
                      <Tooltip content={<OpsTrendTooltip />} cursor={{ stroke: "#cbd5e1", strokeWidth: 1 }} />
                      <Line
                        type="monotone"
                        dataKey="benchmark"
                        stroke="#cbd5e1"
                        strokeWidth={2}
                        dot={false}
                        strokeDasharray="6 6"
                      />
                      <Line
                        type="monotone"
                        dataKey="actual"
                        stroke="#0d9488"
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 5, fill: "#0d9488", stroke: "#ffffff", strokeWidth: 2 }}
                        connectNulls
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-[320px] items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-slate-50 text-sm font-medium text-slate-400">
                  No OPS score history is available for this range yet.
                </div>
              )}
            </div>

            <div className="rounded-[28px] bg-gradient-to-b from-[#0b1b36] to-[#12315c] p-6 text-white shadow-lg">
              <h3 className="text-sm font-bold text-white">
                {signalsPanel.title || "14-Day Signals"}
              </h3>

              <div className="mt-6 space-y-4">
                {normalizedSignals.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                    No recent 14-day signal data is available.
                  </div>
                ) : (
                  normalizedSignals.map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between gap-4 border-b border-slate-700/50 pb-4 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="text-[15px] font-semibold text-white">{item.label}</p>
                        <p className="mt-1 text-xs text-slate-400">
                          {item.valueLabel ? `Signal score: ${item.valueLabel}` : "Tracking latest member signal"}
                        </p>
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${item.tone.border} ${item.tone.pill}`}>
                        {item.status}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-6 rounded-2xl bg-white/8 p-4 text-[12px] font-medium leading-relaxed text-slate-300">
                {signalsPanel.insight || "Stability is being monitored across all domains."}
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-100 bg-white p-8 shadow-sm">
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#0b1b36]">Leadership Action Log</h3>
                <p className="mt-1 text-xs text-slate-400">
                  Latest recorded actions for this member&apos;s current scope.
                </p>
              </div>
              <span className="inline-flex items-center rounded-full bg-teal-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-teal-800">
                Read Only
              </span>
            </div>

            <div className="space-y-6">
              {normalizedActionLog.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
                  No actions have been logged for this scope yet.
                </p>
              ) : (
                normalizedActionLog.map((action) => (
                  <div
                    key={action.id}
                    className="flex flex-col gap-4 border-b border-slate-100 pb-6 last:border-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div className="flex items-start gap-4">
                      <div className="rounded-xl bg-teal-50 p-2 text-teal-600">
                        <CheckSquare className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-bold text-slate-800">{action.title}</p>
                          {action.selectedFromRecommended ? (
                            <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                              Recommended
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-[13px] font-medium leading-relaxed text-slate-500">
                          {action.description}
                        </p>
                        <p className="mt-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                          {action.scopeLabel}
                        </p>
                      </div>
                    </div>
                    <span className="whitespace-nowrap text-xs font-semibold text-slate-400">
                      {action.relativeTime}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
