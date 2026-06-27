import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  FolderOpen,
  Search,
  Settings,
  Bell,
  Filter,
  Calendar,
  Layers,
  ArrowRight,
  X,
  FileText,
  Scale
} from "lucide-react";

export default function Dashboard({ onCreateCase, onResumeCase }) {
  const [search, setSearch] = useState("");
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchCases = async (searchTerm = "") => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("user_id");
      let url = `${BASE_URL}/api/v1/cases?user_id=${userId}`;

      if (searchTerm.trim()) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch cases");
      }

      const data = await response.json();
      setCases(data);
    } catch (err) {
      console.error("Fetch Cases Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("legalai_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_email");
    sessionStorage.clear();
    window.location.reload();
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-[#0F172A] overflow-hidden">
      
      {/* Sidebar Layout */}
      <aside className="w-64 bg-[#0F172A] flex flex-col shrink-0 z-10 shadow-[4px_0_24px_rgba(15,23,42,0.15)]">
        <div className="p-6 bg-gradient-to-br from-[#0F172A] to-[#1E3A8A] border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600/20 border border-blue-500/30 rounded-xl flex items-center justify-center text-blue-400">
              <Scale size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white leading-none">
                Legal<span className="text-blue-500">AI</span>
              </h1>
              <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mt-1">Enterprise Node</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-1">
            <li className="bg-[#2563EB] text-white rounded-xl shadow-md shadow-blue-900/20">
              <button className="w-full flex items-center gap-3 px-4 py-3.5 text-left font-bold text-sm tracking-wide">
                <LayoutDashboard size={18} strokeWidth={2.5} /> Dashboard
              </button>
            </li>
            <li>
              <button className="w-full flex items-center gap-3 px-4 py-3.5 text-[#CBD5E1] hover:text-white hover:bg-slate-800/50 rounded-xl text-left font-semibold text-sm transition-all duration-150 group">
                <FolderOpen size={18} className="text-slate-400 group-hover:text-white" /> Cases
              </button>
            </li>
            <li>
              <button className="w-full flex items-center gap-3 px-4 py-3.5 text-[#CBD5E1] hover:text-white hover:bg-slate-800/50 rounded-xl text-left font-semibold text-sm transition-all duration-150 group">
                <Settings size={18} className="text-slate-400 group-hover:text-white" /> Settings
              </button>
            </li>
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-800/60 bg-slate-950/20">
          <button onClick={handleLogout} className="w-full text-center text-xs font-bold tracking-wider uppercase text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 border border-transparent hover:border-rose-900/30 px-4 py-3 rounded-xl transition-all duration-200">
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Container Layer */}
      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 p-8 lg:p-12 overflow-auto transition-all duration-300">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/60 pb-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-slate-900">Welcome Back</h1>
              <p className="text-sm font-semibold text-[#64748B] mt-1">Manage, trace, and audit your deep compliance legal cases.</p>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
              <div className="p-2.5 bg-white border border-[#E2E8F0] rounded-xl cursor-pointer hover:bg-slate-50 transition relative shadow-sm">
                <Bell size={18} className="text-[#64748B]" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white" />
              </div>
              <button onClick={onCreateCase} className="bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] text-white px-5 py-3 rounded-xl font-bold text-sm hover:opacity-95 transition-all duration-200 shadow-[0_4px_14px_rgba(30,64,175,0.2)] flex items-center gap-2">
                <span>+</span> Create New Case
              </button>
            </div>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-2xl mt-8 shadow-[0_4px_20px_rgba(15,23,42,0.05)] overflow-hidden p-1">
            <div className="p-5 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white rounded-t-xl">
              <div>
                <h2 className="text-base font-extrabold text-[#0F172A] flex items-center gap-2 tracking-tight">
                  <Layers size={18} className="text-[#1E40AF]" /> Recent Analysis Logs
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">Real-time dynamic legal section tracking models</p>
              </div>
              <div className="flex gap-2.5 w-full md:w-auto">
                <div className="relative flex-1 md:flex-none">
                  <Search size={15} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    value={search}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSearch(value);
                      fetchCases(value);
                    }}
                    placeholder="Search case indexes..."
                    className="pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl w-full md:w-64 text-sm font-medium focus:outline-none focus:bg-white focus:border-[#3B82F6] transition-all duration-150 placeholder-slate-400 text-[#0F172A]"
                  />
                </div>
                <button className="border border-[#E2E8F0] rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs font-bold text-[#64748B] bg-white hover:bg-slate-50 transition shadow-xs">
                  <Filter size={14} /> Filters
                </button>
              </div>
            </div>

            <div className="overflow-x-auto bg-white rounded-b-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] text-xs font-bold tracking-wider text-[#64748B] uppercase border-b border-[#E2E8F0]">
                    <th className="px-6 py-4.5">Case Identifier</th>
                    <th className="px-6 py-4.5">Case Title context</th>
                    <th className="px-6 py-4.5">Analysis Date</th>
                    <th className="px-6 py-4.5">Status Ring</th>
                    <th className="px-6 py-4.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-100 bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="text-center py-16 text-[#64748B] font-semibold bg-white">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-[#1E40AF] border-t-transparent rounded-full animate-spin" /> Syncing Cases...
                        </div>
                      </td>
                    </tr>
                  ) : cases.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-16 text-[#64748B] font-semibold bg-white">No Records Discovered</td>
                    </tr>
                  ) : (
                    cases.map((item) => (
                      <tr
                        key={item.id}
                        className={`transition-all duration-150 group cursor-pointer border-b border-slate-100 last:border-0 ${
                          selectedCase?.id === item.id ? "bg-blue-50/50" : "bg-white hover:bg-[#F8FAFC]"
                        }`}
                        onClick={() => setSelectedCase(item)}
                      >
                        <td className="px-6 py-4.5 whitespace-nowrap">
                          <span className="font-mono text-xs font-bold text-[#64748B] bg-slate-100 group-hover:bg-white px-2 py-1 rounded-md tracking-wider border border-slate-200 shadow-2xs">
                            {item.id.slice(0, 8).toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4.5">
                          <span className="font-bold text-[#0F172A] group-hover:text-[#1E40AF] text-sm block max-w-sm truncate">
                            {item.title || "Untitled Processing Narrative"}
                          </span>
                        </td>
                        <td className="px-6 py-4.5 whitespace-nowrap text-[#64748B] font-medium text-xs">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={13} className="text-slate-400" />
                            {new Date(item.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                          </div>
                        </td>
                        <td className="px-6 py-4.5 whitespace-nowrap">
                          {/* DYNAMIC PIPELINE STATUS RENDERING ENGINE */}
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide border capitalize ${
                              item.status === "completed"
                                ? "bg-[#E6F4EA] text-[#137333] border-[#CEEAD6]"
                                : item.status === "pending_charge_review" || item.status === "pending_section_mapping"
                                ? "bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]"
                                : "bg-[#DBEAFE] text-[#1D4ED8] border-[#BFDBFE]"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              item.status === "completed" 
                                ? "bg-[#137333]" 
                                : item.status === "pending_charge_review" || item.status === "pending_section_mapping"
                                ? "bg-[#D97706]" 
                                : "bg-[#1D4ED8]"
                            }`} />
                            {item.status.replaceAll("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4.5 whitespace-nowrap text-right">
                          {item.status === "completed" ? (
                            /* COMPLETED WORKFLOW: REDIRECTS TO PRECEDENTS STEP 4 */
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onResumeCase) onResumeCase({ id: item.id, status: item.status });
                              }}
                              className="inline-flex items-center gap-1 text-xs font-extrabold bg-[#0F172A] text-white px-3 py-1.5 rounded-xl hover:opacity-95 transition-all"
                            >
                              Inspect 🔍
                            </button>
                          ) : (
                            /* PENDING WORKFLOW: PREMIUM ORANGE GRADIENT TRACER ACTION BUTTON */
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onResumeCase) onResumeCase({ id: item.id, status: item.status });
                              }}
                              className="inline-flex items-center gap-1 text-xs font-extrabold bg-gradient-to-r from-amber-500 to-orange-600 text-white border border-transparent px-3 py-1.5 rounded-xl shadow-md shadow-orange-700/10 hover:opacity-95 transform active:scale-95 transition-all"
                            >
                              Resume ⚡
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center p-5 rounded-b-xl border-t border-[#E2E8F0] bg-[#F8FAFC] text-xs font-bold text-[#64748B]">
              <button className="hover:text-[#1E40AF]">Previous</button>
              <span className="bg-white border border-[#E2E8F0] px-3 py-1.5 rounded-lg shadow-2xs">Total Count Matrix: {cases.length}</span>
              <button className="hover:text-[#1E40AF]">Next</button>
            </div>
          </div>
        </main>

        {/* Sliding Context Summary Sheet Drawer */}
        {selectedCase && (
          <aside className="w-[450px] bg-white border-l border-[#E2E8F0] shadow-[-8px_0_24px_rgba(15,23,42,0.04)] flex flex-col h-full animate-in slide-in-from-right duration-200 shrink-0">
            <div className="p-6 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
              <div className="flex items-center gap-2">
                <Scale size={18} className="text-[#1E40AF]" />
                <h3 className="font-extrabold text-[#0F172A] text-sm tracking-tight">Audit Intelligence Inspector</h3>
              </div>
              <button 
                onClick={() => setSelectedCase(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 p-6 overflow-auto space-y-6">
              <div>
                <span className="font-mono text-xs font-bold text-[#1D4ED8] bg-[#DBEAFE] border border-[#BFDBFE] px-2 py-1 rounded">
                  {selectedCase.id.toUpperCase()}
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-3 leading-snug tracking-tight">
                  {selectedCase.title || "Processing Narrative Block"}
                </h2>
              </div>

              <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0] space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Analysis State</span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold tracking-wide border capitalize ${
                    selectedCase.status === "completed"
                      ? "bg-[#E6F4EA] text-[#137333] border-[#CEEAD6]"
                      : selectedCase.status === "pending_charge_review" || selectedCase.status === "pending_section_mapping"
                      ? "bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]"
                      : "bg-[#DBEAFE] text-[#1D4ED8] border-[#BFDBFE]"
                  }`}>
                    {selectedCase.status.replaceAll("_", " ")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Discovered On</span>
                  <span className="text-xs font-semibold text-slate-700">{new Date(selectedCase.created_at).toLocaleString()}</span>
                </div>
              </div>

              {/* Pipeline Status Checklist Checkpoints */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-2">
                <h4 className="text-[10px] font-black tracking-widest text-[#64748B] uppercase">Pipeline Checkpoints Status</h4>
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-500">1. Fact Compilation Matrix</span>
                    <span className="text-emerald-600">✓ Complete</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-500">2. Legal Summary Approval</span>
                    <span className={selectedCase.status !== "pending_summary_approval" ? "text-emerald-600" : "text-amber-500 animate-pulse"}>
                      {selectedCase.status !== "pending_summary_approval" ? "✓ Verified" : "⏳ Pending Action"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-500">3. Statutory Section Mapping</span>
                    <span className={selectedCase.status === "completed" ? "text-emerald-600" : (selectedCase.status === "pending_charge_review" || selectedCase.status === "pending_section_mapping" ? "text-amber-500 animate-pulse" : "text-slate-400")}>
                      {selectedCase.status === "completed" ? "✓ Verified" : (selectedCase.status === "pending_charge_review" || selectedCase.status === "pending_section_mapping" ? "⏳ Pending Review" : "⚬ Gated")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wider flex items-center gap-1.5">
                  <FileText size={14} className="text-slate-400" /> Case Summary
                </h4>
                <div className="text-xs leading-relaxed text-slate-600 bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs font-medium whitespace-pre-wrap">
                  {selectedCase.llm_summary || selectedCase.lawyer_approved_summary || "No operational summary formulated for this context node yet."}
                </div>
              </div>

              {/* Direct Drawer bottom workflow entrance handler */}
              <button
                onClick={() => onResumeCase && onResumeCase({ id: selectedCase.id, status: selectedCase.status })}
                className="w-full bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl transition flex items-center justify-center gap-1.5"
              >
                Open Workflow Execution Pipeline <ArrowRight size={13} />
              </button>

            </div>
          </aside>
        )}

      </div>
    </div>
  );
}