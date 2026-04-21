import React, { useEffect, useMemo, useState } from "react";
import { Download, ArrowLeft, Bell, Menu, X } from "lucide-react";
import { useLocation, Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../../lib/api";
import { getDashboardPath, getDashboardPrefix } from "../../lib/auth";

const PAGE_CONFIG = {
  "/": {
    title: "Team Performance Dashboard",
    subtitle: "Last updated: 5 minutes ago",
    actions: ["ranges", "team", "bell"],
    tabs: []
  },
  "/dashboard": {
    title: "Team Performance Dashboard",
    subtitle: "Last updated: 5 minutes ago",
    actions: ["ranges", "team", "bell"],
    tabs: []
  },
  "/company-dashboard": {
    title: "Company Dashboard",
    subtitle: "Drill down into a selected organization and team scope.",
    backLink: "/organization",
    actions: ["ranges", "team", "bell"],
    tabs: [],
  },
  "/team-members": {
    title: "Team Performance Dashboard",
    subtitle: "Last updated: 5 minutes ago",
    actions: ["team"],
  },
  "/team-profile": {
    title: "Member Detail Analysis",
    backMode: "history",
    backFallback: "/team-members",
    actions: ["ranges", "bell"],
  },
  "/user-details": {
    title: "User Details",
    backMode: "history",
    backFallback: "/users",
    actions: ["ranges", "bell"],
  },
  "/ai-insights": {
    title: "AI Insights",
    subtitle: "Understand patterns and predict team burnout",
    actions: ["ranges", "team", "export"],
  },
  "/report": {
    title: "Reports",
    subtitle: "Overview of team metrics and performance data",
    actions: ["ranges", "export"],
  },
  "/risk-alerts": {
    title: "Risk & Alerts",
    subtitle: "Monitor and manage team wellness risks",
    actions: ["ranges_full", "team", "export"],
  
  },
  "/action-history": {
    title: "Action History",
    subtitle: "Past interventions and their impacts",
    backLink: "/risk-alerts",
    actions: ["ranges_30d", "team", "export"],
    tabs: []
  },
  "/settings": {
    title: "Settings",
    subtitle: "Manage your account and preferences",
    actions: ["avatar"],
  }
};

const RANGE_LABELS = ["7d", "30d", "90d", "Custom"];

export default function Header({ showDrawer }) {
  const [activeTab, setActiveTab] = useState("");
  const [settingsData, setSettingsData] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isCustomRangeOpen, setIsCustomRangeOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState(
    searchParams.get("start_date") || ""
  );
  const [customEndDate, setCustomEndDate] = useState(
    searchParams.get("end_date") || ""
  );
  const [customRangeError, setCustomRangeError] = useState("");

  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const company = searchParams.get("company") || undefined;
  const department = searchParams.get("department") || undefined;
  const requestedTeam = searchParams.get("team") || undefined;
  const source = searchParams.get("source") || undefined;

  const config = PAGE_CONFIG[pathname];

  useEffect(() => {
    if (config && config.tabs && config.tabs.length > 0) {
      setActiveTab(config.tabs[0]);
    } else {
      setActiveTab("");
    }
  }, [pathname, config]);

  useEffect(() => {
    const shouldLoadSettings = config?.actions?.includes("team");
    if (!shouldLoadSettings) {
      return;
    }

    let ignore = false;
    const fetchSettings = async () => {
      try {
        const response = await api.get(getDashboardPath("settings"), {
          params: {
            company,
            department,
            team: requestedTeam,
          },
        });
        if (!ignore) {
          setSettingsData(response.data.data);
        }
      } catch (error) {
        if (!ignore) {
          setSettingsData(null);
        }
      }
    };

    fetchSettings();
    return () => {
      ignore = true;
    };
  }, [company, config?.actions, department, pathname, requestedTeam]);

  useEffect(() => {
    setCustomStartDate(searchParams.get("start_date") || "");
    setCustomEndDate(searchParams.get("end_date") || "");
  }, [searchParams]);

  const selectedRange =
    searchParams.get("range") ||
    (config?.actions?.includes("ranges_full") ? "7d" : "30d");
  const selectedTeam =
    searchParams.get("team") ||
    settingsData?.scope_configuration?.selected?.team ||
    settingsData?.scope?.team ||
    "";
  const teamOptions = useMemo(() => {
    const configuredTeams =
      settingsData?.scope_configuration?.options?.teams ||
      settingsData?.available_teams ||
      [];
    const selectedScopeTeam = settingsData?.scope_configuration?.selected?.team;
    const scopeTeam = settingsData?.scope?.team;
    return [...new Set([selectedTeam, selectedScopeTeam, scopeTeam, ...configuredTeams].filter(Boolean))];
  }, [selectedTeam, settingsData]);
  const teamSelectOptions = useMemo(
    () => [{ label: "All Teams", value: "" }, ...teamOptions.map((option) => ({ label: option, value: option }))],
    [teamOptions]
  );
  const notificationPath = settingsData?.notification_action?.path || "/risk-alerts";
  const activeRangeLabel = selectedRange === "custom" ? "Custom" : selectedRange;

  const backNavigation = useMemo(() => {
    if (!config) {
      return { mode: "link", target: "/" };
    }

    if (config.backMode === "history") {
      if (pathname === "/user-details") {
        if (source === "company-dashboard" && company) {
          return {
            mode: "history",
            fallback: `/company-dashboard?company=${encodeURIComponent(company)}`,
          };
        }
        if (source === "team-members" || getDashboardPrefix() === "leader") {
          return { mode: "history", fallback: "/team-members" };
        }
        return { mode: "history", fallback: config.backFallback || "/users" };
      }

      if (pathname === "/team-profile") {
        return { mode: "history", fallback: config.backFallback || "/team-members" };
      }

      return { mode: "history", fallback: config.backFallback || "/" };
    }

    return { mode: "link", target: config.backLink || "/" };
  }, [company, config, pathname, source]);

  function updateFilters(nextValues) {
    const next = new URLSearchParams(searchParams);
    Object.entries(nextValues).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    });
    setSearchParams(next);
  }

  function applyPresetRange(rangeValue) {
    updateFilters({
      range: rangeValue,
      start_date: "",
      end_date: "",
      page: 1,
    });
  }

  function openCustomRangeModal() {
    setCustomRangeError("");
    setCustomStartDate(searchParams.get("start_date") || "");
    setCustomEndDate(searchParams.get("end_date") || "");
    setIsCustomRangeOpen(true);
  }

  function applyCustomRange() {
    if (!customStartDate || !customEndDate) {
      setCustomRangeError("Select both start and end dates.");
      return;
    }

    if (customEndDate < customStartDate) {
      setCustomRangeError("End date cannot be earlier than start date.");
      return;
    }

    updateFilters({
      range: "custom",
      start_date: customStartDate,
      end_date: customEndDate,
      page: 1,
    });
    setCustomRangeError("");
    setIsCustomRangeOpen(false);
  }

  function openNotifications() {
    const currentQuery = searchParams.toString();
    navigate(`${notificationPath}${currentQuery ? `?${currentQuery}` : ""}`);
  }

  function goBack() {
    if (backNavigation.mode === "history") {
      if (window.history.length > 1) {
        navigate(-1);
        return;
      }
      navigate(backNavigation.fallback || "/");
      return;
    }

    navigate(backNavigation.target || "/");
  }

  // Hide entirely if path is burnout details (since they have embedded special headers)
  if (pathname === "/dashboard/burnout-recommendations" || pathname === "/dashboard/burnout-risk-details") {
    return null;
  }

  // Fallback for unknown routes
  if (!config) {
    return (
      <header className="flex flex-col gap-4 py-8">
        <h1 className="text-2xl font-bold text-slate-800 capitalize">
          {pathname.replace("/", "").replace("-", " ")}
        </h1>
      </header>
    );
  }

  const { title, subtitle, actions, tabs, backLink } = config;

  // Render Action Items
  const renderActions = () => {
    const actionElements = [];

    actions.forEach(action => {
      if (action.startsWith("ranges")) {
        let ranges = RANGE_LABELS;
        let active = selectedRange;

        if (action === "ranges_7d") {
          ranges = ["7d"];
          active = "7d";
        } else if (action === "ranges_30d") {
          ranges = ["Last 30 Days"];
          active = "Last 30 Days";
        } else if (action === "ranges_full") {
          ranges = RANGE_LABELS;
          active = searchParams.get("range") || "7d";
        }

        actionElements.push(
          <div key={action} className="flex bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
            {ranges.map((t) => (
              <button
                key={t}
                onClick={() => {
                  if (t === "Custom") {
                    openCustomRangeModal();
                    return;
                  }
                  if (t === "Last 30 Days") {
                    return;
                  }
                  applyPresetRange(t);
                }}
                disabled={t === "Last 30 Days"}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                  (active === t || activeRangeLabel === t)
                    ? "bg-[#0b1b36] text-white shadow"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                } ${t === "Last 30 Days" ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                {t}
              </button>
            ))}
          </div>
        );
      }

      if (action === "team") {
        if (teamSelectOptions.length === 0) {
          return;
        }
        actionElements.push(
          <div key="custom-team" className="relative w-full sm:w-auto mt-2 sm:mt-0">
            <select
              value={selectedTeam || ""}
              onChange={(e) => updateFilters({ team: e.target.value, page: 1 })}
              className="w-full sm:w-auto appearance-none bg-white border border-slate-200 text-sm font-bold text-slate-700 px-4 py-2 pr-8 rounded-lg shadow-sm focus:outline-none"
            >
              {teamSelectOptions.map((option) => (
                <option key={option.value || "all"} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        );
      }

      if (action === "bell") {
        actionElements.push(
          <button
            key="bell"
            type="button"
            onClick={openNotifications}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#19b4a3] text-white shadow-sm transition-colors hover:bg-[#119a8b]"
            title="Risk & Alerts"
          >
            <Bell className="h-4 w-4" />
          </button>
        );
      }

      if (action === "export") {
        actionElements.push(
          <button key="export" className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 font-bold text-sm rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4" /> Export Report
          </button>
        );
      }

      if (action === "avatar") {
        actionElements.push(
          <img key="avatar" src="https://i.pravatar.cc/100" className="w-10 h-10 rounded-full border border-slate-200 shadow-sm" alt="avatar" />
        );
      }
    });

    return actionElements;
  };

  return (
    <>
      <header className="flex flex-col gap-4 sm:gap-6 py-4 sm:py-6 mb-2">
      
      {/* Top Row: Title/Subtitle and Configurable Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Mobile Hamburger Menu */}
          <button 
            onClick={showDrawer}
            className="p-2 lg:hidden text-slate-600 hover:text-slate-900 bg-white border border-slate-200 shadow-sm rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          {(backLink || config.backMode) ? (
            backNavigation.mode === "link" ? (
              <Link to={backNavigation.target} className="p-1 sm:p-0 text-slate-500 hover:text-slate-800 transition-colors mt-0.5 sm:mt-1">
                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={goBack}
                className="p-1 sm:p-0 text-slate-500 hover:text-slate-800 transition-colors mt-0.5 sm:mt-1"
              >
                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            )
          ) : null}
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0b1b36] tracking-tight">{title}</h1>
            {subtitle && <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-1">{subtitle}</p>}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto mt-2 md:mt-0">
          {renderActions()}
        </div>

      </div>

      {/* Bottom Row: Dynamic Tabs */}
      {tabs && tabs.length > 0 && (
        <div className="flex items-center gap-6 border-b border-slate-200 pt-2 overflow-x-auto hide-scrollbar whitespace-nowrap">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-bold transition-colors relative flex-shrink-0 ${
                activeTab === tab ? "text-teal-700" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 w-full h-[3px] bg-teal-600 rounded-t-md"></span>
              )}
            </button>
          ))}
        </div>
      )}

      </header>
      {isCustomRangeOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-[#0b1b36]">Custom Date Range</h2>
                <p className="mt-1 text-sm text-slate-500">Choose a start and end date to filter the dashboard.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomRangeOpen(false)}
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold text-slate-600">
                Start Date
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(event) => setCustomStartDate(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                />
              </label>
              <label className="text-sm font-semibold text-slate-600">
                End Date
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(event) => setCustomEndDate(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                />
              </label>
            </div>

            {customRangeError ? (
              <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
                {customRangeError}
              </p>
            ) : null}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsCustomRangeOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applyCustomRange}
                className="rounded-xl bg-[#0b1b36] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#112750]"
              >
                Apply Range
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
