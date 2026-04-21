import React, { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { TrendingUp, BedDouble, AlertCircle, ArrowRight, ExternalLink } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../lib/api";
import { getDashboardPath } from "../../lib/auth";
import {
  ErrorState,
  FullPageLoadingState,
  RefreshingOverlay,
} from "../../Components/App/AsyncState";
import { useRefetchAwareLoading } from "../../lib/useRefetchAwareLoading";

const METRIC_CONFIG = {
  ops_score: {
    key: "ops_score",
    rowKey: "ops",
    label: "OPS Score",
    color: "#0d9488",
    chipClass: "border-teal-100 bg-teal-50 text-teal-700",
  },
  stress: {
    key: "stress",
    rowKey: "stress",
    label: "Stress",
    color: "#e11d48",
    chipClass: "border-rose-100 bg-rose-50 text-rose-700",
  },
  sleep: {
    key: "sleep",
    rowKey: "sleep",
    label: "Sleep",
    color: "#2563eb",
    chipClass: "border-blue-100 bg-blue-50 text-blue-700",
  },
};

const RISK_COLORS = {
  Optimal: "#cbd5e1",
  Stable: "#14b8a6",
  Strained: "#f59e0b",
  "High Risk": "#fb7185",
  Critical: "#e11d48",
};

const Card = ({ children, className = "" }) => (
  <div className={`rounded-xl border border-slate-100 bg-white shadow-sm ${className}`}>
    {children}
  </div>
);

function formatMetricValue(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "--";
  }
  return Number(value).toFixed(1);
}

function getTrendDirection(delta) {
  if (delta > 0.5) {
    return "up";
  }
  if (delta < -0.5) {
    return "down";
  }
  return "steady";
}

