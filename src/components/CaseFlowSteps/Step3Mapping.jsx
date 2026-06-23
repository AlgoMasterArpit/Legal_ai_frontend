import React from 'react';
import { FileText, Scale, CheckCircle, XCircle, ArrowLeftRight, Plus, Check, X, AlertCircle, ArrowRight } from "lucide-react";

export default function Step3Mapping({
  summary,
  charges,
  approvedChargesCount,
  rejectedChargesCount,
  pendingChargesCount,
  activeHoverModal,
  setActiveHoverModal,
  toggleChargeStatus,
  setIsModalOpen,
  handleFinalizeCharges,
  loading,
  allChargesEvaluated
}) {
  return (
    <div className="space-y-8 relative">
      <div className="bg-[#F1F5F9]/70 border border-[#E2E8F0] rounded-2xl p-6 shadow-sm shadow-slate-100 backdrop-blur-xs">
        <div className="flex items-center gap-2 font-extrabold text-sm text-[#0F172A] mb-2 border-b border-slate-200/60 pb-2.5">
          <FileText size={15} className="text-[#1E40AF]" />
          <span>Case Summary Snapshot</span>
          <span className="text-[10px] bg-emerald-100 text-[#137333] px-2.5 py-1 rounded-xl border border-[#CEEAD6] uppercase tracking-wider ml-auto font-black">Approved Node</span>
        </div>
        <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">{summary}</p>
      </div>

      <div className="bg-[#F1F5F9]/70 border border-[#E2E8F0] rounded-2xl shadow-sm p-1 backdrop-blur-xs relative">
        <div className="p-5 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white rounded-t-xl border-b border-[#E2E8F0]">
          <div className="flex items-center gap-2">
            <Scale size={18} className="text-[#1E40AF]" />
            <h2 className="font-extrabold text-[#0F172A] text-sm tracking-tight">Identified Legal Sections Matrix</h2>
          </div>

          <div className="flex items-center gap-2.5 text-xs font-bold relative w-full md:w-auto justify-end">
            <div 
              onMouseEnter={() => setActiveHoverModal('approved')}
              onMouseLeave={() => setActiveHoverModal(null)}
              className="px-3 py-1.5 bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6] rounded-xl flex items-center gap-1 cursor-pointer shadow-3xs relative group z-30"
            >
              <CheckCircle size={13} /> {approvedChargesCount} Approved
              
              {activeHoverModal === 'approved' && approvedChargesCount > 0 && (
                <div className="absolute right-0 top-8 w-72 bg-white border border-[#E2E8F0] rounded-xl p-3 shadow-xl text-left text-slate-700 pointer-events-auto z-50">
                  <h4 className="font-extrabold text-[11px] text-[#137333] uppercase tracking-wider mb-2 border-b pb-1 flex items-center justify-between">
                    <span>Approved Elements Queue</span>
                  </h4>
                  <ul className="space-y-1 max-h-40 overflow-y-auto">
                    {Array.isArray(charges) && charges.map((c, i) => c?.is_approved === true ? (
                      <li key={i} className="bg-slate-50 p-1.5 rounded border border-slate-100 flex items-center justify-between gap-2 text-[10px] font-medium font-mono">
                        <span className="truncate text-slate-800">{c?.ipc_section}</span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); toggleChargeStatus(c.ipc_section, null); }}
                          className="px-1.5 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded border border-rose-200/60 flex items-center gap-0.5 transition font-sans text-[9px]"
                        >
                          <ArrowLeftRight size={10} /> Reset
                        </button>
                      </li>
                    ) : null)}
                  </ul>
                </div>
              )}
            </div>

            <div 
              onMouseEnter={() => setActiveHoverModal('rejected')}
              onMouseLeave={() => setActiveHoverModal(null)}
              className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl flex items-center gap-1 cursor-pointer shadow-3xs relative group z-30"
            >
              <XCircle size={13} /> {rejectedChargesCount} Rejected
              
              {activeHoverModal === 'rejected' && rejectedChargesCount > 0 && (
                <div className="absolute right-0 top-8 w-72 bg-white border border-[#E2E8F0] rounded-xl p-3 shadow-xl text-left text-slate-700 pointer-events-auto z-50">
                  <h4 className="font-extrabold text-[11px] text-rose-700 uppercase tracking-wider mb-2 border-b pb-1 flex items-center justify-between">
                    <span>Rejected Elements Queue</span>
                  </h4>
                  <ul className="space-y-1 max-h-40 overflow-y-auto">
                    {Array.isArray(charges) && charges.map((c, i) => c?.is_approved === false ? (
                      <li key={i} className="bg-slate-50 p-1.5 rounded border border-slate-100 flex items-center justify-between gap-2 text-[10px] font-medium font-mono">
                        <div className="flex flex-col truncate w-32">
                          <span className="truncate text-slate-800">{c?.ipc_section}</span>
                          <span className="truncate text-[8px] text-slate-500">{c?.reason}</span>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); toggleChargeStatus(c.ipc_section, null); }}
                          className="px-1.5 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded border border-emerald-200/60 flex items-center gap-0.5 transition font-sans text-[9px]"
                        >
                          <ArrowLeftRight size={10} /> Reset
                        </button>
                      </li>
                    ) : null)}
                  </ul>
                </div>
              )}
            </div>

            <div className="h-4 w-px bg-slate-200 hidden md:block mx-1" />

            <button 
              onClick={() => setIsModalOpen(true)}
              className="border border-[#E2E8F0] bg-white hover:bg-slate-50 text-xs font-bold px-3 py-1.5 rounded-xl transition shadow-2xs flex items-center gap-1 text-[#64748B] active:scale-95"
            >
              <Plus size={14} /> Manual Entry
            </button>
          </div>
        </div>

        <div className="overflow-x-auto bg-white rounded-b-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] text-[#64748B] uppercase text-[10px] font-bold tracking-wider border-b border-[#E2E8F0]">
                <th className="px-6 py-4">Section Code</th>
                <th className="px-6 py-4">Legal Category</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Confidence</th>
                <th className="px-6 py-4 text-right">Decision Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs bg-white">
              {charges.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-[#64748B] font-bold bg-slate-50/40 italic">
                    ⏳ Extracting and formulating statutory matrix data columns...
                  </td>
                </tr>
              ) : (
                charges.map((charge, realIdx) => {
                  return (
                    <tr key={realIdx} className="hover:bg-[#F8FAFC] transition-all duration-200">
                      <td className="px-6 py-4.5 font-mono font-bold text-gray-900">
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-100 border border-slate-200">{charge.ipc_section}</span>
                        <div className="text-[10px] text-slate-400 font-semibold mt-1.5 pl-0.5">BNS: {charge.bns_section || charge.bns_equivalent || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4.5">
                      <span className="inline-flex items-center justify-center bg-[#DBEAFE] text-[#1D4ED8] px-3 py-1 text-[11px] rounded-xl font-bold border border-[#BFDBFE] tracking-wide whitespace-nowrap">
                        {charge.legal_category || "Statutory Check"}
                      </span>
                    </td>
                      <td className="px-6 py-4.5 text-slate-600 max-w-sm leading-relaxed font-medium">
                        {charge.explanation || charge.reason}
                      </td>
                      <td className="px-6 py-4.5 font-bold whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full" style={{ width: `${charge?.confidence || 85}%` }}></div>
                          </div>
                          <span className="font-mono text-slate-500 text-[11px]">{charge?.confidence || 85}%</span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4.5 text-right whitespace-nowrap">
                        {charge.is_approved === true ? (
                          <span className="text-xs px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold inline-flex items-center gap-1 cursor-pointer" onClick={() => toggleChargeStatus(charge.ipc_section, null)}>
                            <CheckCircle size={12} /> Approved
                          </span>
                        ) : charge.is_approved === false ? (
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-xs px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-bold inline-flex items-center gap-1 cursor-pointer" onClick={() => toggleChargeStatus(charge.ipc_section, null)}>
                              <XCircle size={12} /> Rejected
                            </span>
                            {charge.reason && <span className="text-[9px] text-rose-500 max-w-[120px] truncate" title={charge.reason}>Reason: {charge.reason}</span>}
                          </div>
                        ) : (
                          <div className="inline-flex gap-1.5">
                            <button
                              onClick={() => toggleChargeStatus(charge.ipc_section, true)}
                              className="bg-white text-[#64748B] hover:text-[#137333] hover:bg-[#E6F4EA] hover:border-[#CEEAD6] text-xs font-bold px-2.5 py-1.5 rounded-xl border border-slate-200 transition active:scale-95 flex items-center gap-1 shadow-3xs"
                            >
                              <Check size={12} /> Approve
                            </button>
                            <button
                              onClick={() => toggleChargeStatus(charge.ipc_section, false)}
                              className="bg-white text-[#64748B] hover:text-rose-700 hover:bg-rose-50 hover:border-rose-200 text-xs font-bold px-2.5 py-1.5 rounded-xl border border-slate-200 transition active:scale-95 flex items-center gap-1 shadow-3xs"
                            >
                              <X size={12} /> Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-5 bg-[#F8FAFC] border-t border-[#E2E8F0] flex justify-between items-center text-xs font-bold">
          {pendingChargesCount > 0 ? (
            <span className="text-amber-600 flex items-center gap-1 bg-amber-50 border border-amber-200/50 px-3 py-1.5 rounded-xl animate-pulse">
              <AlertCircle size={13} /> Gating Error: Review remaining {pendingChargesCount} identified statutory nodes to unlock confirmation.
            </span>
          ) : (
            <span className="text-[#137333] flex items-center gap-1 bg-[#E6F4EA] border border-[#CEEAD6] px-3 py-1.5 rounded-xl">
              <CheckCircle size={13} /> Complete structure audit cleared. Ready to finalize.
            </span>
          )}

          <button
            onClick={handleFinalizeCharges}
            disabled={loading || !allChargesEvaluated}
            className="bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] disabled:from-slate-100 disabled:to-slate-200 disabled:text-slate-400 text-white font-bold px-6 py-2.5 rounded-xl transition shadow-md disabled:shadow-none flex items-center gap-2"
          >
            {loading ? "Cross-referencing..." : "Confirm & Continue"}
            {!loading && <ArrowRight size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}