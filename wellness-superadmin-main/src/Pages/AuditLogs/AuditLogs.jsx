import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../lib/api";
import { getDashboardPath } from "../../lib/auth";

const statusConfig = {
  Success: {
    dot: "bg-emerald-500",
    text: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  Warning: {
    dot: "bg-amber-500",
    text: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  Failed: {
    dot: "bg-red-500",
    text: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
  },
};

function StatusBadge({ status }) {
  const cfg = statusConfig[status] || statusConfig.Success;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
}

function ActionDetailModal({ entry, onClose }) {
  const d = entry.details || {};
  const cfg = statusConfig[d.status || 'Success'] || statusConfig.Success;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-auto overflow-hidden bg-white shadow-2xl rounded-2xl animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <h2 className="text-base font-semibold tracking-tight text-gray-800">
            Action Details
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 transition-colors rounded-lg hover:text-gray-600 hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Primary Action */}
          <div className="p-4 border-l-4 border-teal-500 bg-gray-50 rounded-xl">
            <p className="mb-1 text-xs font-bold tracking-widest text-teal-600 uppercase">
              Primary Action
            </p>
            <p className="text-lg font-bold leading-snug text-gray-900">{d.primary_action}</p>
          </div>

          {/* Meta Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Performed By */}
            <div>
              <p className="mb-2 text-xs font-medium tracking-wider text-gray-400 uppercase">
                Performed By
              </p>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold bg-slate-700`}>
                  {entry.user_initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{d.performed_by?.name}</p>
                  <p className="text-xs text-gray-400">{d.performed_by?.role}</p>
                </div>
              </div>
            </div>

            {/* Target Entity */}
            <div>
              <p className="mb-2 text-xs font-medium tracking-wider text-gray-400 uppercase">
                Target Entity
              </p>
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg">
                  <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{d.target_entity?.organization_name}</p>
                  <p className="text-xs text-gray-400">{d.target_entity?.team || d.target_entity?.department}</p>
                </div>
              </div>
            </div>

            {/* Date & Time */}
            <div>
              <p className="mb-2 text-xs font-medium tracking-wider text-gray-400 uppercase">
                Date & Time
              </p>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-gray-700">{d.date_time}</p>
              </div>
            </div>

            {/* Status */}
            <div>
              <p className="mb-2 text-xs font-medium tracking-wider text-gray-400 uppercase">
                Status
              </p>
              <StatusBadge status={d.status || 'Success'} />
            </div>
          </div>

          {/* System Classification */}
          <div>
            <p className="mb-2 text-xs font-medium tracking-wider text-gray-400 uppercase">
              System Classification
            </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200 rounded-lg">
                {d.system_classification?.category}
                </span>
                <span className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200 rounded-lg">
                {d.system_classification?.module}
                </span>
              </div>
            </div>

          {/* Narrative */}
          <div>
            <p className="mb-2 text-xs font-medium tracking-wider text-gray-400 uppercase">
              Narrative Summary
            </p>
            <div className="p-4 border border-gray-100 bg-gray-50 rounded-xl">
              <p className="text-sm leading-relaxed text-gray-600">{d.narrative_summary}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5">
          <button
            onClick={onClose}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AuditLogs() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const search = params.get("query") || "";
  const statusFilter = params.get("status") || "all";
  const page = parseInt(params.get("page") || "1");
  const timeFilter = params.get("time") || "all";

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        setLoading(true);
        const response = await api.get(getDashboardPath("audit-logs"), {
          params: {
            query: search,
            time_filter: timeFilter,
            status_filter: statusFilter,
            page: page,
          },
        });
        setData(response.data.data);
      } catch (err) {
        console.error("Error fetching audit logs:", err);
        setError("Failed to load audit logs.");
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, [search, statusFilter, timeFilter, page]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen pt-20">
        <div className="text-lg font-medium text-slate-600">Loading Audit Logs...</div>
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
  const cards = data.summary_cards || [];

  const handleViewDetails = async (entry) => {
    try {
      setLoadingDetail(true);
      const endpoint = entry.details_action?.endpoint;
      if (!endpoint) {
        setSelectedEntry(entry);
        return;
      }
      const response = await api.get(endpoint.replace("/api/v1", ""));
      setSelectedEntry({
        ...entry,
        user_initials: (entry.user?.name || "?")
          .split(" ")
          .map((part) => part[0])
          .join("")
          .slice(0, 2)
          .toUpperCase(),
        details: response.data.data,
      });
    } catch (detailError) {
      console.error("Error fetching audit log detail:", detailError);
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div className="min-h-screen mt-20 font-sans bg-gray-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.97) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
      `}</style>

      <div className="px-6 py-8 mx-auto ">
 

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {cards.map((card, idx) => (
            <div key={idx} className="flex items-center justify-between p-5 bg-white border border-gray-100 shadow-sm rounded-2xl">
              <div>
                <p className="mb-1 text-xs font-medium tracking-wider text-gray-400 uppercase">
                  {card.label}
                </p>
                <p className={`text-3xl font-bold ${card.key === 'failed' ? 'text-red-500' : card.key === 'warnings' ? 'text-amber-500' : 'text-gray-900'}`}>
                  {card.value}
                </p>
              </div>
              <div className={`flex items-center justify-center w-11 h-11 rounded-xl ${card.key === 'failed' ? 'bg-red-50' : card.key === 'warnings' ? 'bg-amber-50' : 'bg-teal-50'}`}>
                <svg className={`w-5 h-5 ${card.key === 'failed' ? 'text-red-500' : card.key === 'warnings' ? 'text-amber-500' : 'text-teal-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 p-4 mb-4 bg-white border border-gray-100 shadow-sm rounded-2xl">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <svg className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by user, action, or team..."
              value={search}
              onChange={(e) => setParams({ ...Object.fromEntries(params), query: e.target.value, page: 1 })}
              className="w-full py-2 pr-4 text-sm text-gray-700 placeholder-gray-400 border border-gray-200 pl-9 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent bg-gray-50"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setParams({ ...Object.fromEntries(params), status: e.target.value, page: 1 })}
            className="px-3 py-2 text-sm text-gray-600 border border-gray-200 cursor-pointer rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-400"
          >
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="failed">Failed</option>
          </select>

          {/* Clear Filters */}
          <button
            onClick={() => setParams({})}
            className="flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 font-medium px-2 py-1.5 rounded-lg hover:bg-teal-50 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear Filters
          </button>
        </div>

        {/* Table */}
        <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {["Timestamp", "User", "Action", "Target", "Status", "Details"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-4 text-xs font-bold tracking-widest text-left text-gray-400 uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((entry) => (
                <tr key={entry.id} className="transition-colors hover:bg-gray-50/60 group">
                  {/* Timestamp */}
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-gray-800">{entry.timestamp_label?.date}</p>
                    <p className="text-xs text-gray-400">{entry.timestamp_label?.time}</p>
                  </td>

                  {/* User */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-slate-800 text-white`}
                      >
                        {(entry.user?.name || "?")
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-800 whitespace-nowrap">
                        {entry.user?.name}
                      </span>
                    </div>
                  </td>

                  {/* Action */}
                  <td className="px-5 py-4">
                    <p className="max-w-xs text-sm text-gray-600">{entry.action}</p>
                  </td>

                  {/* Target */}
                  <td className="px-5 py-4">
                    <span className="inline-block px-2.5 py-1 bg-gray-100 rounded-lg text-xs font-medium text-gray-600 border border-gray-200">
                      {entry.target}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    <StatusBadge status={entry.outcome} />
                  </td>

                  {/* Details */}
                  <td className="px-5 py-4">
                    <button
                      onClick={() => handleViewDetails(entry)}
                      className="flex items-center gap-1 text-sm font-semibold text-teal-600 transition-colors hover:text-teal-700 group-hover:underline"
                    >
                      {loadingDetail && selectedEntry?.id === entry.id ? "Loading..." : "View"}
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Showing {items.length} of {data.pagination?.total_items || 0} entries
            </p>
            <div className="flex items-center gap-1">
              <button 
                disabled={page === 1}
                onClick={() => setParams({ ...Object.fromEntries(params), page: page - 1 })}
                className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1.5 text-xs font-bold bg-slate-800 text-white rounded-lg">
                {page}
              </span>
              <button 
                disabled={page >= (data.pagination?.total_pages || 1)}
                onClick={() => setParams({ ...Object.fromEntries(params), page: page + 1 })}
                className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedEntry && (
        <ActionDetailModal
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
        />
      )}
    </div>
  );
}
