import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { ChevronDown, CheckSquare, Activity, AlertTriangle } from "lucide-react";

export default function MemberDetailAnalysis() {
  const chartData = [
    { day: "30 DAYS AGO", score: 85 },
    { day: "25", score: 86 },
    { day: "20", score: 82 },
    { day: "15", score: 76 },
    { day: "10", score: 71 },
    { day: "5", score: 68 },
    { day: "TODAY", score: 72 },
  ];

  return (
    <div className="min-h-screen mt-20 p-6 bg-[#f9fafb] font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Top Profile Header */}
      <div className="flex flex-col items-start justify-between gap-6 mb-8 lg:flex-row lg:items-center">
        <div className="flex items-start gap-6">
          <img
            src="https://i.pravatar.cc/150?u=a"
            alt="Alex Jensen"
            className="w-20 h-20 shadow-md rounded-2xl"
          />
          <div>
            <h1 className="text-2xl font-extrabold text-[#0b1b36] tracking-tight">Alex Jensen</h1>
            <p className="mt-1 font-medium text-slate-500">Senior Developer at Company A</p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="px-2.5 py-1 text-[10px] font-black tracking-widest uppercase text-slate-600 bg-slate-200/50 rounded-md">
                SOFTWARE DEVELOPMENT
              </span>
              <span className="px-2.5 py-1 text-[10px] font-black tracking-widest uppercase text-slate-600 bg-slate-200/50 rounded-md">
                ENGINEERING - ALPHA
              </span>
              <span className="px-2.5 py-1 text-[10px] font-black tracking-widest uppercase text-rose-700 bg-rose-100 rounded-md ml-1">
                STRAINED STATUS
              </span>
              <span className="ml-2 text-xs font-semibold text-slate-400">
                Last updated: 2 hours ago
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-baseline gap-2 text-right">
          <span className="text-5xl font-black text-rose-600">72</span>
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
          <div className="p-6 bg-white border border-t-4 shadow-sm rounded-2xl border-slate-100 border-t-rose-600">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-black tracking-widest text-slate-500 uppercase">Primary Risk Signal</span>
              <Activity className="w-4 h-4 text-rose-600" />
            </div>
            <h2 className="mb-1 text-3xl font-black tracking-tight text-rose-600">High Stress</h2>
            <p className="mb-4 text-xs font-bold tracking-wide text-rose-500">Worsening Trend</p>
            <p className="text-[13px] leading-relaxed font-medium text-slate-600">
              Stress levels have increased significantly due to recent delivery cycles. Immediate recovery intervention is recommended to prevent burnout.
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
                    <option>Select from recommendations...</option>
                    <option>Mandate 2-day recovery break</option>
                    <option>Re-assign current sprint tickets</option>
                  </select>
                  <ChevronDown className="absolute w-4 h-4 -translate-y-1/2 pointer-events-none right-4 top-1/2 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-[10px] font-black tracking-widest text-slate-500 uppercase">CUSTOM ACTION</label>
                <input 
                  type="text" 
                  placeholder="Enter custom leadership action..." 
                  className="w-full px-4 py-3 text-sm font-medium border outline-none border-slate-200 rounded-xl bg-slate-50 placeholder-slate-400 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <div className="flex-1">
                <label className="block mb-2 text-[10px] font-black tracking-widest text-slate-500 uppercase">NOTES</label>
                <textarea 
                  placeholder="Context or specific team members..." 
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
              {[
                { label: "Physical Capacity", value: 75, color: "bg-teal-600" },
                { label: "Mental Resilience", value: 65, color: "bg-teal-600" },
                { label: "Recovery Capacity", value: 45, color: "bg-rose-600" },
                { label: "Purpose Alignment", value: 86, color: "bg-teal-600" },
                { label: "Morale & Cohesion", value: 82, color: "bg-teal-600" },
              ].map((item, i) => (
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
            
            <div className="p-6 bg-white border border-slate-100 shadow-sm rounded-[20px]">
              <h4 className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">BURNOUT RISK</h4>
              <p className="mb-3 text-xl font-extrabold text-rose-700">Elevated</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-600"></div>
                <span className="text-[13px] font-medium text-slate-500">Action recommended</span>
              </div>
            </div>

            <div className="p-6 bg-white border border-slate-100 shadow-sm rounded-[20px]">
              <h4 className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">FATIGUE RISK</h4>
              <p className="mb-3 text-xl font-extrabold text-amber-700">Watch</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-600"></div>
                <span className="text-[13px] font-medium text-slate-500">Monitoring closely</span>
              </div>
            </div>

            <div className="p-6 bg-white border border-slate-100 border-l-[6px] border-l-rose-600 shadow-sm rounded-[20px]">
              <h4 className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">WORKLOAD STRAIN</h4>
              <p className="mb-3 text-xl font-extrabold text-rose-700">High</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-600"></div>
                <span className="text-[13px] font-medium text-slate-500">Critical attention</span>
              </div>
            </div>

            <div className="p-6 bg-white border border-slate-100 shadow-sm rounded-[20px]">
              <h4 className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">LEADERSHIP CLIMATE</h4>
              <p className="mb-3 text-xl font-extrabold text-teal-700">Optimal</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-teal-600 rounded-full"></div>
                <span className="text-[13px] font-medium text-slate-500">System healthy</span>
              </div>
            </div>

          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            
            {/* OPS Score Trend */}
            <div className="p-6 bg-white border border-slate-100 shadow-sm rounded-[24px] md:col-span-2">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-bold text-[#0b1b36]">OPS Score Trend (30 Days)</h3>
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
                      ticks={["30 DAYS AGO", "15", "TODAY"]}
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
                {[
                  { label: "Energy", status: "LOW", pillClass: "bg-slate-800/80 text-slate-300 border border-slate-700" },
                  { label: "Stress", status: "HIGH", pillClass: "bg-rose-900/50 text-rose-400 border border-rose-800" },
                  { label: "Sleep", status: "SUB-OPTIMAL", pillClass: "bg-slate-800/80 text-slate-300 border border-slate-700" },
                  { label: "Motivation", status: "STABLE", pillClass: "bg-teal-900/50 text-teal-400 border border-teal-800" },
                  { label: "Recovery", status: "POOR", pillClass: "bg-rose-900/50 text-rose-400 border border-rose-800" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between pb-3 border-b border-slate-700/50 last:border-0 last:pb-0">
                    <span className="text-[13px] font-medium text-slate-300">{item.label}</span>
                    <span className={`px-3 py-1 text-[10px] font-black tracking-widest rounded-full ${item.pillClass}`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-slate-800/50 rounded-xl text-[11px] leading-relaxed font-semibold text-slate-400">
                Recovery is the primary inhibitor of performance for this cycle.
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
              {[
                { 
                  title: "Leader encouraged recovery break", 
                  desc: "Suggested taking 2 days off post-sprint completion", 
                  time: "2 days ago" 
                },
                { 
                  title: "Workload re-allocation session", 
                  desc: "Moved 3 high-priority tickets to Alpha-Team backup", 
                  time: "5 days ago" 
                },
                { 
                  title: "Bi-weekly Wellness check-in completed", 
                  desc: "Alex reported high satisfaction with team cohesion", 
                  time: "14 days ago" 
                },
              ].map((action, i) => (
                <div key={i} className="flex items-start justify-between pb-6 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="flex items-start gap-4">
                    <div className="p-1 mt-0.5 bg-teal-50 rounded-md">
                      <CheckSquare className="w-4 h-4 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{action.title}</p>
                      <p className="mt-1 text-[13px] font-medium text-slate-500">{action.desc}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">{action.time}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}