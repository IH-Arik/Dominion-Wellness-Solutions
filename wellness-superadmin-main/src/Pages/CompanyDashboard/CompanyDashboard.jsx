import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Users, Award, AlertTriangle, FileBarChart, Search, ExternalLink } from "lucide-react";
import api from "../../lib/api";
import { ErrorState, FullPageLoadingState, RefreshingOverlay } from "../../Components/App/AsyncState";
import { useRefetchAwareLoading } from "../../lib/useRefetchAwareLoading";

const iconMap = {
  total_teams: <Users className="w-5 h-5 text-blue-600" />,
  total_members: <Users className="w-5 h-5 text-blue-600" />,
  high_performers: <Award className="w-5 h-5 text-teal-600" />,
  at_risk_members: <AlertTriangle className="w-5 h-5 text-rose-600" />,
  avg_team_score: <FileBarChart className="w-5 h-5 text-slate-500" />,
};

export default function CompanyDashboard() {
  const [params, setParams] = useSearchParams();
  const companyName = params.get("company");
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { loading, isRefreshing, beginLoading, finishLoading } = useRefetchAwareLoading();

  const search = params.get("query") || "";
  const filter = params.get("filter") || "All";
  const sortBy = params.get("sort") || "Performance";
  const team = params.get("team") || undefined;
  const range = params.get("range") || "30d";
  const startDate = params.get("start_date") || undefined;
  const endDate = params.get("end_date") || undefined;
  const page = parseInt(params.get("page") || "1");

  useEffect(() => {
    if (!companyName) return;

    const fetchCompanyData = async () => {
      beginLoading();
      try {
        setError(null);
        const response = await api.get(`/dashboard/superadmin/organizations/${encodeURIComponent(companyName)}`, {
          params: {
            query: search,
            risk_filter: filter,
            sort_by: sortBy,
            team,
            range,
            start_date: startDate,
            end_date: endDate,
            page: page,
            page_size: 10,
          },
        });
        setData(response.data.data);
        finishLoading(true);
      } catch (err) {
        console.error("Error fetching company dashboard data:", err);
        setError("Failed to load company dashboard data.");
        finishLoading(false);
      }
    };

    fetchCompanyData();
  }, [companyName, search, filter, sortBy, team, range, startDate, endDate, page, beginLoading, finishLoading]);

  if (loading && !data) {
    return <FullPageLoadingState label="Loading Company Dashboard..." />;
  }

  if ((error && !data) || !companyName) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-20">
        <div className="w-full max-w-xl px-6">
          <ErrorState message={error || "Company name not found."} />
        </div>
      </div>
    );
  }

  const membersData = data.members || {};
  const items = membersData.items || [];
  const summaryCards = data.summary_cards || [];
  const totalPages = membersData.pagination?.total_pages || 1;

  const buildMemberDetailsUrl = (userId) => {
    const nextParams = new URLSearchParams({
      userId: String(userId),
      company: companyName,
      source: "company-dashboard",
    });
    return `/user-details?${nextParams.toString()}`;
  };

  return (
    <div className="relative min-h-screen p-6 mt-20 bg-[#f9fafb] font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
      {isRefreshing ? <RefreshingOverlay label="Updating company dashboard..." /> : null}
      {error ? <div className="mb-6"><ErrorState message={error} /></div> : null}

      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[#0b1b36] tracking-tight">{companyName} Dashboard</h1>
        <p className="text-sm font-medium text-slate-500">Overview of wellness metrics across all teams.</p>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 gap-4 mb-8 sm:grid-cols-3 lg:grid-cols-5">
        {summaryCards.map((s, i) => (
          <div key={i} className="flex flex-col relative justify-center p-6 bg-white border shadow-sm rounded-2xl border-slate-100 min-h-[120px]">
            {s.badge && (
              <span className={`absolute top-6 right-6 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
                s.status === 'success' ? 'text-teal-700 bg-teal-50' : 'text-rose-700 bg-rose-50'
              }`}>
                {s.badge}
              </span>
            )}
            <div className={`flex items-center justify-center w-10 h-10 mb-4 rounded-xl ${
              s.status === 'success' ? 'bg-teal-50' : s.status === 'warning' ? 'bg-rose-50' : 'bg-blue-50'
            }`}>
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
            placeholder="Search by name or role..."
            className="w-full py-3.5 pr-4 text-sm font-medium border bg-white border-slate-100 rounded-xl pl-11 focus:outline-none focus:ring-2 focus:ring-slate-200 placeholder-slate-400 shadow-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 ml-auto">
          {/* Show Segmented Control */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold tracking-widest uppercase text-slate-500">Show:</span>
            <div className="flex bg-[#e2e8f0]/60 rounded-lg p-1 gap-1">
              {["All", "High", "Risk"].map((f) => (
                <button key={f} onClick={() => setParams({ ...Object.fromEntries(params), filter: f, page: 1 })}
                  className={`px-4 py-1.5 rounded-md text-[11px] font-black tracking-wide transition-all ${filter === f ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          <select 
            value={sortBy}
            onChange={(e) => setParams({ ...Object.fromEntries(params), sort: e.target.value, page: 1 })}
            className="flex items-center gap-2 bg-white border border-slate-100 rounded-lg px-4 py-2.5 shadow-sm cursor-pointer hover:bg-slate-50 focus:outline-none text-sm font-bold text-slate-800"
          >
            <option value="Performance">Performance</option>
            <option value="Risk">Risk Level</option>
            <option value="Role">Role</option>
          </select>
        </div>
      </div>

      {/* Data Table Container */}
      <div className="bg-white border shadow-sm rounded-[24px] border-slate-100 overflow-hidden mb-6">
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {["MEMBER", "ROLE", "TEAM", "RISK LEVEL", "PRIMARY DRIVER", "TREND SUMMARY", "ACTION"].map((h) => (
                  <th key={h} className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest px-6 py-5 whitespace-nowrap bg-white">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-sm text-center text-slate-400">
                    No members found matching your filters.
                  </td>
                </tr>
              ) : items.map((m, i) => (
                <tr key={i} className="transition-colors border-b border-slate-100 hover:bg-slate-50/50">
                  {/* Member */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {m.profile_image_url ? (
                        <img src={m.profile_image_url} alt={m.name} className="w-10 h-10 rounded-full shadow-sm object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold uppercase">
                          {m.name.charAt(0)}
                        </div>
                      )}
                      <span className="font-extrabold text-[#0b1b36] whitespace-nowrap">{m.name}</span>
                    </div>
                  </td>
                  {/* Role */}
                  <td className="px-6 py-4 font-medium text-slate-600 whitespace-nowrap">{m.role}</td>
                  {/* Team */}
                  <td className="px-6 py-4 font-medium text-slate-600 whitespace-nowrap">{m.team}</td>
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
                    <span className={`text-[13px] font-bold ${
                      m.risk_level === 'Elevated' ? 'text-rose-600' : 
                      m.risk_level === 'Watch' ? 'text-amber-600' : 'text-teal-600'
                    }`}>
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
                      onClick={() => navigate(buildMemberDetailsUrl(m.user_id))}
                      className="flex items-center gap-1.5 text-[13px] font-extrabold text-teal-600 transition-colors hover:text-teal-800 whitespace-nowrap"
                    >
                      View Profile
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
          Showing {items.length} of {membersData.pagination?.total_items || 0} results
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
