import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles, Moon, Users, Heart, Clock, Info } from "lucide-react";
import api from "../../lib/api";
import { getDashboardPath } from "../../lib/auth";

const iconMap = {
  moon: <Moon className="w-5 h-5 text-indigo-600" />,
  users: <Users className="w-5 h-5 text-emerald-600" />,
  heart: <Heart className="w-5 h-5 text-teal-500" />,
  clock: <Clock className="w-5 h-5 text-amber-500" />,
};

export default function BurnoutRecommendations() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const response = await api.get(getDashboardPath("burnout-recommendations"));
        setData(response.data.data);
      } catch (err) {
        console.error("Error fetching recommendations:", err);
        setError("Failed to load recommendations.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen pt-20">
        <div className="text-lg font-medium text-slate-600">Loading Recommendations...</div>
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

  return (
    <div className="min-h-screen mt-20 p-6 bg-[#f9fafb] font-sans text-slate-800" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/dashboard" className="text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-2xl font-extrabold text-[#0b1b36] tracking-tight">Burnout Recommendations</h1>
      </div>

      {/* Priority Focus */}
      <div className="bg-[#f0fdfaf0] border-l-4 border-l-teal-600 rounded-lg p-6 mb-8 flex items-start gap-4">
        <div className="bg-teal-600 rounded-md p-2 mt-0.5 shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-[#0b1b36] text-sm mb-1">{data.priority_focus?.title || 'Priority Focus'}</h2>
          <p className="text-slate-600 font-medium text-sm leading-relaxed max-w-4xl">
            {data.priority_focus?.summary}
          </p>
        </div>
      </div>

      {/* Grid of Recommendation Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {data.sections?.map((section, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              {iconMap[section.key] || <Sparkles className="w-5 h-5 text-indigo-600" />}
              <h3 className="font-bold text-[#0b1b36] text-sm">{section.title}</h3>
            </div>
            <ul className="space-y-4">
              {section.items?.map((item, iIdx) => (
                <li key={iIdx} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-2 shrink-0"></span>
                  <span className="text-slate-600 text-sm font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium max-w-5xl">
        <Info className="w-4 h-4 shrink-0" />
        <p>{data.footnote || 'These recommendations are guidance to support team wellbeing.'}</p>
      </div>

    </div>
  );
}
