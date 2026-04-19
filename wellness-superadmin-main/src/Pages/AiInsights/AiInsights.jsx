import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import { 
  Sparkles, TrendingUp, TrendingDown, Moon, BatteryWarning, Link as LinkIcon, Zap, 
  ArrowUpRight, ArrowDownRight, ArrowRight, Download
} from "lucide-react";
import api from "../../lib/api";
import { getDashboardPath } from "../../lib/auth";

const statusBadgeColorMap = {
  watch: {
    border: "border-t-amber-500",
    badge: "bg-amber-50 text-amber-600",
  },
  warning: {
    border: "border-t-rose-500",
    badge: "bg-rose-50 text-rose-600",
  },
  normal: {
    border: "border-t-teal-500",
    badge: "bg-teal-50 text-teal-600",
  },
};

export default function AiInsights() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const range = searchParams.get("range") || "30d";
  const team = searchParams.get("team") || undefined;

  useEffect(() => {
    const fetchAiInsights = async () => {
      try {
        setLoading(true);
        const response = await api.get(getDashboardPath("ai-insights"), {
          params: {
            range,
            team,
          },
        });
        setData(response.data.data);
      } catch (err) {
        console.error("Error fetching AI insights:", err);
        setError("Failed to load AI insights.");
      } finally {
        setLoading(false);
      }
    };

    fetchAiInsights();
  }, [range, team]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen pt-20 text-slate-600">
        Loading AI Insights...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen pt-20 text-rose-600">
        {error}
      </div>
    );
  }

  const {
    executive_summary = {},
    executive_analysis = {},
    signal_cards = [],
    insight_cards = [],
    cross_organizational_behavior_patterns = [],
    behavioral_patterns: leaderBehavioralPatterns = [],
    correlations = [],
    supporting_trends = {},
    predictive_model = {},
    predictive_forecast: leaderPredictiveForecast = {},
    organization_risk_signals = [],
    risk_signals_overview = [],
  } = data || {};

  const executive = executive_summary.headline ? executive_summary : executive_analysis;
  const summary_cards = signal_cards.length ? signal_cards : insight_cards;
  const behavioral_patterns = cross_organizational_behavior_patterns.length
    ? cross_organizational_behavior_patterns
    : leaderBehavioralPatterns;
  const predictive_forecast = Object.keys(predictive_model).length
    ? predictive_model
    : leaderPredictiveForecast;
  const risk_signals = organization_risk_signals.length
    ? organization_risk_signals
    : risk_signals_overview;
  const normalizedCorrelations = correlations.map((item) => {
    const isPositive = item.status === "positive";
    const numericValue = Number.parseInt(String(item.value || "").replace(/[^\d]/g, ""), 10);
    return {
      label: item.label,
      impactLabel: item.value,
      impactType: isPositive ? "positive" : "negative",
      strengthPct: Number.isNaN(numericValue) ? 0 : numericValue,
    };
  });
  const trendSeries = supporting_trends.series || [];
  const supportingTrendRows = trendSeries[0]?.points?.map((point, index) => ({
    day: new Date(point.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    sleep: trendSeries.find((item) => item.key === "sleep")?.points?.[index]?.value,
    stress: trendSeries.find((item) => item.key === "stress")?.points?.[index]?.value,
    recovery: trendSeries.find((item) => item.key === "recovery")?.points?.[index]?.value,
  })) || [];
  const predictiveConfidence =
    predictive_forecast.confidence_value ??
    predictive_forecast.confidence_score ??
    (
      Number.parseInt(
        String(predictive_forecast.confidence_label || "").replace(/[^\d]/g, ""),
        10
      ) || 0
    );

  return (
    <div className="min-h-screen mt-20 p-6 font-sans bg-[#f9fafb] text-slate-800" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0b1b36] to-[#12315c] rounded-[24px] p-10 text-white relative overflow-hidden mb-8 shadow-md">
        <div className="absolute right-[10%] top-[-20%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[80px]"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-teal-400" />
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-teal-400">AI EXECUTIVE ANALYSIS</span>
          </div>
          
          <h1 className="text-3xl font-bold tracking-tight text-white mb-4 max-w-3xl leading-snug">
            {executive.headline}
          </h1>
          
          <p className="max-w-3xl text-sm text-slate-300 leading-relaxed font-medium">
            {executive.summary}
          </p>
        </div>
      </div>

      {/* 3 Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {summary_cards.map((card, idx) => (
          <div
            key={idx}
            className={`bg-white rounded-xl shadow-sm border-t-[3px] ${(statusBadgeColorMap[(card.status || "").toLowerCase()] || statusBadgeColorMap.normal).border} border-x border-b border-x-slate-100 border-b-slate-100 p-6`}
          >
            <div className="flex justify-between items-start mb-4">
              {idx === 0 ? <TrendingUp className="w-5 h-5 text-rose-600" /> : 
               idx === 1 ? <Moon className="w-5 h-5 text-amber-600" /> : 
               <BatteryWarning className="w-5 h-5 text-rose-600" />}
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded tracking-widest uppercase ${(statusBadgeColorMap[(card.status || "").toLowerCase()] || statusBadgeColorMap.normal).badge}`}>
                {card.status}
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-2">{card.title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              {card.summary}
            </p>
          </div>
        ))}
      </div>

      {/* Behavioral Patterns & Correlations Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        
        {/* Left: Behavioral Patterns */}
        <div>
          <h2 className="text-base font-bold text-[#1e293b] mb-4">Behavioral Patterns</h2>
          <div className="space-y-4">
            {behavioral_patterns.map((bp, i) => (
              <div key={i} className="bg-slate-50/70 border border-slate-100 rounded-xl p-4 flex gap-4 items-center">
                <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
                  {i === 0 ? <LinkIcon className="w-4 h-4 text-teal-700" /> : <Zap className="w-4 h-4 text-teal-700" />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-0.5">{bp.title}</h3>
                  <p className="text-xs text-slate-500 font-medium">{bp.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Correlations */}
        <div>
          <h2 className="text-base font-bold text-[#1e293b] mb-4">Correlations</h2>
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 h-[178px] flex flex-col justify-center">
            {normalizedCorrelations.map((c, i) => (
              <div key={i} className={i === 0 ? "mb-6" : ""}>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-bold text-slate-800">{c.label}</span>
                  <span className={`text-xs font-bold ${c.impactType === 'positive' ? 'text-teal-600' : 'text-rose-600'}`}>
                    {c.impactLabel}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${c.impactType === 'positive' ? 'bg-teal-600' : 'bg-rose-600'}`}
                    style={{ width: `${c.strengthPct}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Supporting Trends & Predictive Forecast Row */}
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 mb-10">
        
        {/* Left: Supporting Trends */}
        <div className="lg:col-span-8">
          <h2 className="text-base font-bold text-[#1e293b] mb-4">Supporting Trends</h2>
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col h-[280px]">
            <div className="flex gap-4 mb-6">
              {['Sleep', 'Stress', 'Recovery'].map((label, idx) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-teal-600' : idx === 1 ? 'bg-rose-600' : 'bg-[#0b1b36]'}`}></div>
                  <span className="text-[10px] font-bold text-slate-600 tracking-wider uppercase">{label}</span>
                </div>
              ))}
            </div>

            <div className="flex-1 w-full relative -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={supportingTrendRows} barSize={32} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }} 
                    dy={10} 
                  />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{ fill: "transparent" }} 
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                  />
                  <Bar dataKey="sleep" fill="#14b8a6" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="stress" fill="#f43f5e" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="recovery" fill="#0b1b36" radius={[2, 2, 0, 0]}>
                    {supportingTrendRows.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#94c1ba" opacity={0.5 + (index * 0.08)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right: Predictive Forecast */}
        <div className="lg:col-span-4">
          <div className="bg-[#0b1b36] rounded-xl shadow-sm text-white p-8 h-full flex flex-col justify-center relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-500/10 rounded-full blur-[40px]"></div>

            <h2 className="text-white font-bold text-base mb-6 relative z-10">Predictive Forecast</h2>
            
            <div className="relative z-10 mb-8">
              <p className="text-[10px] font-bold text-teal-400 tracking-widest uppercase mb-2">
                {predictive_forecast.label || predictive_forecast.window_label}
              </p>
              <h3 className="text-2xl font-bold leading-tight">
                {predictive_forecast.title || predictive_forecast.forecast}
              </h3>
            </div>

            <div className="bg-[#112750] rounded-xl p-4 mb-8 relative z-10 border border-[#1e3a6a]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-indigo-100">Confidence Level</span>
                <span className="text-xs font-bold text-teal-400">{predictive_forecast.confidence_label}</span>
              </div>
              <div className="h-1.5 w-full bg-[#0b1b36] rounded-full overflow-hidden">
                <div className="h-full bg-teal-400 rounded-full" style={{ width: `${predictiveConfidence}%` }}></div>
              </div>
            </div>

            <p className="text-xs text-indigo-200/80 leading-relaxed font-medium relative z-10">
              {predictive_forecast.footnote || predictive_forecast.summary}
            </p>
          </div>
        </div>

      </div>

      {/* Risk Signals Overview Table */}
      <h2 className="text-base font-bold text-[#1e293b] mb-4">Risk Signals Overview</h2>
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">RISK TYPE</th>
                <th className="px-6 py-4">SEVERITY</th>
                <th className="px-6 py-4">CONTRIBUTING SIGNALS</th>
                <th className="px-6 py-4 text-right">TREND</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {risk_signals.map((signal, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-5 font-bold text-slate-800">{signal.category || signal.risk_type}</td>
                  <td className="px-6 py-5">
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                      (signal.current_status || signal.severity) === 'Elevated' || (signal.current_status || signal.severity) === 'Critical'
                        ? 'bg-rose-50 text-rose-600'
                        : 'bg-slate-50 text-slate-600'
                    }`}>
                      {signal.current_status || signal.severity}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-slate-500 font-medium text-xs">
                    {signal.affected_population || signal.contributing_signals}
                  </td>
                  <td className="px-6 py-5 text-right">
                    {signal.trend === 'Elevated' ? <TrendingUp className="w-4 h-4 text-rose-500 inline-block" /> : 
                     signal.trend === 'New' ? <TrendingDown className="w-4 h-4 text-rose-500 inline-block" /> : 
                     <ArrowRight className="w-4 h-4 text-teal-600 inline-block" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
