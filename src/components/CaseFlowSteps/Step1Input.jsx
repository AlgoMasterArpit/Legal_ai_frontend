import React from 'react';
import { AlertCircle, ArrowRight } from "lucide-react";

export default function Step1Input({ 
  description, 
  setDescription, 
  handleGenerateSummary, 
  loading 
}) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.04)] p-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-extrabold text-base text-gray-900 tracking-tight">Case Evidentiary Narrative Document</h2>
      </div>
      
      <div className="relative">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Paste full case descriptions here to trigger AI summary analysis... (Strictly minimum 100 characters required)"
          className="w-full h-80 border border-[#E2E8F0] rounded-xl p-5 text-gray-700 text-sm leading-relaxed focus:outline-none focus:border-[#3B82F6] resize-none bg-[#F8FAFC]/50"
        />
        <div className="absolute bottom-4 right-4 text-xs font-mono font-bold text-slate-400 bg-white px-2.5 py-1 rounded-lg border border-[#E2E8F0] shadow-3xs">
          Characters: {description.length}
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center border-t border-slate-100 pt-6">
        {description.trim().length < 100 && description.trim().length > 0 && (
          <div className="mb-4 flex items-center gap-1.5 text-xs text-amber-600 font-bold bg-amber-50 px-3 py-2 border border-amber-200/60 rounded-xl shadow-2xs">
            <AlertCircle size={14} /> Narrative too brief. Enter at least {100 - description.trim().length} more characters to unlock compiler pipeline.
          </div>
        )}
        <p className="text-xs text-[#64748B] mb-4 text-center leading-relaxed">
          AI will compile a structural summary focusing strictly on legal facts and potential statutory liabilities.
        </p>
        <button
          onClick={handleGenerateSummary}
          disabled={loading || description.trim().length < 100}
          className="bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] hover:opacity-95 disabled:from-slate-200 disabled:to-slate-300 disabled:text-slate-400 text-white font-bold text-xs px-8 py-3.5 rounded-xl transition shadow-md disabled:shadow-none flex items-center gap-2"
        >
          {loading ? "Processing Narrative Matrix..." : "Generate Summary"}
          {!loading && <ArrowRight size={14} />}
        </button>
      </div>
    </div>
  );
}