export default function Report() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [activeMetricKeys, setActiveMetricKeys] = useState(["ops_score", "stress", "sleep"]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loading, isRefreshing, beginLoading, finishLoading } = useRefetchAwareLoading();
  const company = searchParams.get("company") || undefined;
  const range = searchParams.get("range") || "30d";
  const team = searchParams.get("team") || undefined;
  const startDate = searchParams.get("start_date") || undefined;
  const endDate = searchParams.get("end_date") || undefined;

  useEffect(() => {
    setPage(1);
  }, [company, team, range, startDate, endDate]);

  useEffect(() => {
    const fetchReport = async () => {
      beginLoading();
      try {
        setError(null);
        const response = await api.get(getDashboardPath("report"), {
          params: {
            company,
            team,
            page,
            range,
            start_date: startDate,
            end_date: endDate,
          },
        });
        setData(response.data.data);
        finishLoading(true);
      } catch (err) {
        console.error("Error fetching report:", err);
        setError("Failed to load report data.");
        finishLoading(false);
      }
    };

    fetchReport();
  }, [company, team, page, range, startDate, endDate, beginLoading, finishLoading]);

  const {
    summary_cards = [],
    performance_trends = {},
    driver_analysis = { items: [] },
    risk_distribution = [],
    auto_generated_insights = {},
    members = { items: [], pagination: { total_pages: 1, total_items: 0 } },
  } = data || {};

  const drivers = Array.isArray(driver_analysis)
    ? driver_analysis
    : driver_analysis.items || [];
  const membersList = Array.isArray(members) ? members : members.items || [];
  const pagination = members.pagination || { total_pages: 1, total_items: 0 };
  const trendSeries = performance_trends.series || [];
  const availableMetricKeys = useMemo(
    () => trendSeries.map((series) => series.key).filter((key) => METRIC_CONFIG[key]),
    [trendSeries]
  );

  useEffect(() => {
    if (!availableMetricKeys.length) {
      return;
    }
    setActiveMetricKeys((current) => {
      const filtered = current.filter((key) => availableMetricKeys.includes(key));
      return filtered.length ? filtered : availableMetricKeys;
    });
  }, [availableMetricKeys]);

  const performanceTrendRows = useMemo(() => {
    const pointsByDate = new Map();
    trendSeries.forEach((series) => {
      const metric = METRIC_CONFIG[series.key];
      if (!metric) {
        return;
      }
      (series.points || []).forEach((point) => {
        const row = pointsByDate.get(point.date) || {
          date: point.date,
          day: point.day_label || point.date,
        };
        row[metric.rowKey] = point.value;
        pointsByDate.set(point.date, row);
      });
    });

    return Array.from(pointsByDate.values()).sort((left, right) =>
      String(left.date).localeCompare(String(right.date))
    );
  }, [trendSeries]);

  const selectedMetricKeys = activeMetricKeys.filter((key) =>
    availableMetricKeys.includes(key)
  );

  const yDomain = useMemo(() => {
    const values = [];
    performanceTrendRows.forEach((row) => {
      selectedMetricKeys.forEach((metricKey) => {
        const value = row[METRIC_CONFIG[metricKey].rowKey];
        if (typeof value === "number") {
          values.push(value);
        }
      });
    });

    if (!values.length) {
      return [0, 100];
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    if (min === max) {
      return [Math.max(0, min - 8), Math.min(100, max + 8)];
    }
    const padding = Math.max(4, Math.ceil((max - min) * 0.2));
    return [Math.max(0, Math.floor(min - padding)), Math.min(100, Math.ceil(max + padding))];
  }, [performanceTrendRows, selectedMetricKeys]);

  const trendAnalyses = useMemo(
    () =>
      availableMetricKeys.map((metricKey) => {
        const metric = METRIC_CONFIG[metricKey];
        const values = performanceTrendRows
          .map((row) => row[metric.rowKey])
          .filter((value) => typeof value === "number");
        const first = values[0];
        const last = values[values.length - 1];
        const delta =
          typeof first === "number" && typeof last === "number"
            ? Number((last - first).toFixed(1))
            : null;

        return {
          ...metric,
          latest: typeof last === "number" ? last : null,
          delta,
          direction: delta === null ? "steady" : getTrendDirection(delta),
        };
      }),
    [availableMetricKeys, performanceTrendRows]
  );

  const riskDistributionRows = useMemo(
    () =>
      risk_distribution.map((item) => ({
        name: item.label,
        count: item.count ?? 0,
        percentage: item.percentage ?? 0,
        value: item.count ?? 0,
        color: RISK_COLORS[item.label] || "#cbd5e1",
      })),
    [risk_distribution]
  );

  const topRiskBucket = useMemo(() => {
    if (!riskDistributionRows.length) {
      return null;
    }
    return [...riskDistributionRows].sort((left, right) => right.count - left.count)[0];
  }, [riskDistributionRows]);

  const insightHighlights = Array.isArray(auto_generated_insights)
    ? auto_generated_insights
    : auto_generated_insights.highlights || auto_generated_insights.items || [];
  const insightHeadline =
    auto_generated_insights.headline ||
    auto_generated_insights.title ||
    "Latest team insight highlights";

  function toggleMetric(metricKey) {
    setActiveMetricKeys((current) => {
      if (current.includes(metricKey)) {
        if (current.length === 1) {
          return current;
        }
        return current.filter((item) => item !== metricKey);
      }
      return [...current, metricKey];
    });
  }

  function openMemberDetail(member) {
    const nextParams = new URLSearchParams({
      userId: member.user_id,
      source: "report",
    });

    if (company) {
      nextParams.set("company", company);
    }
    if (team) {
      nextParams.set("team", team);
    }
    if (range) {
      nextParams.set("range", range);
    }
    if (startDate) {
      nextParams.set("start_date", startDate);
    }
    if (endDate) {
      nextParams.set("end_date", endDate);
    }

    navigate(`/user-details?${nextParams.toString()}`);
  }

  if (loading && !data) {
    return <FullPageLoadingState label="Loading Reports..." />;
  }

  if (error && !data) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-20">
        <div className="w-full max-w-xl px-6">
          <ErrorState message={error} />
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen bg-slate-50/50 p-6 font-sans text-slate-800"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {isRefreshing ? <RefreshingOverlay label="Updating reports..." /> : null}
      {error ? (
        <div className="mb-6">
          <ErrorState message={error} />
        </div>
      ) : null}

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {summary_cards.map((kpi, idx) => (
          <Card key={idx} className="flex flex-col justify-between p-5">
            <div className="flex items-start justify-between">
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                {kpi.label}
              </span>
              {kpi.delta ? (
                <TrendingUp
                  className={`h-4 w-4 ${
                    kpi.delta.startsWith("+") ? "text-teal-600" : "text-rose-600"
                  }`}
                />
              ) : null}
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">
                {typeof kpi.value === "number"
                  ? Number(kpi.value)
                      .toFixed(kpi.key === "leadership_climate" ? 1 : 2)
                      .replace(/\.00$/, "")
                  : kpi.value}
              </span>
              {kpi.delta ? (
                <span
                  className={`text-xs font-bold ${
                    kpi.delta.startsWith("+") ? "text-teal-600" : "text-rose-600"
                  }`}
                >
                  {kpi.delta}
                </span>
              ) : null}
            </div>
          </Card>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-6">
          <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Performance Trends</h2>
              <p className="mt-1 text-sm text-slate-500">
                Compare OPS score, stress, and sleep across the selected reporting window.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              {availableMetricKeys.map((metricKey) => {
                const metric = METRIC_CONFIG[metricKey];
                const isActive = selectedMetricKeys.includes(metricKey);
                return (
                  <label
                    key={metricKey}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold transition-colors ${
                      isActive
                        ? metric.chipClass
                        : "border-slate-200 bg-white text-slate-500"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={() => toggleMetric(metricKey)}
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    {metric.label}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-3">
            {trendAnalyses.map((item) => (
              <div
                key={item.key}
                className={`rounded-xl border px-4 py-3 ${item.chipClass}`}
              >
                <div className="text-[11px] font-black uppercase tracking-[0.18em]">
                  {item.label}
                </div>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <div className="text-2xl font-extrabold">{formatMetricValue(item.latest)}</div>
                  <div className="text-right text-xs font-bold">
                    {item.delta === null ? (
                      <span className="text-slate-500">No trend</span>
                    ) : (
                      <>
                        <div>{item.delta > 0 ? "+" : ""}{item.delta}</div>
                        <div className="mt-1 uppercase tracking-widest">
                          {item.direction}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="h-72 w-full">
            {performanceTrendRows.length && selectedMetricKeys.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceTrendRows}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 10 }}
                  />
                  <YAxis
                    domain={yDomain}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 10 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 10px 30px rgba(15, 23, 42, 0.12)",
                    }}
                  />
                  {selectedMetricKeys.map((metricKey) => {
                    const metric = METRIC_CONFIG[metricKey];
                    return (
                      <Line
                        key={metricKey}
                        type="monotone"
                        dataKey={metric.rowKey}
                        name={metric.label}
                        stroke={metric.color}
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{ r: 5, fill: metric.color }}
                        connectNulls
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm font-medium text-slate-400">
                No performance trend data available for the selected scope.
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-800">
                Driver Analysis
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Team drivers ranked by average score across the selected window.
              </p>
            </div>
            {driver_analysis.critical_weakness ? (
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-amber-700">
                Weakest: {driver_analysis.critical_weakness}
              </span>
            ) : null}
          </div>

          <div className="space-y-5">
            {drivers.length ? (
              drivers.map((item, idx) => {
                const score = item.value ?? item.average_score ?? 0;
                const color =
                  item.color ||
                  (item.condition === "Critical"
                    ? "#e11d48"
                    : item.condition === "High Risk"
                      ? "#f59e0b"
                      : "#0d9488");
                return (
                  <div key={`${item.key || item.label}-${idx}`}>
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <div>
                        <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                          {item.name || item.label}
                        </div>
                        <div className="mt-1 text-xs font-semibold text-slate-400">
                          {item.condition || "Measured"}
                        </div>
                      </div>
                      <div className="text-sm font-extrabold" style={{ color }}>
                        {Number(score).toFixed(1)}%
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.max(0, Math.min(Number(score), 100))}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-400">
                Driver analysis is not available for the selected scope.
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-800">
                Risk Distribution
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Member burnout buckets for the current report scope.
              </p>
            </div>
            {topRiskBucket ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-right">
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                  Largest Bucket
                </div>
                <div className="mt-1 text-sm font-extrabold text-slate-800">
                  {topRiskBucket.name}
                </div>
                <div className="text-xs font-semibold text-slate-500">
                  {topRiskBucket.count} members
                </div>
              </div>
            ) : null}
          </div>

          <div className="h-56 w-full">
            {riskDistributionRows.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskDistributionRows} margin={{ top: 8, right: 8, left: 0, bottom: 12 }}>
                  <CartesianGrid stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }}
                  />
                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 10 }}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    formatter={(value, name, payload) => [
                      `${value} members (${payload.payload.percentage}%)`,
                      payload.payload.name,
                    ]}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 10px 30px rgba(15, 23, 42, 0.12)",
                    }}
                  />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                    {riskDistributionRows.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm font-medium text-slate-400">
                Risk distribution is not available for the selected scope.
              </div>
            )}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {riskDistributionRows.map((item) => (
              <div key={item.name} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
                    {item.name}
                  </span>
                </div>
                <div className="mt-3 text-lg font-extrabold text-slate-800">{item.count}</div>
                <div className="text-xs font-semibold text-slate-400">{item.percentage}% of team</div>
              </div>
            ))}
          </div>
        </Card>

        <div className="relative flex flex-col justify-between overflow-hidden rounded-xl bg-[#0b1b36] p-8 text-white shadow-lg">
          <div className="absolute right-0 top-0 p-6 opacity-10">
            <svg
              width="120"
              height="120"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>

          <div className="relative z-10">
            <div className="mb-8 flex items-center gap-2">
              <h2 className="text-lg font-bold uppercase tracking-widest">
                Auto-Generated Insights
              </h2>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white">{insightHeadline}</h3>
              {insightHighlights.length ? (
                insightHighlights.map((insight, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div
                      className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                        idx === 0
                          ? "border-rose-900/50 bg-rose-900/30"
                          : "border-slate-700 bg-slate-800/80"
                      }`}
                    >
                      {idx === 0 ? (
                        <AlertCircle className="h-4 w-4 text-rose-400" />
                      ) : (
                        <BedDouble className="h-4 w-4 text-teal-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="mb-1 text-sm font-extrabold uppercase tracking-wider text-white">
                        {insight.title}
                      </h3>
                      <p className="text-xs font-medium leading-relaxed text-indigo-100/60">
                        {insight.summary}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-indigo-100/70">
                  Insight generation is still in progress for this scope.
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() =>
              navigate(`/ai-insights${window.location.search ? window.location.search : ""}`)
            }
            className="mt-8 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-teal-400 transition-colors hover:text-teal-300"
          >
            {auto_generated_insights.cta_label || "Full Analysis"}{" "}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <h2 className="mb-4 px-1 text-sm font-black uppercase tracking-[0.2em] text-slate-800">
        Members Overview
      </h2>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">
              <tr>
                <th className="px-6 py-4">Member</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4 text-center">Risk Level</th>
                <th className="px-6 py-4 text-center">Primary Driver</th>
                <th className="px-6 py-4">Trend Summary</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-[13px]">
              {membersList.map((member) => (
                <tr
                  key={member.user_id || member.id}
                  className="transition-colors hover:bg-slate-50/50"
                >
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-white">
                        {member.name
                          ? member.name
                              .split(" ")
                              .map((name) => name[0])
                              .join("")
                          : "?"}
                      </div>
                      <span className="font-extrabold text-[#0b1b36]">{member.name}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 font-bold text-slate-500">
                    {member.department}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center">
                    <span
                      className={`inline-block rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                        member.burnout_level === "Elevated Burnout Risk"
                          ? "border-rose-100 bg-rose-50 text-rose-600"
                          : member.burnout_level === "Moderate"
                            ? "border-amber-100 bg-amber-50 text-amber-600"
                            : "border-teal-100 bg-teal-50 text-teal-600"
                      }`}
                    >
                      {member.burnout_level || member.risk_level}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center font-bold text-slate-700">
                    {member.primary_driver}
                  </td>
                  <td className="px-6 py-4">
                    <p className="max-w-xs text-xs font-semibold text-slate-500">
                      {member.trend_summary || member.trend}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <button
                      onClick={() => openMemberDetail(member)}
                      className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-teal-600 hover:text-teal-800"
                    >
                      View Detail <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 px-6 py-4 sm:flex-row">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Showing <span className="text-slate-800">{(page - 1) * 10 + 1}</span> to{" "}
            <span className="text-slate-800">
              {Math.min(page * 10, pagination.total_items)}
            </span>{" "}
            of <span className="text-slate-800">{pagination.total_items}</span> results
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-800 disabled:opacity-30"
            >
              Prev
            </button>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: pagination.total_pages }, (_, idx) => idx + 1).map((value) => (
                <button
                  key={value}
                  onClick={() => setPage(value)}
                  className={`h-8 w-8 rounded-lg text-xs font-black transition-all ${
                    page === value
                      ? "bg-[#0b1b36] text-white shadow-md"
                      : "border border-slate-200 bg-white text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPage((current) => Math.min(pagination.total_pages, current + 1))}
              disabled={page >= pagination.total_pages}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-800 disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
