import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import {
  TrendingUp, TrendingDown, Clock, Zap, Coffee, Moon, ArrowRight, AlertTriangle, CloudRain, Lightbulb
} from "lucide-react";
import { BiDownArrow } from "react-icons/bi";
import api from "../../lib/api";
import { getDashboardPath } from "../../lib/auth";

const KPICard = ({ title, value, change, colorClass }) => (
  <div className="p-4 bg-white border shadow-sm rounded-xl border-slate-100">
    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{title}</h3>
    <div className="flex items-baseline gap-2">
      <span className={`text-xl font-bold ${colorClass || "text-slate-800"}`}>{value}</span>
      {change && <span className={`text-xs font-bold ${change.startsWith('+') ? 'text-teal-600' : 'text-rose-600'}`}>{change}</span>}
    </div>
  </div>
);

const ProgressBar = ({ label, value, colorClass }) => (
  <div className="mb-4 last:mb-0">
    <div className="flex justify-between text-[10px] font-bold mb-1">
      <span className="tracking-wider uppercase text-slate-600">{label}</span>
      <span className="text-slate-800">{value}%</span>
    </div>
    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${value}%` }} />
    </div>
  </div>
);

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const range = searchParams.get("range") || "30d";
  const team = searchParams.get("team") || undefined;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await api.get(getDashboardPath(), {
          params: {
            range,
            team,
          },
        });
        setData(response.data.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [range, team]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen pt-20">
        <div className="text-lg font-medium text-slate-600">Loading Dashboard...</div>
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

  const actionIcons = {
    workload: <CloudRain className="w-5 h-5 mb-3 text-teal-600" />,
    recovery: <Coffee className="w-5 h-5 mb-3 text-teal-600" />,
    sleep: <Moon className="w-5 h-5 mb-3 text-teal-600" />,
    morale: <Zap className="w-5 h-5 mb-3 text-teal-600" />,
  };

  return (
    <div className="min-h-screen mt-20 p-6 bg-[#f9fafb] font-sans text-slate-800" style={{ fontFamily: "'Inter', sans-serif" }}>
      <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">CORE PERFORMANCE INDICATORS</h2>
      <div className="grid grid-cols-2 gap-4 mb-8 sm:grid-cols-3 lg:grid-cols-5">
        <KPICard 
          title="OPS RATING" 
          value={data.team_summary?.average_ops || 0} 
          change={data.progress_snapshot?.overall_ops_change?.status} 
        />
        <KPICard 
          title="BURNOUT RISK" 
          value={data.group_burnout?.elevated_members || 0} 
          colorClass={(data.group_burnout?.elevated_members > 0) ? "text-rose-600" : "text-amber-600"} 
        />
        <KPICard 
          title="FATIGUE RISK" 
          value={data.alert_summary?.triggered_signals?.find(s => s.key === 'fatigue')?.affected_members || 0} 
          colorClass="text-amber-700" 
        />
        <KPICard 
          title="WORKLOAD STRAIN" 
          value={data.alert_summary?.triggered_signals?.find(s => s.key === 'workload_strain')?.affected_members || 0} 
          colorClass="text-slate-800" 
        />
        <KPICard 
          title="LEADERSHIP CLIMATE" 
          value={`${data.group_burnout?.average_leadership_climate || 0} /10`} 
          colorClass="text-slate-800" 
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-8">
          <div className="relative p-8 overflow-hidden border shadow-sm bg-gradient-to-br from-rose-50 to-white border-rose-100 rounded-2xl">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="bg-rose-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                  {data.alert_summary?.is_active ? 'HIGH PRIORITY' : 'STABLE'}
                </span>
                <span className="text-rose-600 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border border-rose-200 bg-white">
                  {data.top_risk_signal?.label || 'MONITORING'}
                </span>
              </div>
              <div className="text-right">
                <div className={`flex items-center gap-1 text-sm font-bold ${data.alert_summary?.worsening ? 'text-rose-600' : 'text-teal-600'}`}>
                  {data.alert_summary?.worsening ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />} 
                  {data.alert_summary?.worsening ? 'Worsening' : 'Improving'}
                </div>
                <div className="text-[10px] text-slate-400 font-medium mt-1">Updated Recently</div>
              </div>
            </div>
            
            <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-slate-800">{data.alert_summary?.headline}</h1>
            <p className="max-w-lg pb-2 mb-0 text-sm font-medium leading-relaxed text-slate-600">
              {data.alert_summary?.risk_level_description}
            </p>
          </div>

          <div>
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">IMMEDIATE RECOMMENDED ACTIONS</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {data.alert_summary?.recommended_actions?.slice(0, 3).map((action, idx) => (
                <div key={idx} className="p-5 bg-white border shadow-sm border-slate-100 rounded-xl">
                  {idx === 0 ? actionIcons.workload : idx === 1 ? actionIcons.recovery : actionIcons.sleep}
                  <h3 className="mb-1 text-sm font-bold text-slate-800">{action}</h3>
                  <p className="text-xs font-medium text-slate-500">Based on active risk signals</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">30-DAY IMPACT SNAPSHOT</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {data.impact_snapshot_cards?.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-4 border bg-slate-100/70 border-slate-200/50 rounded-xl">
                  <div className="flex flex-col items-center justify-center w-10 h-10 rounded-full bg-teal-100/50 shrink-0">
                    {item.value.includes('+') ? <TrendingUp className="w-4 h-4 text-teal-700" /> : <TrendingDown className="w-4 h-4 text-rose-700" />}
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">{item.label}</div>
                    <div className="text-sm font-bold text-slate-800">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-6">
            <div className="flex flex-col p-6 bg-white border shadow-sm border-slate-100 rounded-2xl">
              <h3 className="mb-6 font-bold text-slate-800">Team OPS Trend (30 Days)</h3>
              <div className="flex-1 w-full relative -ml-4 min-h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.ops_trend || []}>
                    <defs>
                      <linearGradient id="gradientOps" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#cbd5e1" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#e2e8f0" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day_label" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10 }} dy={10} />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip cursor={{ stroke: "#94a3b8", strokeWidth: 1, strokeDasharray: "4 4" }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="average_ops" stroke="#334155" strokeWidth={2} fill="url(#gradientOps)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gradient-to-b from-[#0b1b36] to-[#04122d] border border-[#1e3a6a] rounded-2xl shadow-lg p-8 text-white flex flex-col justify-between">
              <div>
                <h3 className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">AVERAGE TEAM OPS</h3>
                <div className="mb-2 text-5xl font-extrabold tracking-tight">{data.team_summary?.average_ops || 0}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Optimal Zone: 80-100</div>
              </div>

              <div className="mt-8 space-y-4">
                {data.driver_breakdown?.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-[10px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                      <span>{item.label}</span>
                      <span>{item.average_score}%</span>
                    </div>
                    <div className="w-full bg-[#1e3a6a] h-1.5 rounded-full overflow-hidden flex">
                      <div className={`h-full rounded-l-full bg-teal-500`} style={{ width: `${item.average_score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-8 lg:col-span-3">
          <div className="p-6 bg-white border shadow-sm border-slate-100 rounded-2xl py-7">
            <div className="flex items-start justify-between mb-6">
              <h3 className="font-bold leading-tight text-slate-800">Driver<br/>Breakdown</h3>
              <div className="bg-teal-50 text-teal-700 text-[10px] font-bold px-3 py-1.5 rounded-xl uppercase tracking-widest text-right max-w-[120px]">
                Strongest: {data.driver_breakdown?.[0]?.label} ({data.driver_breakdown?.[0]?.average_score || 0}%)
              </div>
            </div>

            <div className="space-y-4">
              {data.driver_breakdown?.map((driver, idx) => (
                <ProgressBar key={idx} label={driver.label} value={driver.average_score} colorClass="bg-teal-500" />
              ))}
            </div>
          </div>

          <div className="flex flex-col flex-1 overflow-hidden bg-white border shadow-sm border-rose-100 rounded-2xl">
            <div className="p-6 pb-2">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-500" />
                  <h3 className="font-bold text-rose-600">Active Burnout Alert</h3>
                </div>
                <span className="bg-rose-50 text-rose-600 text-[10px] font-bold px-2 py-0.5 rounded border border-rose-100">
                  {data.alert_summary?.is_active ? 'ACTIVE' : 'STABLE'}
                </span>
              </div>
              
              <div className="flex items-end justify-between mb-2">
                <span className="flex items-center gap-1 text-xs font-bold text-amber-600"><Lightbulb className="w-3 h-3"/> Triggered Signals:</span>
                <span className="text-[10px] text-slate-500 font-bold bg-slate-50 px-2 py-0.5 rounded">
                  {data.alert_summary?.triggered_signals?.length || 0} risk signals triggered
                </span>
              </div>
              
              <ul className="text-[11px] text-slate-600 font-medium space-y-1.5 mb-4 list-disc pl-4 marker:text-rose-500">
                {data.alert_summary?.triggered_signals?.map((signal, idx) => (
                  <li key={idx}>{signal.label} ({signal.affected_members} members)</li>
                ))}
              </ul>
              
              <div className="p-3 mb-6 bg-rose-50 rounded-xl">
                <p className="text-[10px] text-rose-800 leading-relaxed font-medium">
                  <span className="font-bold">Risk Level Description:</span> {data.alert_summary?.risk_level_description}
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-6 pt-0 mt-auto">
              <Link to="/dashboard/burnout-recommendations" className="flex-1 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl text-center transition-colors">
                View Recommendations
              </Link>
              <Link to="/dashboard/burnout-risk-details" className="flex-1 py-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl text-center transition-colors">
                View Risk Details
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col items-center justify-between gap-4 pt-6 pb-10 mt-8 text-xs border-t border-slate-200 sm:flex-row">
        <span className="font-medium text-slate-400">Total Teams Monitored: {data.pagination?.total_items || 1}</span>
        <div className="flex items-center gap-1 sm:gap-2">
          <button className="px-3 py-1.5 border border-slate-200 text-slate-500 rounded hover:bg-slate-50 font-medium">Previous</button>
          {[1].map(page => (
            <button key={page} className={`px-3 py-1.5 rounded font-medium ${page === 1 ? 'bg-[#0b1b36] text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {page}
            </button>
          ))}
          <button className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded hover:bg-slate-50 font-medium">Next</button>
        </div>
      </div>
    </div>
  );
}
