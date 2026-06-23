import React from 'react';
import { FileText, Activity, Edit3, RotateCcw, RefreshCw, ArrowRight } from "lucide-react";

export default function Step2Summary({
  description,
  summary,
  setSummary,
  isEditingSummary,
  setIsEditingSummary,
  loading,
  setStep,
  handleGenerateSummary,
  handleApproveSummary
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-2xl shadow-2xs p-6 flex flex-col">
        <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-slate-400" />
            <h2 className="font-extrabold text-slate-800 text-sm tracking-tight">Case Description</h2>
          </div>
        </div>
        <div className="text-slate-600 text-xs leading-relaxed whitespace-pre-wrap overflow-auto max-h-[26rem] pr-2">
          {description}
        </div>
      </div>

      <div className="lg:col-span-3 bg-[#0F172A] text-white rounded-2xl shadow-xl p-6 flex flex-col justify-between border border-slate-800">
        <div className="flex flex-col flex-1">
          <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-blue-400 text-xs font-bold tracking-wider uppercase">
              <Activity size={14} /> AI Generated Summary
            </div>

            <button
              onClick={() => setIsEditingSummary(!isEditingSummary)}
              disabled={loading}
              className="bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-md shadow-blue-900/30 flex items-center gap-1.5 hover:opacity-95 active:scale-95 border border-blue-400/20"
            >
              <Edit3 size={13} /> {isEditingSummary ? "Viewing Frame Mode" : "Edit Summary Layout"}
            </button>
          </div>

          <div className="flex-1 flex flex-col mt-2">
            {isEditingSummary ? (
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                disabled={loading}
                className="w-full flex-1 min-h-[20rem] bg-white/5 border border-blue-500/30 rounded-xl p-4 text-slate-100 text-sm leading-relaxed focus:outline-none resize-none font-sans disabled:opacity-50"
              />
            ) : (
              <div className="w-full flex-1 min-h-[20rem] bg-slate-900/40 border border-slate-800/40 rounded-xl p-4 text-slate-300 text-sm leading-relaxed overflow-auto font-sans max-h-[22rem] pr-2 whitespace-pre-wrap select-text">
                {summary}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-slate-800">
          <button onClick={() => setStep(1)} disabled={loading} className="flex items-center justify-center gap-1.5 text-xs border border-slate-800 hover:bg-white/5 px-3 py-2.5 rounded-xl font-bold transition text-slate-400">
            <RotateCcw size={13} /> Back
          </button>
          <button onClick={handleGenerateSummary} disabled={loading} className="flex items-center justify-center gap-1.5 text-xs bg-white/5 border border-slate-800 hover:bg-white/10 text-blue-400 px-3 py-2.5 rounded-xl font-bold transition">
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Regenerate
          </button>
          
          <button 
            onClick={handleApproveSummary} 
            disabled={loading} 
            className="bg-[#2563EB] hover:bg-blue-500 text-white font-bold text-xs px-3 py-2.5 rounded-xl transition shadow-lg flex items-center justify-center gap-1.5 disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...
              </>
            ) : (
              <>Sync Approve <ArrowRight size={13} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}