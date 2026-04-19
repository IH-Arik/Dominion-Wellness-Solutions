import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import {
  ArrowLeft, Upload, AlertTriangle, TrendingDown, TrendingUp, Lightbulb, ExternalLink, Activity, Moon, Battery, Zap, Briefcase, Heart
} from "lucide-react";
import api from "../../lib/api";
import { getDashboardPath } from "../../lib/auth";

const iconMap = {
  Moon: Moon,
  Zap: Zap,
  Battery: Battery,
  Activity: Activity,
  Briefcase: Briefcase,
  Heart: Heart,
};

const defaultColorClass = {
  bg: "bg-slate-100",
  icon: "text-slate-600",
  text: "text-slate-500",
};

const signalColorMap = {
  sleep: {
    bg: "bg-indigo-50",
    icon: "text-indigo-600",
    text: "text-indigo-600",
  },
  recovery_deficit: {
    bg: "bg-blue-50",
    icon: "text-blue-600",
    text: "text-blue-600",
  },
  workload_strain: {
    bg: "bg-amber-50",
    icon: "text-amber-600",
    text: "text-amber-600",
  },
  morale_decline: {
    bg: "bg-rose-50",
    icon: "text-rose-600",
    text: "text-rose-600",
  },
  high_stress: {
    bg: "bg-orange-50",
    icon: "text-orange-600",
    text: "text-orange-600",
  },
  fatigue: {
    bg: "bg-teal-50",
    icon: "text-teal-600",
    text: "text-teal-600",
  },
};

const SignalRow = ({ icon: Icon, label, status, colorClass }) => (
  <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors rounded-lg px-2 -mx-2">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-full ${(colorClass || defaultColorClass).bg}`}>
        <Icon className={`w-4 h-4 ${(colorClass || defaultColorClass).icon}`} />
      </div>
      <span className="text-sm font-bold text-slate-800">{label}</span>
    </div>
    <span className={`text-[11px] font-bold ${(colorClass || defaultColorClass).text}`}>{status}</span>
  </div>
);

