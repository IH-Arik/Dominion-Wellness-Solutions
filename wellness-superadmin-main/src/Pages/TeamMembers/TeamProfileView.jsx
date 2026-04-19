import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChevronDown, CheckSquare, Activity } from "lucide-react";
import api from "../../lib/api";
import { getDashboardPath } from "../../lib/auth";

export default function TeamProfileView() {
  const [params] = useSearchParams();
  const memberId = params.get("memberId");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [range, setRange] = useState("30d");

  useEffect(() => {
    if (!memberId) return;

    const fetchMemberDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`${getDashboardPath("members")}/${memberId}`, {
          params: { range: range },
        });
        setData(response.data.data);
      } catch (err) {
        console.error("Error fetching member details:", err);
        setError("Failed to load member details.");
      } finally {
        setLoading(false);
      }
    };

    fetchMemberDetails();
  }, [memberId, range]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen pt-20">
        <div className="text-lg font-medium text-slate-600">Loading Member Details...</div>
      </div>
    );
  }

  if (error || !memberId) {
    return (
      <div className="flex items-center justify-center min-h-screen pt-20">
        <div className="text-lg font-medium text-rose-600">{error || "Member ID not found."}</div>
      </div>
    );
  }

  const member = data.member_summary || {};
  const riskSignal = data.primary_risk_signal || {};
  const drivers = data.core_wellness_drivers || [];
  const indicators = data.indicator_cards || [];
  const chartData = data.ops_score_trend || [];
  const signals14Day = data.signals_14_day || { items: [] };
  const actionLog = data.leadership_action_log || [];
  const actionForm = data.leadership_action_form || {};

  return (
    <div className="min-h-screen mt-20 p-6 bg-[#f9fafb] font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Top Profile Header */}
      <div className="flex flex-col items-start justify-between gap-6 mb-8 lg:flex-row lg:items-center">
        <div className="flex items-start gap-6">
          {member.profile_image_url ? (
            <img
              src={member.profile_image_url}
              alt={member.name}
              className="w-20 h-20 shadow-md rounded-2xl object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center text-white text-3xl font-bold uppercase shadow-md">
              {member.name?.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-extrabold text-[#0b1b36] tracking-tight">{member.name}</h1>
            <p className="mt-1 font-medium text-slate-500">{member.role} at {member.company}</p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {member.department && (
                <span className="px-2.5 py-1 text-[10px] font-black tracking-widest uppercase text-slate-600 bg-slate-200/50 rounded-md">
                  {member.department}
                </span>
              )}
              {member.team && (
                <span className="px-2.5 py-1 text-[10px] font-black tracking-widest uppercase text-slate-600 bg-slate-200/50 rounded-md">
                  {member.team}
                </span>
              )}
              <span className={`px-2.5 py-1 text-[10px] font-black tracking-widest uppercase rounded-md ml-1 ${
                member.current_condition === 'Normal' ? 'text-teal-700 bg-teal-100' : 'text-rose-700 bg-rose-100'
              }`}>
                {member.current_status_label}
              </span>
              <span className="ml-2 text-xs font-semibold text-slate-400 text-nowrap">
                Last updated: {member.updated_at ? new Date(member.updated_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-baseline gap-2 text-right">
          <span className={`text-5xl font-black ${member.current_ops_score < 70 ? 'text-rose-600' : 'text-teal-600'}`}>
            {Math.round(member.current_ops_score || 0)}
          </span>
          <div className="flex flex-col items-start">
            <span className="text-xl font-bold text-slate-400">/ 100</span>
            <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase mt-1">CURRENT OPS SCORE</span>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        
        {/* LEFT SIDEBAR (Col span 4) */}
        <div className="flex flex-col gap-6 lg:col-span-4">
          
          {/* Primary Risk Signal */}
          <div className={`p-6 bg-white border border-t-4 shadow-sm rounded-2xl border-slate-100 ${
            riskSignal.level === 'Normal' ? 'border-t-teal-600' : 'border-t-rose-600'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-black tracking-widest text-slate-500 uppercase">Primary Risk Signal</span>
              <Activity className={`w-4 h-4 ${riskSignal.level === 'Normal' ? 'text-teal-600' : 'text-rose-600'}`} />
            </div>
            <h2 className={`mb-1 text-3xl font-black tracking-tight ${riskSignal.level === 'Normal' ? 'text-teal-600' : 'text-rose-600'}`}>
              {riskSignal.label}
            </h2>
            <p className={`mb-4 text-xs font-bold tracking-wide ${riskSignal.level === 'Normal' ? 'text-teal-500' : 'text-rose-500'}`}>
              {riskSignal.trend}
            </p>
            <p className="text-[13px] leading-relaxed font-medium text-slate-600">
              {riskSignal.summary}
            </p>
          </div>

          {/* Log Leadership Action */}
          <div className="flex flex-col flex-1 p-6 bg-white border shadow-sm border-slate-100 rounded-2xl">
            <div className="flex items-center gap-2 mb-6">
              <CheckSquare className="w-5 h-5 text-slate-700" />
              <h3 className="text-sm font-bold text-slate-800">Log Leadership Action</h3>
            </div>

            <div className="flex flex-col flex-1 gap-5">
              <div>
                <label className="block mb-2 text-[10px] font-black tracking-widest text-slate-500 uppercase">RECOMMENDED ACTION</label>
                <div className="relative">
                  <select className="w-full py-3 pl-4 pr-10 text-sm font-semibold border outline-none appearance-none border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:ring-2 focus:ring-slate-200">
                    <option value="">Select from recommendations...</option>
                    {actionForm.recommended_actions?.map((act, i) => (
                      <option key={act} value={act}>{act}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute w-4 h-4 -translate-y-1/2 pointer-events-none right-4 top-1/2 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-[10px] font-black tracking-widest text-slate-500 uppercase">CUSTOM ACTION</label>
                <input 
                  type="text" 
                  placeholder={actionForm.custom_action_placeholder || "Enter custom action..."}
                  className="w-full px-4 py-3 text-sm font-medium border outline-none border-slate-200 rounded-xl bg-slate-50 placeholder-slate-400 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <div className="flex-1">
                <label className="block mb-2 text-[10px] font-black tracking-widest text-slate-500 uppercase">NOTES</label>
                <textarea 
                  placeholder={actionForm.notes_placeholder || "Add notes..."}
                  className="w-full h-32 px-4 py-3 text-sm font-medium border outline-none resize-none border-slate-200 rounded-xl bg-slate-50 placeholder-slate-400 focus:ring-2 focus:ring-slate-200"
                ></textarea>
              </div>

              <button className="w-full py-3.5 mt-2 text-sm font-bold text-white transition-colors bg-[#0b1b36] hover:bg-[#112750] rounded-xl shadow-md">
                Send Action
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT MAIN AREA (Col span 8) */}
        <div className="flex flex-col gap-6 lg:col-span-8">
          
          {/* Core Wellness Drivers */}
          <div className="p-8 bg-white border border-slate-100 shadow-sm rounded-[24px]">
            <h3 className="mb-8 text-sm font-extrabold text-[#0b1b36]">Core Wellness Drivers</h3>

            <div className="flex flex-col gap-6">
              {drivers.map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-2">
                    <span className="text-[13px] font-bold text-slate-700">{item.label}</span>
                    <span className={`text-[13px] font-black ${item.value < 50 ? "text-rose-600" : "text-teal-600"}`}>{item.value}%</span>
                  </div>
                  <div className="w-full h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-r-full ${item.color}`}
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4 Risk Cards Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {indicators.map((card, i) => (
              <div key={i} className={`p-6 bg-white border border-slate-100 shadow-sm rounded-[20px] ${i === 2 ? 'border-l-[6px] border-l-rose-600' : ''}`}>
                <h4 className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">{card.label}</h4>
                <p className={`mb-3 text-xl font-extrabold ${
                  card.risk_level === 'High' ? 'text-rose-700' : card.risk_level === 'Watch' ? 'text-amber-700' : 'text-teal-700'
                }`}>
                  {card.status}
                </p>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    card.risk_level === 'High' ? 'bg-rose-600' : card.risk_level === 'Watch' ? 'bg-amber-600' : 'bg-teal-600'
                  }`}></div>
                  <span className="text-[13px] font-medium text-slate-500">
                    {card.risk_level === 'Optimal' ? 'System healthy' : card.risk_level === 'Watch' ? 'Monitoring closely' : 'Action recommended'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            
            {/* OPS Score Trend */}
            <div className="p-6 bg-white border border-slate-100 shadow-sm rounded-[24px] md:col-span-2">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-bold text-[#0b1b36]">OPS Score Trend ({range})</h3>
                <div className="flex items-center gap-4 text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-300"></div>Benchmark</div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-teal-600 rounded-full"></div>Actual</div>
                </div>
              </div>

              <div className="w-full h-48 -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: "bold" }} 
                      dy={10}
                    />
                    <Tooltip cursor={{ stroke: '#f1f5f9', strokeWidth: 2 }} />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#0d9488"
                      strokeWidth={4}
                      dot={false}
                      activeDot={{ r: 6, fill: "#0d9488", stroke: "#fff", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 14-Day Signals */}
            <div className="p-6 flex flex-col shadow-md rounded-[24px] bg-gradient-to-b from-[#0b1b36] to-[#12315c] text-white">
              <h3 className="mb-6 text-sm font-bold text-white">14-Day Signals</h3>
              <div className="flex flex-col justify-between flex-1 gap-4">
                {signals14Day.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between pb-3 border-b border-slate-700/50 last:border-0 last:pb-0">
                    <span className="text-[13px] font-medium text-slate-300">{item.label}</span>
                    <span className={`px-3 py-1 text-[10px] font-black tracking-widest rounded-full ${
                      item.risk_level === 'High' ? 'bg-rose-900/50 text-rose-400 border border-rose-800' : 
                      item.risk_level === 'Neutral' ? 'bg-teal-900/50 text-teal-400 border border-teal-800' :
                      'bg-slate-800/80 text-slate-300 border border-slate-700'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-slate-800/50 rounded-xl text-[11px] leading-relaxed font-semibold text-slate-400">
                {signals14Day.footer || "Stability is being monitored across all domains."}
              </div>
            </div>

          </div>

          {/* Leadership Action Log */}
          <div className="p-8 bg-white border border-slate-100 shadow-sm rounded-[24px]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-bold text-[#0b1b36]">Leadership Action Log</h3>
              <span className="px-3 py-1 text-[11px] font-black tracking-widest text-teal-800 uppercase bg-teal-50 rounded-lg">READ ONLY</span>
            </div>
            
            <div className="flex flex-col gap-6">
              {actionLog.length === 0 ? (
                <p className="text-sm text-center py-4 text-slate-400">No actions logged yet.</p>
              ) : actionLog.map((action, i) => (
                <div key={i} className="flex items-start justify-between pb-6 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="flex items-start gap-4">
                    <div className="p-1 mt-0.5 bg-teal-50 rounded-md">
                      <CheckSquare className="w-4 h-4 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{action.title}</p>
                      <p className="mt-1 text-[13px] font-medium text-slate-500">{action.description}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">{action.relative_time}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
