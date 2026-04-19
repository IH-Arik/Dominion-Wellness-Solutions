import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { TrendingUp, BedDouble, AlertCircle, ArrowRight, ExternalLink, Download } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../lib/api';
import { getDashboardPath } from "../../lib/auth";

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-100 ${className}`}>
    {children}
  </div>
);

const ProgressBar = ({ value, color, bgClass = "bg-slate-100" }) => (
  <div className={`h-1.5 w-full rounded-full ${bgClass} overflow-hidden`}>
    <div className={`h-full ${color}`} style={{ width: `${value}%` }} />
  </div>
);

export default function Report() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const range = searchParams.get("range") || "30d";

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const response = await api.get(getDashboardPath("report"), {
          params: { page, range }
        });
        setData(response.data.data);
      } catch (err) {
        console.error("Error fetching report:", err);
        setError("Failed to load report data.");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [page, range]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen pt-20 text-slate-600 font-bold uppercase tracking-widest">
        Loading Reports...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen pt-20 text-rose-600 font-bold uppercase tracking-widest">
        {error}
      </div>
    );
  }

  const {
    summary_cards = [],
    performance_trends = {},
    driver_analysis = { items: [] },
    risk_distribution = [],
    auto_generated_insights = {},
    members = { items: [], pagination: { total_pages: 1, total_items: 0 } },
  } = data || {};

  const drivers = Array.isArray(driver_analysis) ? driver_analysis : (driver_analysis.items || []);
  const membersList = Array.isArray(members) ? members : (members.items || []);
  const pagination = members.pagination || { total_pages: 1, total_items: 0 };
  const trendSeries = performance_trends.series || [];
  const performanceTrendRows = trendSeries[0]?.points?.map((point, index) => ({
    day: point.day_label || point.date,
    ops: trendSeries.find((item) => item.key === "ops_score")?.points?.[index]?.value,
    stress: trendSeries.find((item) => item.key === "stress")?.points?.[index]?.value,
    sleep: trendSeries.find((item) => item.key === "sleep")?.points?.[index]?.value,
  })) || [];
  const riskDistributionRows = risk_distribution.map((item) => ({
    name: item.label,
    value: item.count ?? item.percentage ?? 0,
    color:
      item.label === "Critical"
        ? "#f43f5e"
        : item.label === "High Risk"
          ? "#fb7185"
          : item.label === "Strained"
            ? "#f59e0b"
            : item.label === "Stable"
              ? "#14b8a6"
              : "#cbd5e1",
  }));
  const insightHighlights = Array.isArray(auto_generated_insights)
    ? auto_generated_insights
    : (auto_generated_insights.highlights || auto_generated_insights.items || []);

  return (
    <div className="min-h-screen mt-2 p-6 bg-slate-50/50 font-sans text-slate-800" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* Top KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {summary_cards.map((kpi, idx) => (
          <Card key={idx} className="p-5 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-slate-500 uppercase tracking-widest text-[11px] font-bold">
                {kpi.label}
              </span>
              {kpi.delta && <TrendingUp className={`w-4 h-4 ${kpi.delta.startsWith('+') ? 'text-teal-600' : 'text-rose-600'}`} />}
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">
                {typeof kpi.value === "number" ? Number(kpi.value).toFixed(kpi.key === "leadership_climate" ? 1 : 2).replace(/\.00$/, "") : kpi.value}
              </span>
              {kpi.delta && (
                <span className={`text-xs font-bold ${kpi.delta.startsWith('+') ? 'text-teal-600' : 'text-rose-600'}`}>
                  {kpi.delta}
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2 p-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <h2 className="text-lg font-bold text-slate-800">Performance Trends</h2>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceTrendRows}>
                <CartesianGrid vertical={true} horizontal={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip 
                   contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="ops" stroke="#0d9488" strokeWidth={2.5} dot={false} activeDot={{ r: 6, fill: '#0d9488' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-6 font-bold uppercase tracking-widest text-sm">Driver Analysis</h2>
          <div className="space-y-5">
            {drivers.map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest mb-2">
                  <span className="text-slate-500">{item.name || item.label}</span>
                    <span style={{ color: item.color || '#0d9488' }}>{item.value || item.average_score}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${item.value || item.average_score}%`,
                      backgroundColor:
                        item.color ||
                        (item.condition === "Critical"
                          ? "#f43f5e"
                          : item.condition === "High Risk"
                            ? "#f59e0b"
                            : "#0d9488"),
                    }}
                  />
                  </div>
                </div>
              ))}
          </div>
        </Card>
      </div>

      {/* Bottom Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-6 flex flex-col justify-between">
          <h2 className="text-lg font-bold text-slate-800 mb-6 font-bold uppercase tracking-widest text-sm">Risk Distribution</h2>
          <div className="h-48 w-full mt-auto">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={riskDistributionRows} margin={{ bottom: 20 }}>
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 800 }} dy={10} />
                 <YAxis hide />
                 <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                 <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                   {riskDistributionRows.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color || '#f1f5f9'} />
                   ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
          </div>
        </Card>

        <div className="bg-[#0b1b36] rounded-xl shadow-lg p-8 flex flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-8">
              <h2 className="text-lg font-bold uppercase tracking-widest">Auto-Generated Insights</h2>
            </div>

            <div className="space-y-6 relative z-10">
              <h3 className="text-lg font-bold text-white mb-2">{auto_generated_insights.headline}</h3>
              {insightHighlights.map((insight, idx) => (
                 <div key={idx} className="flex gap-4">
                  <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                    idx === 0 ? 'bg-rose-900/30 border-rose-900/50' : 'bg-slate-800/80 border-slate-700'
                  }`}>
                    {idx === 0 ? <AlertCircle className="w-4 h-4 text-rose-400" /> : <BedDouble className="w-4 h-4 text-teal-400" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white mb-1 uppercase tracking-wider">{insight.title}</h3>
                    <p className="text-xs text-indigo-100/60 leading-relaxed font-medium">{insight.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={() => navigate('/ai-insights')}
            className="mt-8 text-xs font-black text-teal-400 tracking-[0.2em] uppercase flex items-center gap-2 hover:text-teal-300 transition-colors"
          >
            {auto_generated_insights.cta_label || "Full Analysis"} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table Section */}
      <h2 className="text-lg font-bold text-slate-800 mb-4 px-1 uppercase tracking-widest text-sm">Members Overview</h2>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] bg-slate-50/50 border-b border-slate-100">
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
                <tr key={member.user_id || member.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white text-[10px] font-bold">
                        {member.name ? member.name.split(' ').map(n => n[0]).join('') : '?'}
                      </div>
                      <span className="font-extrabold text-[#0b1b36]">{member.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-bold whitespace-nowrap">
                    {member.department}
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border ${
                      member.burnout_level === 'Elevated Burnout Risk' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                      member.burnout_level === 'Moderate' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-teal-50 text-teal-600 border-teal-100'
                    }`}>
                      {member.burnout_level || member.risk_level}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap font-bold text-slate-700">
                    {member.primary_driver}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-500 text-xs font-semibold max-w-xs">{member.trend_summary || member.trend}</p>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <button 
                      onClick={() => navigate(`/user-details?userId=${member.user_id}`)}
                      className="text-teal-600 font-black text-[11px] uppercase tracking-widest inline-flex items-center gap-1 hover:text-teal-800"
                    >
                      View Detail <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Showing <span className="text-slate-800">{(page - 1) * 10 + 1}</span> to <span className="text-slate-800">{Math.min(page * 10, pagination.total_items)}</span> of <span className="text-slate-800">{pagination.total_items}</span> results
          </p>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))} 
              disabled={page === 1}
              className="px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-white border border-slate-200 text-slate-500 rounded-lg hover:text-slate-800 disabled:opacity-30"
            >
              Prev
            </button>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((n) => (
                <button 
                  key={n} 
                  onClick={() => setPage(n)}
                  className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${
                    page === n 
                    ? "bg-[#0b1b36] text-white shadow-md" 
                    : "bg-white border border-slate-200 text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setPage(p => Math.min(pagination.total_pages, p + 1))} 
              disabled={page >= pagination.total_pages}
              className="px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-white border border-slate-200 text-slate-500 rounded-lg hover:text-slate-800 disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </div>
      </Card>

    </div>
  );
}