export default function BurnoutRiskDetails() {
  const [activeRange, setActiveRange] = useState("30d");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const company = searchParams.get("company");
  const team = searchParams.get("team");

  useEffect(() => {
    const fetchRiskDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(getDashboardPath("burnout-details"), {
          params: {
            company: company || undefined,
            team: team || undefined,
          },
        });
        setData(response.data.data);
      } catch (err) {
        console.error("Error fetching risk details:", err);
        setError("Failed to load risk details.");
      } finally {
        setLoading(false);
      }
    };

    fetchRiskDetails();
  }, [company, team]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen pt-20">
        <div className="text-lg font-medium text-slate-600">Loading Risk Details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen pt-20">
        <div className="text-lg font-medium text-rose-600">{error}</div>
      </div>
    );
  }

  const scopeLabel =
    data.scope?.team ||
    data.scope?.organization_name ||
    "Organization Overview";
  const signalsTriggered = data.summary_cards?.signals_triggered || 0;
  const totalSignals = data.summary_cards?.total_signals || 0;
  const signalPercent = totalSignals > 0 ? (signalsTriggered / totalSignals) * 100 : 0;
  const trendSeries = data.trend_visualization?.series || [];
  const chartPoints = trendSeries[0]?.points?.map((point, index) => ({
    day: new Date(point.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    stress: trendSeries.find((item) => item.key === "stress")?.points?.[index]?.value,
    recovery: trendSeries.find((item) => item.key === "recovery")?.points?.[index]?.value,
    energy: trendSeries.find((item) => item.key === "energy")?.points?.[index]?.value,
  })) || [];
  const affectedPercentage =
    data.team_context?.affected_percentage ??
    data.team_context?.team_affected_percentage;
  const affectedComparison =
    data.team_context?.comparison ??
    data.team_context?.delta_vs_last_window;

  return (
    <div className="min-h-screen mt-20 p-6 bg-[#f9fafb] font-sans text-slate-800" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-slate-500 hover:text-slate-800 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <div className="text-[10px] font-bold text-teal-500 uppercase tracking-widest leading-none mb-1">
              {scopeLabel}
            </div>
            <h1 className="text-2xl font-extrabold text-[#0b1b36] tracking-tight">Burnout Risk Details</h1>
            <p className="text-xs text-slate-500 font-medium">{data.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
            {["7d", "30d", "90d", "Custom"].map((range) => (
              <button
                key={range}
                onClick={() => setActiveRange(range)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                  activeRange === range
                    ? "bg-[#0b1b36] text-white shadow"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 font-bold text-sm rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
            <Upload className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      {/* Top 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">RISK LEVEL</h3>
          <div className="flex items-center gap-2">
            <AlertTriangle className={`w-6 h-6 ${data.summary_cards?.risk_level.includes('Risk') ? 'text-rose-500' : 'text-amber-500'}`} />
            <span className={`text-2xl font-extrabold ${data.summary_cards?.risk_status === 'Elevated' ? 'text-rose-600' : 'text-amber-600'}`}>
              {data.summary_cards?.risk_level}
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">SIGNALS TRIGGERED</h3>
          <div className="flex items-center gap-4">
            <span className="text-2xl font-extrabold text-slate-800">
              {data.summary_cards?.signals_triggered} <span className="text-sm text-slate-400">of {data.summary_cards?.total_signals}</span>
            </span>
            <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-teal-500 rounded-full" 
                style={{ width: `${signalPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">7-DAY TREND</h3>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-extrabold ${data.summary_cards?.trend_7d === 'Worsening' ? 'text-rose-600' : 'text-teal-600'}`}>
              {data.summary_cards?.trend_7d}
            </span>
            {data.summary_cards?.trend_7d === 'Worsening' ? <TrendingDown className="w-6 h-6 text-rose-600" /> : <TrendingUp className="w-6 h-6 text-teal-600" />}
          </div>
        </div>
      </div>

      {/* Grid: Signals && Chart */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
        
        {/* Signal Breakdown */}
        <div className="md:col-span-4 flex flex-col">
          <h2 className="text-base font-bold text-[#1e293b] mb-4">Signal Breakdown</h2>
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex-1">
            {data.signal_breakdown?.map((signal, idx) => (
              <SignalRow 
                key={idx}
                icon={iconMap[signal.icon] || (signal.key === 'sleep' ? Moon : signal.key === 'high_stress' ? Activity : Battery)} 
                label={signal.label} 
                status={signal.status} 
                colorClass={signal.color_class || signalColorMap[signal.key] || defaultColorClass} 
              />
            ))}
          </div>
        </div>

        {/* 14-Day Trend Visualization */}
        <div className="md:col-span-8 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold text-[#1e293b]">14-Day Trend Visualization</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500"></div><span className="text-[10px] font-bold text-slate-500 tracking-wider">STRESS</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"></div><span className="text-[10px] font-bold text-slate-500 tracking-wider">RECOVERY</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-teal-500"></div><span className="text-[10px] font-bold text-slate-500 tracking-wider">ENERGY</span></div>
            </div>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartPoints}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: "bold" }} dy={10} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                <Line type="monotone" dataKey="stress" stroke="#f43f5e" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="recovery" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="energy" stroke="#14b8a6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Affected Members Section */}
      <h2 className="text-base font-bold text-[#1e293b] mb-4">Affected Members</h2>
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">MEMBER</th>
                <th className="px-6 py-4">TEAM</th>
                <th className="px-6 py-4 text-center">RISK LEVEL</th>
                <th className="px-6 py-4">PRIMARY DRIVER</th>
                <th className="px-6 py-4">TREND SUMMARY</th>
                <th className="px-6 py-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.affected_members?.map((m, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                      {m.name.charAt(0)}
                    </div>
                    <span className="font-bold text-slate-800">{m.name}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-medium text-xs">{m.team || "Unassigned"}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                      m.risk_level === "Elevated" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
                    }`}>
                      {m.risk_level}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold uppercase tracking-widest text-slate-600`}>
                      {m.primary_driver}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-medium text-xs max-w-xs">{m.trend_summary}</td>
                  <td className="px-6 py-4 text-right">
                    <Link to={`/team-members`} className="text-teal-600 hover:text-teal-700 font-bold text-xs flex items-center justify-end gap-1 w-full">
                      View Profile <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Insight & Team Context */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex gap-4 items-start">
          <div className="bg-slate-50 p-2.5 rounded-full shrink-0">
            <Lightbulb className="w-5 h-5 text-slate-700" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 mb-2">Key Insight</h3>
            <p className="text-sm font-medium text-slate-600 leading-relaxed">
              {data.key_insight}
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
          <h3 className="font-bold text-slate-800 mb-6">Team Context</h3>
          <div className="flex gap-12">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">TEAM AFFECTED</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-800 tracking-tight">{affectedPercentage ?? 0}%</span>
                <span className={`text-xs font-bold ${String(affectedComparison || "").startsWith('+') ? 'text-rose-500' : 'text-teal-500'}`}>
                  {affectedComparison}
                </span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">MOST IMPACTED DRIVER</p>
              <span className="text-base font-extrabold text-teal-600 bg-teal-50 px-3 py-1 rounded-lg inline-block mt-1">
                {data.team_context?.most_impacted_driver}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
