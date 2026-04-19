import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Calendar,
  Users,
  Info,
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
} from "lucide-react";
import api from "../../lib/api";
import { getDashboardPath } from "../../lib/auth";
import { useSearchParams } from "react-router-dom";

export default function ActionHistory() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Filter states
  const [team, setTeam] = useState(searchParams.get("team") || "All");
  const [range, setRange] = useState(
    searchParams.get("range") === "7d"
      ? "Today"
      : searchParams.get("range") === "90d"
        ? "Month"
        : "Week"
  );
  const [outcome, setOutcome] = useState("All");

  useEffect(() => {
    setTeam(searchParams.get("team") || "All");
    setRange(
      searchParams.get("range") === "7d"
        ? "Today"
        : searchParams.get("range") === "90d"
          ? "Month"
          : "Week"
    );
  }, [searchParams]);

  useEffect(() => {
    const fetchActionHistory = async () => {
      try {
        setLoading(true);
        const normalizedRange = range === "Today" ? "7d" : range === "Week" ? "30d" : "90d";
        const response = await api.get(getDashboardPath("actions/history"), {
          params: {
            team: team === "All" ? undefined : team,
            range: normalizedRange,
            outcome:
              outcome === "All"
                ? undefined
                : outcome === "No Change"
                  ? "no_change"
                  : outcome.toLowerCase(),
          },
        });
        setData(response.data.data);
      } catch (err) {
        console.error("Error fetching action history:", err);
        setError("Failed to load action history.");
      } finally {
        setLoading(false);
      }
    };

    fetchActionHistory();
  }, [team, range, outcome]);

  useEffect(() => {
    const normalizedRange = range === "Today" ? "7d" : range === "Week" ? "30d" : "90d";
    const next = new URLSearchParams(searchParams);
    next.set("range", normalizedRange);
    if (team === "All") {
      next.delete("team");
    } else {
      next.set("team", team);
    }
    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true });
    }
  }, [team, range, searchParams, setSearchParams]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen pt-20">
        <div className="text-lg font-medium text-slate-600">Loading Action History...</div>
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

  const historyItems = data.items || [];
  const summary = data.summary_bar || {};
  const teamOptions = [
    ...new Set(
      historyItems
        .map((item) => item.team_label)
        .filter(Boolean)
    ),
  ];
  const nextAssessmentLabel =
    typeof summary.next_assessment_in_days === "number"
      ? `${summary.next_assessment_in_days} days until next assessment`
      : "System Stable";

  return (
    <div className="min-h-screen p-6 mt-20 bg-[#f9fafb] font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>

      <div className="mb-8">
        <h1 className="text-3xl font-black text-[#0b1b36] tracking-tight mb-2">Leadership Action History</h1>
        <p className="text-sm font-semibold text-slate-500">Track and evaluate real-time intervention performance</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="relative">
          <select 
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-full text-sm font-bold text-slate-700 shadow-sm appearance-none outline-none focus:ring-2 focus:ring-teal-500/20 pr-10"
          >
            <option value="All">All Teams</option>
            {teamOptions.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <Users className="w-4 h-4" />
          </div>
        </div>
        
        <div className="relative">
          <select 
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-full text-sm font-bold text-slate-700 shadow-sm appearance-none outline-none focus:ring-2 focus:ring-teal-500/20 pr-10"
          >
            <option value="Today">Today</option>
            <option value="Week">This Week</option>
            <option value="Month">This Month</option>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <Calendar className="w-4 h-4" />
          </div>
        </div>

        <div className="flex bg-white border border-slate-200 rounded-full p-1.5 shadow-sm ml-auto gap-1">
          {["All", "Improved", "No Change", "Worsened"].map((f) => (
            <button 
              key={f}
              onClick={() => setOutcome(f)}
              className={`px-5 py-2 text-xs font-black rounded-full transition-all uppercase tracking-widest ${outcome === f ? "bg-[#0b1b36] text-white shadow-md" : "text-slate-500 hover:text-slate-800"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Bar */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 flex flex-wrap items-center justify-between mb-10 shadow-sm">
        <div className="flex items-center gap-12">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Actions</span>
            <span className="text-2xl font-black text-[#0b1b36]">{summary.total_actions || 0}</span>
          </div>
          
          <div className="w-px h-10 bg-slate-100"></div>

          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Burnout Risk Shift</span>
            <div className="flex items-center gap-3">
              <span className="text-sm font-black text-rose-600">{summary.burnout_risk_change?.before}</span>
              <ArrowLeft className="w-4 h-4 text-slate-300 rotate-180" />
              <span className="text-sm font-black flex items-center gap-1 text-slate-800">
                {summary.burnout_risk_change?.after}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-xl text-xs font-bold uppercase tracking-wide">
          <Info className="w-4 h-4" />
          {nextAssessmentLabel}
        </div>
      </div>

      {/* Timeline */}
      <div className="relative pl-8">
        <div className="absolute top-4 bottom-8 left-[11px] w-0.5 bg-slate-100"></div>

        {historyItems.map((item, index) => (
          <div key={item.id} className="relative mb-12 last:mb-0">
            {/* Timeline Dot */}
            <div className={`absolute top-8 -left-[23px] w-4 h-4 rounded-full border-4 border-white shadow-sm ring-2 ring-opacity-20 ${
              item.outcome === 'Improved' ? 'bg-teal-600 ring-teal-600' : 
              item.outcome === 'Worsened' ? 'bg-rose-600 ring-rose-600' : 'bg-slate-400 ring-slate-400'
            }`}></div>

            {/* Content Card */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 ml-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-black text-[#0b1b36] mb-2">{item.action}</h3>
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <span className="text-slate-800">{item.team_label}</span>
                    <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                    <span>{item.created_at_label}</span>
                  </div>
                </div>
                <span className={`text-[10px] font-black tracking-widest uppercase px-4 py-1.5 rounded-full ${
                  item.outcome === 'Improved' ? 'bg-teal-100 text-teal-700' : 
                  item.outcome === 'Worsened' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                }`}>
                  {item.outcome}
                </span>
              </div>

              <div className="mb-8">
                <span className="inline-block px-4 py-2 text-[11px] font-black uppercase tracking-widest text-rose-700 bg-rose-50 rounded-xl border border-rose-100">
                  Risk at time: {item.risk_at_time?.label}
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8 border-t border-slate-50">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                    Burnout Risk
                  </span>
                  <div className="flex items-center gap-2 text-sm font-black">
                    <span className="text-slate-400">{item.impact_metrics?.burnout_risk?.before}</span>
                    <ArrowLeft className="w-3.5 h-3.5 text-slate-200 rotate-180" />
                    <span className="text-slate-800">
                      {item.impact_metrics?.burnout_risk?.after}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                    Sleep Score
                  </span>
                  <div className="flex items-center gap-2 text-sm font-black">
                    <span className="text-slate-800">{item.impact_metrics?.sleep_score?.delta}</span>
                    {String(item.impact_metrics?.sleep_score?.delta || "").startsWith("-")
                      ? <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                      : String(item.impact_metrics?.sleep_score?.delta || "").startsWith("+")
                        ? <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
                        : <Minus className="w-3.5 h-3.5 text-slate-300" />}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                    Stress Level
                  </span>
                  <div className="flex items-center gap-2 text-sm font-black">
                    <span className="text-slate-400">{item.impact_metrics?.stress_level?.before ?? "No data"}</span>
                    <ArrowLeft className="w-3.5 h-3.5 text-slate-200 rotate-180" />
                    <span className="text-slate-800">
                      {item.impact_metrics?.stress_level?.after ?? "No data"}
                    </span>
                  </div>
                </div>
              </div>

              {item.note && (
                <div className="mt-8 p-6 bg-slate-50 rounded-2xl text-[13px] font-medium text-slate-600 border-l-4 border-slate-200 italic leading-relaxed">
                  "{item.note}"
                </div>
              )}
            </div>
          </div>
        ))}

        {historyItems.length === 0 && (
          <div className="py-20 text-center text-slate-400">
            <p className="text-lg font-bold uppercase tracking-widest opacity-20">No Action History Found</p>
          </div>
        )}
      </div>

    </div>
  );
}
