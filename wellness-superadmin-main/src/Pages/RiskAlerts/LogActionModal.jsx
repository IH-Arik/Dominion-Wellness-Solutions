import React, { useState } from 'react';
import { X, Scale, Coffee, MessageSquare } from 'lucide-react';

export default function LogActionModal({ isOpen, onClose }) {
  const [selectedAction, setSelectedAction] = useState(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Log Action</h2>
            <p className="text-sm text-slate-500 mt-1">Record an action taken to address the current risk.</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {/* Risk Info Card */}
          <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-8 mb-8 border border-slate-100">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">TEAM</div>
              <div className="text-sm font-bold text-slate-800">Engineering Alpha Team</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">RISK SIGNAL</div>
              <div className="text-sm font-bold text-slate-800">Recovery deficit detected</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">RISK LEVEL</div>
              <div className="inline-block px-3 py-0.5 bg-rose-100 text-rose-700 text-xs font-bold rounded-full">Elevated</div>
            </div>
          </div>

          {/* Action Selection */}
          <h3 className="text-sm font-bold text-slate-800 mb-3">Select Action <span className="text-rose-500">*</span></h3>
          <div className="grid grid-cols-3 gap-3 mb-6">
            <button 
              onClick={() => setSelectedAction('rebalance')}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center gap-2 transition-all ${
                selectedAction === 'rebalance' 
                ? 'border-teal-600 bg-teal-50 ring-1 ring-teal-600' 
                : 'border-slate-100 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <Scale className={`w-5 h-5 ${selectedAction === 'rebalance' ? 'text-teal-600' : 'text-teal-700'}`} />
              <span className="text-xs font-bold text-slate-700">Rebalance workload</span>
            </button>
            <button 
              onClick={() => setSelectedAction('breaks')}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center gap-2 transition-all ${
                selectedAction === 'breaks' 
                ? 'border-teal-600 bg-teal-50 ring-1 ring-teal-600' 
                : 'border-teal-600 bg-white ring-1 ring-teal-600'
              }`}
            >
              <Coffee className={`w-5 h-5 ${selectedAction === 'breaks' ? 'text-teal-600' : 'text-teal-700'}`} />
              <span className="text-xs font-bold text-slate-700">Encourage recovery<br/>breaks</span>
            </button>
            <button 
              onClick={() => setSelectedAction('checkin')}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center gap-2 transition-all ${
                selectedAction === 'checkin' 
                ? 'border-teal-600 bg-teal-50 ring-1 ring-teal-600' 
                : 'border-slate-100 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <MessageSquare className={`w-5 h-5 ${selectedAction === 'checkin' ? 'text-teal-600' : 'text-teal-700'}`} />
              <span className="text-xs font-bold text-slate-700">Conduct private check-in</span>
            </button>
          </div>

          {/* Custom Action & Notes */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-800 mb-2">Or add custom action</label>
            <input 
              type="text" 
              placeholder="Enter a custom action..." 
              className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">Add Note (optional)</label>
            <textarea 
              placeholder="Add any context or details..." 
              rows={3}
              className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none resize-none"
            ></textarea>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 flex justify-end gap-4 bg-white mt-auto">
          <button onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors">
            Cancel
          </button>
          <button onClick={onClose} className="px-8 py-2.5 bg-[#0b1b36] hover:bg-[#112750] text-white text-sm font-bold rounded-full transition-colors">
            Log Action
          </button>
        </div>

      </div>
    </div>
  );
}
