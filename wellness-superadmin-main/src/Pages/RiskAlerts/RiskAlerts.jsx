import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  ChevronDown,
  Info,
  Clock,
  ArrowRight,
  TrendingUp,
  Activity,
  CheckCircle,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../lib/api";
import LogActionModal from "./LogActionModal";
import { getDashboardPath } from "../../lib/auth";
import { ErrorState, FullPageLoadingState, RefreshingOverlay } from "../../Components/App/AsyncState";
import { useRefetchAwareLoading } from "../../lib/useRefetchAwareLoading";

export default function RiskAlerts() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loading, isRefreshing, beginLoading, finishLoading } = useRefetchAwareLoading();
  const company = searchParams.get("company") || undefined;
  const range = searchParams.get("range") || "7d";
  const team = searchParams.get("team") || undefined;
  const startDate = searchParams.get("start_date") || undefined;
  const endDate = searchParams.get("end_date") || undefined;

  useEffect(() => {
    const fetchRiskAlerts = async () => {
      beginLoading();
      try {
        setError(null);
        const response = await api.get(getDashboardPath("risk-alerts"), {
          params: {
            company,
            range,
            team,
            start_date: startDate,
            end_date: endDate,
          },
        });
        setData(response.data.data);
        finishLoading(true);
      } catch (err) {
        console.error("Error fetching risk alerts:", err);
        setError("Failed to load risk alerts.");
        finishLoading(false);
      }
    };

    fetchRiskAlerts();
  }, [company, range, team, startDate, endDate, beginLoading, finishLoading]);

  if (loading && !data) {
    return <FullPageLoadingState label="Loading Risk Alerts..." />;
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

  const clusters = data.top_risk_clusters || [];
  const primaryCluster = clusters[0] || {
    title: "No Active Clusters",
    description: "System is currently stable with no major risk clusters detected.",
    team_count: 0,
    percentage: 0
  };

  const escalationAlerts = data.escalation_alerts || [];
  const summaryCards = data.summary_cards || [];
  const teamOverview = data.team_risk_overview || [];

  return (
    <div className="relative min-h-screen p-6 mt-20 bg-[#f9fafb] font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
      {isRefreshing ? <RefreshingOverlay label="Updating risk alerts..." /> : null}
      {error ? <div className="mb-6"><ErrorState message={error} /></div> : null}
      
      {/* Risk Level Header */}
      <div className="flex flex-col items-start justify-between gap-6 mb-8 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-3xl font-black text-[#0b1b36] tracking-tight">Risk & Alerts</h1>
          <p className="mt-1 font-semibold text-slate-500">Global organizational risk overview</p>
        </div>
        <div className="flex bg-white border border-slate-100 rounded-xl p-1.5 shadow-sm gap-1">
          {["All", "Today", "Week", "Month"].map((t) => (
            <button key={t} className={`px-5 py-2 rounded-lg text-xs font-black tracking-widest uppercase transition-all ${t === "Week" ? "bg-[#0b1b36] text-white shadow-md" : "text-slate-500 hover:text-slate-700"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        
        {/* LEFT MAIN (8 cols) */}
        <div className="flex flex-col gap-6 lg:col-span-8">
          
          {/* Top Risk Signal Box */}
          <div className="relative p-10 overflow-hidden bg-white border border-t-8 shadow-sm rounded-3xl border-slate-100 border-t-rose-600">
            <div className="flex items-start justify-between mb-8">
              <div>
                <span className="bg-rose-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                  CRITICAL CLUSTER
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 border border-rose-100 rounded-lg text-rose-600 font-bold text-xs uppercase tracking-wide">
                <Clock className="w-3.5 h-3.5" />
                Detected Today
              </div>
            </div>

            <h2 className="mb-4 text-4xl font-black text-[#0b1b36] tracking-tight">
              {primaryCluster.title}
            </h2>
            
            <p className="text-lg font-bold text-rose-600 mb-6 drop-shadow-sm">
              Affecting {primaryCluster.team_count} teams ({primaryCluster.percentage}% of scope)
            </p>

            <div className="p-6 mb-8 border border-rose-100 bg-rose-50/50 rounded-2xl">
               <h4 className="mb-2 text-[11px] font-black tracking-widest text-rose-800 uppercase">Description</h4>
               <p className="text-sm font-semibold leading-relaxed text-slate-700">
                {primaryCluster.description}
               </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <button className="px-8 py-4 text-sm font-black text-white transition-all bg-rose-600 hover:bg-rose-700 rounded-xl shadow-lg shadow-rose-200 uppercase tracking-widest">
                Initiate Focus Session
              </button>
              <button onClick={() => setIsModalOpen(true)} className="px-8 py-4 text-sm font-black text-rose-600 transition-all border-2 border-rose-600 hover:bg-rose-50 rounded-xl uppercase tracking-widest">
                Log Response
              </button>
            </div>
          </div>

          {/* Team Risk Distribution Table */}
          <div className="p-8 bg-white border border-slate-100 shadow-sm rounded-3xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-black tracking-widest text-[#0b1b36] uppercase">Team Risk Distribution</h3>
              <button className="text-xs font-bold text-teal-600 hover:underline">Download CSV</button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Team</th>
                    <th className="pb-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Risk level</th>
                    <th className="pb-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Primary Issue</th>
                    <th className="pb-4 text-right text-[11px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teamOverview.map((row, i) => (
                    <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                      <td className="py-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">{row.team_name}</span>
                          <span className="text-[10px] text-slate-400 font-extrabold tracking-widest text-left">{row.team_code}</span>
                        </div>
                      </td>
                      <td className="py-5 text-center">
                        <span className={`px-3 py-1 text-[10px] font-black tracking-widest rounded-full uppercase ${
                          row.risk_status === 'Critical' ? 'bg-rose-100 text-rose-700' : 
                          row.risk_status === 'Elevated' ? 'bg-amber-100 text-amber-700' : 'bg-teal-100 text-teal-700'
                        }`}>
                          {row.risk_status}
                        </span>
                      </td>
                      <td className="py-5 font-bold text-slate-600">{row.top_issue}</td>
                      <td className="py-5 text-right">
                        <button
                          onClick={() =>
                            navigate(
                              `/dashboard/burnout-risk-details?team=${encodeURIComponent(row.team_name)}`
                            )
                          }
                          className="text-slate-400 hover:text-teal-600 transition-all"
                        >
                          <ArrowRight className="w-5 h-5 ml-auto" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* RIGHT SIDEBAR (4 cols) */}
        <div className="flex flex-col gap-6 lg:col-span-4">
          
          {/* Summary Cards Grid */}
          <div className="grid grid-cols-2 gap-4">
            {summaryCards.map((card, idx) => (
              <div key={idx} className="p-5 bg-white border border-slate-100 shadow-sm rounded-2xl">
                <h4 className="mb-2 text-[10px] font-black tracking-widest text-slate-400 uppercase">{card.label}</h4>
                <p className="text-xl font-black text-[#0b1b36]">{card.value}</p>
                <p className="mt-1 text-[10px] font-bold text-slate-500 uppercase tracking-tight">{card.meta}</p>
              </div>
            ))}
          </div>

          {/* Escalation Alerts */}
          <div className="p-8 bg-white border border-slate-100 shadow-sm rounded-3xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-black tracking-widest text-[#0b1b36] uppercase flex items-center justify-between">
                Escalation Alerts
                <span className="px-2 py-0.5 ml-2 bg-rose-100 text-rose-700 text-[10px] rounded animate-pulse">LIVE</span>
              </h3>
              <button
                onClick={() => navigate("/action-history")}
                className="text-[11px] font-black text-teal-600 uppercase tracking-widest hover:underline"
              >
                View Full History
              </button>
            </div>
            
            <div className="flex flex-col gap-6">
              {escalationAlerts.map((alert, i) => (
                <div key={i} className="flex flex-col p-5 transition-all border border-slate-50 bg-slate-50/30 rounded-2xl hover:bg-slate-50 hover:border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black text-rose-600 uppercase tracking-widest">{alert.tags?.[0] || "Critical"}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{alert.tags?.[1] || "Live"}</span>
                  </div>
                  <h4 className="mb-2 text-sm font-black text-slate-800">{alert.team_name}</h4>
                  <p className="text-xs font-semibold leading-relaxed text-slate-500">
                    {alert.summary || alert.headline}
                  </p>
                  <button
                    onClick={() =>
                      navigate(
                        `/dashboard/burnout-risk-details?team=${encodeURIComponent(alert.team_name)}`
                      )
                    }
                    className="flex items-center mt-4 text-[11px] font-black text-rose-600 uppercase tracking-widest hover:translate-x-1 transition-transform"
                  >
                    Action Required <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </button>
                </div>
              ))}
              {escalationAlerts.length === 0 && (
                <div className="py-12 text-center text-slate-400">
                   <CheckCircle className="w-10 h-10 mx-auto mb-3 opacity-20" />
                   <p className="text-xs font-bold uppercase tracking-widest">No Active Escalations</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
      
      <LogActionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

    </div>
  );
}
