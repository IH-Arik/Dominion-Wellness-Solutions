import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Users, Award, AlertTriangle, FileBarChart, Search, ChevronDown, ExternalLink } from "lucide-react";
import api from "../../lib/api";

const iconMap = {
  total_teams: <Users className="w-5 h-5 text-blue-600" />,
  total_members: <Users className="w-5 h-5 text-blue-600" />,
  high_performers: <Award className="w-5 h-5 text-teal-600" />,
  at_risk_members: <AlertTriangle className="w-5 h-5 text-rose-600" />,
  avg_score: <FileBarChart className="w-5 h-5 text-slate-500" />,
};

export default function Organizations() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const search = params.get("query") || "";
  const riskFilter = params.get("risk") || "all";
  const sortBy = params.get("sort") || "performance";
  const page = parseInt(params.get("page") || "1");

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setLoading(true);
        const response = await api.get("/dashboard/superadmin/organizations", {
          params: {
            query: search,
            risk_filter: riskFilter,
            sort_by: sortBy,
            page: page,
            page_size: 10,
          },
        });
        setData(response.data.data);
      } catch (err) {
        console.error("Error fetching organizations:", err);
        setError("Failed to load organizations.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, [search, riskFilter, sortBy, page]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen pt-20">
        <div className="text-lg font-medium text-slate-600">Loading Organizations...</div>
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

  const items = data.items || [];
  const totalPages = data.pagination?.total_pages || 1;

  return (
    <div className="min-h-screen p-6 mt-20 bg-[#f9fafb] font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {data.summary_cards?.map((s, i) => (
          <div key={i} className="flex flex-col relative justify-center p-6 bg-white border shadow-sm rounded-2xl border-slate-100 min-h-[120px]">
            {s.delta_label && (
              <span className={`absolute top-6 right-6 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${s.status === 'success' ? 'text-teal-700 bg-teal-50' : 'text-rose-700 bg-rose-50'}`}>
                {s.delta_label}
              </span>
            )}
            <div className={`flex items-center justify-center w-10 h-10 mb-4 rounded-xl ${s.status === 'success' ? 'bg-teal-50' : s.status === 'warning' ? 'bg-rose-50' : 'bg-slate-100'}`}>
              {iconMap[s.key] || <Users className="w-5 h-5 text-blue-600" />}
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
            onChange={(e) => setParams({ ...Object.fromEntries(params), query: e.target.value, page: 1 })}
            placeholder="Search by name or ID..."
            className="w-full py-3.5 pr-4 text-sm font-medium border bg-white border-slate-100 rounded-xl pl-11 focus:outline-none focus:ring-2 focus:ring-slate-200 placeholder-slate-400 shadow-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 ml-auto">
          {/* Show Segmented Control */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold tracking-widest uppercase text-slate-500">Risk:</span>
            <div className="flex bg-[#e2e8f0]/60 rounded-lg p-1 gap-1">
              {["all", "watch", "elevated"].map((f) => (
                <button key={f} onClick={() => setParams({ ...Object.fromEntries(params), risk: f, page: 1 })}
                  className={`px-4 py-1.5 rounded-md text-[11px] font-black tracking-wide transition-all uppercase ${riskFilter === f ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Dropdown visual */}
          <select 
            value={sortBy}
            onChange={(e) => setParams({ ...Object.fromEntries(params), sort: e.target.value, page: 1 })}
            className="flex items-center gap-2 bg-white border border-slate-100 rounded-lg px-4 py-2.5 shadow-sm cursor-pointer hover:bg-slate-50 focus:outline-none text-sm font-bold text-slate-800"
          >
            <option value="performance">Performance</option>
            <option value="risk">Risk Level</option>
            <option value="score">Avg. Score</option>
          </select>
        </div>
      </div>

      {/* Data Table Container */}
      <div className="bg-white border shadow-sm rounded-[24px] border-slate-100 overflow-hidden mb-6">
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {["COMPANY",  "RISK LEVEL", "PRIMARY DRIVER", "TREND SUMMARY", "ACTION"].map((h) => (
                  <th key={h} className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest px-6 py-5 whitespace-nowrap bg-white">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-sm text-center text-slate-400">
                    No organizations found matching your filters.
                  </td>
                </tr>
              ) : items.map((m, i) => (
                <tr key={i} className="transition-colors border-b border-slate-100 hover:bg-slate-50/50">
                  {/* Member */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {m.company_logo_url ? (
                        <img src={m.company_logo_url} alt={m.company_name} className="w-10 h-10 rounded-full shadow-sm object-contain" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold uppercase">
                          {m.company_name.charAt(0)}
                        </div>
                      )}
                      <span className="font-extrabold text-[#0b1b36] whitespace-nowrap">{m.company_name}</span>
                    </div>
                  </td>
                  
                  {/* Risk */}
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-black tracking-widest uppercase border ${
                      m.risk_level === 'Elevated' ? 'text-rose-600 bg-rose-50 border-rose-100' : 
                      m.risk_level === 'Watch' ? 'text-amber-600 bg-amber-50 border-amber-100' : 
                      'text-teal-600 bg-teal-50 border-teal-100'}`}>
                      {m.risk_level}
                    </span>
                  </td>
                  {/* Driver */}
                  <td className="px-6 py-4">
                    <span className={`text-[13px] font-bold ${m.risk_level === 'Elevated' ? 'text-rose-600' : 'text-slate-700'}`}>
                      {m.primary_driver}
                    </span>
                  </td>
                  {/* Trend */}
                  <td className="px-6 py-4 text-xs font-medium leading-relaxed text-slate-500 max-w-[250px]">
                    {m.trend_summary}
                  </td>
                  {/* Action */}
                  <td className="px-6 py-4">
                    <button
                      onClick={() => navigate(`/company-dashboard?company=${encodeURIComponent(m.company_name)}`)}
                      className="flex items-center gap-1.5 text-[13px] font-extrabold text-teal-600 transition-colors hover:text-teal-800 whitespace-nowrap"
                    >
                      View Details
                      <ExternalLink className="w-3.5 h-3.5 mb-0.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col items-center justify-between gap-4 ml-2 mr-2 sm:flex-row">
        <p className="text-xs font-medium text-slate-500">
          Showing {items.length} of {data.pagination?.total_items || 0} results
        </p>
        <div className="flex items-center gap-2">
          <button 
            disabled={page === 1}
            onClick={() => setParams({ ...Object.fromEntries(params), page: page - 1 })}
            className="px-4 py-2 text-xs font-bold transition-colors bg-white border rounded-lg shadow-sm border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          >
            Previous
          </button>
          
          <div className="flex items-center gap-1">
             <span className="w-8 h-8 rounded-lg text-xs font-black bg-[#0b1b36] text-white flex items-center justify-center">
                {page}
              </span>
          </div>

          <button 
            disabled={page >= totalPages}
            onClick={() => setParams({ ...Object.fromEntries(params), page: page + 1 })}
            className="px-4 py-2 text-xs font-bold transition-colors bg-white border rounded-lg shadow-sm border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

    </div>
  );
}
