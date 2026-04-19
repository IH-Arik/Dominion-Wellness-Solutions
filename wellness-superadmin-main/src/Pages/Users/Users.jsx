import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, ChevronDown, ExternalLink } from "lucide-react";
import api from "../../lib/api";

export default function User() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const search = params.get("query") || "";
  const statusFilter = params.get("status") || "all";
  const sortBy = params.get("sort") || "company";
  const page = parseInt(params.get("page") || "1");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await api.get("/dashboard/superadmin/users", {
          params: {
            query: search,
            status_filter: statusFilter,
            sort_by: sortBy,
            page: page,
            page_size: 10,
          },
        });
        setData(response.data.data);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load users.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [search, statusFilter, sortBy, page]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen pt-20">
        <div className="text-lg font-medium text-slate-600">Loading Users...</div>
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

      {/* Toolbar */}
      <div className="flex flex-col items-center justify-between gap-4 mb-4 sm:flex-row">
        {/* Search */}
        <div className="relative flex-1 w-full max-w-2xl">
          <Search className="absolute w-4 h-4 -translate-y-1/2 left-4 top-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setParams({ ...Object.fromEntries(params), query: e.target.value, page: 1 })}
            placeholder="Search by name or email..."
            className="w-full py-3.5 pr-4 text-sm font-medium border bg-white border-slate-100 rounded-xl pl-11 focus:outline-none focus:ring-2 focus:ring-slate-200 placeholder-slate-400 shadow-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 ml-auto">
          {/* Status filter */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold tracking-widest uppercase text-slate-500">Status:</span>
            <div className="flex bg-[#e2e8f0]/60 rounded-lg p-1 gap-1">
              {["all", "Risk", "Normal"].map((f) => (
                <button key={f} onClick={() => setParams({ ...Object.fromEntries(params), status: f, page: 1 })}
                  className={`px-4 py-1.5 rounded-md text-[11px] font-black tracking-wide transition-all uppercase ${statusFilter === f ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                  {f === 'all' ? 'All' : f}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Dropdown */}
          <select 
            value={sortBy}
            onChange={(e) => setParams({ ...Object.fromEntries(params), sort: e.target.value, page: 1 })}
            className="flex items-center gap-2 bg-white border border-slate-100 rounded-lg px-4 py-2.5 shadow-sm cursor-pointer hover:bg-slate-50 focus:outline-none text-sm font-bold text-slate-800"
          >
            <option value="company">By Company</option>
            <option value="name">By Name</option>
            <option value="risk">By Risk</option>
          </select>
        </div>
      </div>

      {/* Data Table Container */}
      <div className="bg-white border shadow-sm rounded-[24px] border-slate-100 overflow-hidden mb-6">
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {["MEMBER", "ROLE", "COMPANY", "RISK LEVEL", "ACTION"].map((h) => (
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
                    No members found matching your filters.
                  </td>
                </tr>
              ) : items.map((m, i) => (
                <tr key={m.user_id} className="transition-colors border-b border-slate-100 hover:bg-slate-50/50">
                  {/* Member */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {m.profile_image_url ? (
                        <img src={m.profile_image_url} alt={m.name} className="w-10 h-10 rounded-full shadow-sm object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white text-xs font-bold uppercase">
                          {m.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="font-extrabold text-[#0b1b36] whitespace-nowrap">{m.name}</span>
                        <span className="text-[10px] text-slate-400">{m.email}</span>
                      </div>
                    </div>
                  </td>
                  {/* Role */}
                  <td className="px-6 py-4 font-medium text-slate-600 whitespace-nowrap">{m.role}</td>
                  {/* Company */}
                  <td className="px-6 py-4 font-medium text-slate-600 whitespace-nowrap">{m.company}</td>
                  {/* Risk */}
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-black tracking-widest uppercase border ${
                      m.risk_status === 'Risk' ? 'text-rose-600 bg-rose-50 border-rose-100' : 'text-teal-600 bg-teal-50 border-teal-100'
                    }`}>
                      {m.risk_status}
                    </span>
                  </td>
                  {/* Action */}
                  <td className="px-6 py-4">
                    <button
                      onClick={() => navigate(`/user-details?userId=${m.user_id}`)}
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
