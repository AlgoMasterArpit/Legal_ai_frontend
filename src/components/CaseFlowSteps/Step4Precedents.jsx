import React from 'react';
import { FolderOpen, ArrowRight } from "lucide-react";

export default function Step4Precedents({ precedents }) {
  return (
    <div className="space-y-4 relative">
      <div className="flex items-center gap-2 text-gray-900">
        <FolderOpen size={18} className="text-[#1E40AF]" />
        <h3 className="font-extrabold text-base tracking-tight">Precedent Analysis & Similar Cases</h3>
      </div>

      {precedents.length === 0 ? (
        <div className="bg-[#F1F5F9]/70 border border-[#E2E8F0] rounded-2xl p-12 text-center text-xs text-slate-400 font-bold shadow-2xs">
          Searching systems matrix databases... No active citation objects matched yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {precedents.map((item) => (
            <div key={item?.id || Math.random()} className="bg-[#F1F5F9]/70 border border-[#E2E8F0] hover:border-slate-300 rounded-xl p-5 shadow-2xs hover:shadow-xs transition flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold font-mono tracking-wider">
                  <span className="text-slate-400">CASE ID: {item?.id ? item.id.slice(0, 10).toUpperCase() : "2024/DL-8042"}</span>
                  <span className="text-[#137333] bg-[#E6F4EA] px-2 py-0.5 rounded-xl border border-[#CEEAD6]">
                    {item?.ai_score != null
                      ? `${Number(item.ai_score).toFixed(1)}% Match`
                      : "N/A"}
                  </span>
                </div>
                <h4 className="font-bold text-[#0F172A] leading-snug text-sm line-clamp-2">{item?.title}</h4>
                <div className="flex gap-4 text-[11px] text-slate-400 font-semibold">
                  <span>⚖️ Judgment: Guilty</span>
                  <span>📅 Date: Oct 12, 2023</span>
                </div>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-200 flex justify-end">
                <a href={item?.doc_url} target="_blank" rel="noreferrer" className="text-xs font-bold text-[#1E40AF] hover:text-blue-700 flex items-center gap-1 transition">
                  View Details <ArrowRight size={12} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}