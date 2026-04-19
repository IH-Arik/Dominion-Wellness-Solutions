import React, { useEffect, useMemo, useState } from "react";
import { Download, ArrowLeft, Menu } from "lucide-react";
import { useLocation, Link, useSearchParams } from "react-router-dom";
import api from "../../lib/api";
import { getDashboardPath } from "../../lib/auth";

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
  "/team-members": {
    title: "Team Performance Dashboard",
    subtitle: "Last updated: 5 minutes ago",
    actions: ["team"],
  },
  "/team-profile": {
    title: "Member Detail Analysis",
    backLink: "/team-members",
    actions: [],
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

  const location = useLocation();
  const pathname = location.pathname;

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
        const response = await api.get(getDashboardPath("settings"));
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
  }, [config?.actions, pathname]);

  const selectedRange = searchParams.get("range") || "30d";
  const selectedTeam =
    searchParams.get("team") ||
    settingsData?.scope_configuration?.selected?.team ||
    settingsData?.scope?.team ||
    "";
  const teamOptions = useMemo(() => {
    const configuredTeams = settingsData?.scope_configuration?.options?.teams || [];
    const selectedScopeTeam = settingsData?.scope_configuration?.selected?.team;
    const scopeTeam = settingsData?.scope?.team;
    return [...new Set([selectedTeam, selectedScopeTeam, scopeTeam, ...configuredTeams].filter(Boolean))];
  }, [selectedTeam, settingsData]);

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
                  if (t === "Custom" || t === "Last 30 Days") {
                    return;
                  }
                  updateFilters({ range: t, page: 1 });
                }}
                disabled={t === "Custom"}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                  (active === t || selectedRange === t)
                    ? "bg-[#0b1b36] text-white shadow"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                } ${t === "Custom" ? "opacity-60 cursor-not-allowed" : ""}`}
                title={t === "Custom" ? "Custom date range is not available yet." : undefined}
              >
                {t}
              </button>
            ))}
          </div>
        );
      }

      if (action === "team") {
        if (teamOptions.length === 0) {
          return;
        }
        actionElements.push(
          <div key="custom-team" className="relative w-full sm:w-auto mt-2 sm:mt-0">
            <select
              value={selectedTeam}
              onChange={(e) => updateFilters({ team: e.target.value, page: 1 })}
              className="w-full sm:w-auto appearance-none bg-white border border-slate-200 text-sm font-bold text-slate-700 px-4 py-2 pr-8 rounded-lg shadow-sm focus:outline-none"
            >
              {teamOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
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
          
          {backLink && (
            <Link to={backLink} className="p-1 sm:p-0 text-slate-500 hover:text-slate-800 transition-colors mt-0.5 sm:mt-1">
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </Link>
          )}
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
  );
}
