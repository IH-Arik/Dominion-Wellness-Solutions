import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Users, Award, AlertTriangle, Search, ExternalLink } from "lucide-react";
import api from "../../lib/api";
import { getDashboardPath } from "../../lib/auth";
import { ErrorState, FullPageLoadingState, RefreshingOverlay } from "../../Components/App/AsyncState";
import { useRefetchAwareLoading } from "../../lib/useRefetchAwareLoading";

export default function TeamMembers() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const { loading, isRefreshing, beginLoading, finishLoading } = useRefetchAwareLoading();
  
  const [search, setSearch] = useState("");
  const [show, setShow] = useState("All");
  const [sortBy, setSortBy] = useState("Performance");
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const team = searchParams.get("team") || undefined;

  useEffect(() => {
    const fetchTeamMembers = async () => {
      beginLoading();
      try {
        setError(null);
        const response = await api.get(getDashboardPath("members"), {
          params: {
            query: search,
            risk_filter: show.toLowerCase(),
            sort_by: sortBy.toLowerCase(),
            page: page,
            team,
          },
        });
        setData(response.data.data);
        finishLoading(true);
      } catch (err) {
        console.error("Error fetching team members:", err);
        setError("Failed to load team members.");
        finishLoading(false);
      }
    };

    fetchTeamMembers();
  }, [search, show, sortBy, page, team, beginLoading, finishLoading]);

  if (loading && !data) {
    return <FullPageLoadingState label="Loading Team Members..." />;
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

  const members = data.items || [];
  const stats = data.summary_cards || [];
  const pagination = data.pagination || { total_pages: 1, total_items: 0 };

  return (
    <div className="relative min-h-screen p-6 mt-20 bg-[#f9fafb] font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
      {isRefreshing ? <RefreshingOverlay label="Updating team members..." /> : null}
      {error ? <div className="mb-6"><ErrorState message={error} /></div> : null}

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 gap-4 mb-8 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s, i) => (
          <div key={i} className="flex flex-col relative justify-center p-6 bg-white border shadow-sm rounded-2xl border-slate-100 min-h-[120px]">
             {s.trend && (
              <span className={`absolute top-6 right-6 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${s.trend.startsWith('+') ? 'text-teal-700 bg-teal-50' : 'text-rose-700 bg-rose-50'}`}>
                {s.trend}
              </span>
            )}
            <div className={`flex items-center justify-center w-10 h-10 mb-4 rounded-xl ${
              s.label.includes('Risk') ? 'bg-rose-50' : s.label.includes('High') ? 'bg-teal-50' : 'bg-blue-50'
            }`}>
               {s.label.includes('Risk') ? <AlertTriangle className="w-5 h-5 text-rose-600" /> : 
                s.label.includes('High') ? <Award className="w-5 h-5 text-teal-600" /> : 
                <Users className="w-5 h-5 text-blue-600" />}
            </div>
            <div>
              <p className="text-3xl font-extrabold text-[#0b1b36]">{s.value}</p>
              <p className="mt-1 text-xs font-semibold tracking-wide text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col items-center justify-between gap-4 mb-4 sm:flex-row">
        {/* Search */}
        <div className="relative flex-1 w-full max-w-2xl">
          <Search className="absolute w-4 h-4 -translate-y-1/2 left-4 top-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or department..."
            className="w-full py-3.5 pr-4 text-sm font-medium border bg-white border-slate-100 rounded-xl pl-11 focus:outline-none focus:ring-2 focus:ring-slate-200 placeholder-slate-400 shadow-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 ml-auto">
          {/* Show Segmented Control */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold tracking-widest uppercase text-slate-500">Filters:</span>
            <div className="flex bg-[#e2e8f0]/60 rounded-lg p-1 gap-1">
              {["All", "Risk", "High"].map((f) => (
                <button key={f} onClick={() => { setShow(f); setPage(1); }}
                  className={`px-4 py-1.5 rounded-md text-[11px] font-black tracking-wide transition-all ${show === f ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Dropdown */}
          <select 
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
            className="bg-white border border-slate-100 rounded-lg px-4 py-2.5 shadow-sm text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          >
            <option value="Performance">Performance</option>
            <option value="Risk">Risk Level</option>
            <option value="Department">Department</option>
          </select>
        </div>
      </div>

      {/* Data Table Container */}
      <div className="bg-white border shadow-sm rounded-[24px] border-slate-100 overflow-hidden mb-6">
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {["MEMBER", "ROLE", "DEPARTMENT", "RISK LEVEL", "PRIMARY DRIVER", "ACTION"].map((h) => (
                  <th key={h} className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest px-6 py-5 whitespace-nowrap bg-white">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-sm font-bold uppercase tracking-widest text-center text-slate-300">
                    No members found matching your search criteria.
                  </td>
                </tr>
              ) : members.map((m, i) => (
                <tr key={m.user_id} className="transition-colors border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        {m.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-extrabold text-[#0b1b36] whitespace-nowrap">{m.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 font-bold text-slate-500 whitespace-nowrap">{m.role}</td>
                  <td className="px-6 py-5 font-bold text-slate-500 whitespace-nowrap">{m.department}</td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border ${
                      m.burnout_level === 'Elevated Burnout Risk' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                      m.burnout_level === 'Moderate' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-teal-50 text-teal-600 border-teal-100'
                    }`}>
                      {m.burnout_level}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`text-[13px] font-bold ${
                      m.burnout_level === 'Elevated Burnout Risk' ? 'text-rose-600' : 'text-slate-700'
                    }`}>
                      {m.primary_driver || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <button
                      onClick={() => navigate(`/user-details?userId=${m.user_id}&source=team-members`)}
                      className="flex items-center gap-1.5 text-[12px] font-black text-teal-600 transition-colors hover:text-teal-800 uppercase tracking-widest"
                    >
                      View Detail
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row px-2">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Showing <span className="text-slate-800">{(page - 1) * 10 + 1}</span> to <span className="text-slate-800">{Math.min(page * 10, pagination.total_items)}</span> of <span className="text-slate-800">{pagination.total_items}</span> results
        </p>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))} 
            disabled={page === 1}
            className="px-6 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 disabled:opacity-30 shadow-sm"
          >
            Prev
          </button>
          
          <div className="flex items-center gap-1.5">
            {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((n) => (
              <button 
                key={n} 
                onClick={() => setPage(n)}
                className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${
                  page === n 
                  ? "bg-[#0b1b36] text-white shadow-lg" 
                  : "bg-white border border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-800"
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          <button 
            onClick={() => setPage(p => Math.min(pagination.total_pages, p + 1))} 
            disabled={page >= pagination.total_pages}
            className="px-6 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 disabled:opacity-30 shadow-sm"
          >
            Next
          </button>
        </div>
      </div>

    </div>
  );
}
