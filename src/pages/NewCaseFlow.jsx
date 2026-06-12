import { useState } from "react";
import {
  Search,
  Bell,
  FolderOpen,
  Settings,
  LayoutDashboard,
  CheckCircle2,
  FileText,
  Scale,
  Activity,
  ArrowRight,
  Plus,
  Check,
  X,
  RotateCcw,
  Edit3,
  RefreshCw
} from "lucide-react";

import {
  createCase,
  extractCharges,
  finalizeCharges,
  fetchPrecedents,
} from "../Services/caseService";

const FLOW_STEPS = [
  { id: 1, label: "Upload", icon: FileText },
  { id: 2, label: "Summary Approval", icon: CheckCircle2 },
  { id: 3, label: "Section Mapping", icon: Scale },
  { id: 4, label: "Final Review", icon: Activity }
];

export default function NewCaseFlow({ onBack }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [description, setDescription] = useState("");
  const [summary, setSummary] = useState("");
  const [charges, setCharges] = useState([]);
  const [precedents, setPrecedents] = useState([]);
  const [caseId, setCaseId] = useState(null);

  // Manual Entry States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newIpc, setNewIpc] = useState("");
  const [newBns, setNewBns] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newExplanation, setNewExplanation] = useState("");

  const userId = localStorage.getItem("user_id");

  const handleGenerateSummary = async () => {
    if (!description.trim()) return;
    try {
      setLoading(true);
      const data = await createCase(description, userId);
      setCaseId(data.id);
      setSummary(data.llm_summary || data.lawyer_approved_summary || "");
      setStep(2);
    } catch (err) {
      console.error("Generate Summary Network Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveSummary = async () => {
    try {
      setLoading(true);
      const data = await extractCharges(caseId, summary);
      if (!data.draft_charges) {
        console.error("Payload empty for draft charges");
        return;
      }
      // Shuruat mein decision blank rakhenge taaki user Approve/Reject par khud click kar sake
      const formattedCharges = data.draft_charges.map((c) => ({
        ...c,
        is_approved: null, // Reset to null so buttons show up initially
        confidence: c.confidence || 85
      }));
      setCharges(formattedCharges);
      setStep(3);
    } catch (err) {
      console.error("Approve Summary Network Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizeCharges = async () => {
    try {
      setLoading(true);
      const approvedIds = charges.filter((c) => c.is_approved && c.id).map((c) => c.id);
      const rejectedData = charges
        .filter((c) => c.is_approved === false && c.id)
        .map((c) => ({ id: c.id, reason: "Rejected by lawyer" }));

      await finalizeCharges(caseId, approvedIds, rejectedData);
      const precedentData = await fetchPrecedents(caseId);
      
      setPrecedents(precedentData.precedent_cases || []);
      setStep(4);
    } catch (err) {
      console.error("Finalization Workflow Network Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleChargeStatus = (targetIndex, approvalState) => {
    setCharges(prevCharges => 
      prevCharges.map((charge, idx) => 
        idx === targetIndex ? { ...charge, is_approved: approvalState } : charge
      )
    );
  };

  const handleAddManualSection = (e) => {
    e.preventDefault();
    if (!newIpc.trim() || !newExplanation.trim()) return;

    const customRow = {
      ipc_section: newIpc,
      bns_equivalent: newBns || "N/A",
      legal_category: newCategory || "Manual Entry",
      explanation: newExplanation,
      confidence: 100, 
      is_approved: true // Manually added by lawyer is auto-approved
    };

    setCharges((prev) => [...prev, customRow]);
    
    setNewIpc("");
    setNewBns("");
    setNewCategory("");
    setNewExplanation("");
    setIsModalOpen(false);
  };

  return (
    <div className="flex h-screen bg-[#f8f9fc] font-sans text-gray-800 relative">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-[#081f4d] tracking-tight">LegalAI</h1>
          <p className="text-xs text-gray-400 font-medium">Premium LegalTech</p>
        </div>
        <nav className="px-3 flex-1 space-y-1">
          <button onClick={onBack} className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-xl transition font-medium text-sm">
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-xl transition font-medium text-sm">
            <FolderOpen size={18} /> Cases
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-[#eef2ff] text-[#081f4d] rounded-xl font-semibold text-sm">
            <Plus size={18} className="text-[#081f4d]" /> New Case
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-xl transition font-medium text-sm">
            <Settings size={18} /> Settings
          </button>
        </nav>
      </aside>

      {/* Main Viewport Container */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shrink-0">
          <h1 className="text-2xl font-bold text-[#081f4d]">New Case Analysis</h1>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
              <input placeholder="Search precedents..." className="border border-gray-200 rounded-full bg-gray-50 pl-10 pr-4 py-2 text-sm w-64 focus:outline-none focus:border-gray-400 transition" />
            </div>
            <Bell size={18} className="text-gray-400 cursor-pointer hover:text-gray-600 transition" />
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#081f4d] to-[#1e3a8a] text-white flex items-center justify-center text-xs font-bold shadow-sm">
              VS
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          {step > 1 && (
            <div className="max-w-5xl mx-auto mb-8 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between relative">
                {FLOW_STEPS.map((s, index) => {
                  const StepIcon = s.icon;
                  const isCompleted = step > s.id;
                  const isActive = step === s.id;
                  return (
                    <div key={s.id} className="flex flex-col items-center flex-1 relative z-10">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        isCompleted ? "bg-[#081f4d] border-[#081f4d] text-white" :
                        isActive ? "bg-[#eef2ff] border-[#081f4d] text-[#081f4d] font-bold shadow-md scale-105" :
                        "bg-white border-gray-200 text-gray-400"
                      }`}>
                        {isCompleted ? <Check size={18} strokeWidth={3} /> : <StepIcon size={18} />}
                      </div>
                      <span className={`text-xs mt-2 font-semibold tracking-wide ${isActive ? "text-[#081f4d]" : "text-gray-400"}`}>
                        {s.label}
                      </span>
                      {index < FLOW_STEPS.length - 1 && (
                        <div className="absolute left-[calc(50%+1.25rem)] right-[-50%] top-5 h-[2px] bg-gray-100 z-[-1]">
                          <div className="h-full bg-[#081f4d] transition-all duration-500" style={{ width: step > s.id ? '100%' : '0%' }}></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="max-w-5xl mx-auto">
            {/* STEP 1: Input Panel */}
            {step === 1 && (
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-bold text-lg text-gray-900 tracking-tight">Case Description</h2>
                  <div className="flex gap-2">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider border">Civil</span>
                    <span className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider border border-amber-200">Draft</span>
                  </div>
                </div>
                <div className="relative">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Paste the case details, evidence narratives, or witness statements here for AI processing..."
                    className="w-full h-80 border border-gray-200 rounded-xl p-5 text-gray-700 leading-relaxed focus:outline-none focus:border-gray-400 resize-none bg-gray-50/50"
                  />
                  <div className="absolute bottom-4 right-4 text-xs font-mono text-gray-400 bg-white px-2 py-1 rounded border">
                    Characters: {description.length}
                  </div>
                </div>
                <div className="mt-6 flex flex-col items-center border-t border-gray-100 pt-6">
                  <p className="text-xs text-gray-400 mb-4 text-center">
                    AI will generate a structured summary focusing on legal facts and potential liabilities.<br />
                    <span className="font-medium text-gray-400">Analysis and statutory mapping will appear here after generation.</span>
                  </p>
                  <button
                    onClick={handleGenerateSummary}
                    disabled={loading || !description.trim()}
                    className="bg-[#081f4d] hover:bg-[#122e66] disabled:bg-gray-300 text-white font-medium px-8 py-3 rounded-xl transition shadow-sm flex items-center gap-2"
                  >
                    {loading ? "Processing Narrative..." : "Generate Summary"}
                    {!loading && <ArrowRight size={16} />}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Split Panel Comparative Summary Review */}
            {step === 2 && (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-sm p-6 flex flex-col">
                  <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2">
                      <FileText size={18} className="text-gray-400" />
                      <h2 className="font-bold text-gray-800 text-base">Case Description</h2>
                    </div>
                  </div>
                  <div className="text-gray-600 text-xs leading-relaxed whitespace-pre-wrap overflow-auto max-h-[26rem] pr-2">
                    {description}
                  </div>
                </div>

                <div className="lg:col-span-3 bg-[#06163a] text-white rounded-2xl shadow-xl p-6 flex flex-col justify-between border border-[#0d255c]">
                  <div className="flex flex-col flex-1">
                    <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2 text-blue-400 text-xs font-bold tracking-widest uppercase">
                        <Edit3 size={14} /> Edit AI Generated Summary
                      </div>
                      <span className="text-[10px] tracking-wider uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded font-mono font-bold">
                        {loading ? "Regenerating..." : "Interactive View"}
                      </span>
                    </div>

                    <div className="flex-1 flex flex-col mt-2">
                      <textarea
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        disabled={loading}
                        placeholder={loading ? "Regenerating summary from pipeline matrices..." : "Processing core matrix coordinates..."}
                        className="w-full flex-1 min-h-[20rem] bg-white/5 border border-white/10 rounded-xl p-4 text-gray-100 text-sm leading-relaxed focus:outline-none focus:border-blue-500/50 resize-none font-sans disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-white/10">
                    <button onClick={() => setStep(1)} disabled={loading} className="flex items-center justify-center gap-1.5 text-xs border border-white/20 hover:bg-white/5 px-3 py-2.5 rounded-xl font-medium transition text-gray-300 disabled:opacity-50">
                      <RotateCcw size={13} /> Back
                    </button>
                    
                    <button 
                      onClick={handleGenerateSummary} 
                      disabled={loading || !description.trim()}
                      className="flex items-center justify-center gap-1.5 text-xs bg-white/10 border border-white/10 hover:bg-white/20 text-blue-300 px-3 py-2.5 rounded-xl font-semibold transition disabled:opacity-50"
                    >
                      <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> 
                      {loading ? "Loading..." : "Regenerate"}
                    </button>

                    <button
                      onClick={handleApproveSummary}
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-3 py-2.5 rounded-xl transition shadow-lg shadow-blue-900/30 flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {loading ? "Syncing..." : "Approve"}
                      {!loading && <ArrowRight size={13} />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3 & 4: Integrated Legal Section Matrix & Precedents List */}
            {(step === 3 || step === 4) && (
              <div className="space-y-8 animate-fadeIn">
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 font-bold text-gray-900 mb-2 border-b border-gray-50 pb-2">
                    <FileText size={16} className="text-gray-400" />
                    <span>Case Summary Snapshot</span>
                    <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-200 uppercase tracking-wider ml-auto font-bold">Approved</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed whitespace-pre-wrap">{summary}</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-2">
                      <Scale size={18} className="text-[#081f4d]" />
                      <h2 className="font-bold text-gray-900 tracking-tight">Identified Legal Sections</h2>
                    </div>
                    <button 
                      onClick={() => setIsModalOpen(true)}
                      className="border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold px-3 py-1.5 rounded-lg transition shadow-sm flex items-center gap-1 text-gray-700 active:scale-95"
                    >
                      <Plus size={14} /> Manual Entry
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 text-gray-400 uppercase text-[10px] font-bold tracking-wider border-b border-gray-100">
                          <th className="px-6 py-3.5">Section Code</th>
                          <th className="px-6 py-3.5">Legal Category</th>
                          <th className="px-6 py-3.5">Description</th>
                          <th className="px-6 py-3.5">Confidence</th>
                          <th className="px-6 py-3.5 text-right">Decision Context</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-xs">
                        {charges.map((charge, index) => (
                          <tr key={index} className="hover:bg-gray-50/70 transition">
                            <td className="px-6 py-4 font-mono font-bold text-gray-900">
                              <div>{charge.ipc_section}</div>
                              <div className="text-[10px] text-gray-400 font-normal mt-0.5">BNS: {charge.bns_equivalent || "N/A"}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md font-semibold border border-blue-100 tracking-wide">
                                {charge.legal_category || "Statutory Check"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-600 max-w-sm leading-relaxed">
                              {charge.explanation}
                            </td>
                            <td className="px-6 py-4 font-medium whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                  <div className="bg-[#081f4d] h-full rounded-full" style={{ width: `${charge.confidence || 85}%` }}></div>
                                </div>
                                <span className="font-mono text-gray-500 text-[11px]">{charge.confidence || 85}%</span>
                              </div>
                            </td>
                            
                            {/* 👇 TRANSFORMS BUTTONS TO PURE BADGES DYNAMICALLY 👇 */}
                            <td className="px-6 py-4 text-right whitespace-nowrap">
                              {charge.is_approved === true ? (
                                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 px-3 py-1 rounded-md shadow-sm animate-scaleUp">
                                  <Check size={12} strokeWidth={3} /> Approved
                                </span>
                              ) : charge.is_approved === false ? (
                                <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 font-bold border border-rose-200 px-3 py-1 rounded-md shadow-sm animate-scaleUp">
                                  <X size={12} strokeWidth={3} /> Rejected
                                </span>
                              ) : (
                                <div className="inline-flex gap-1.5">
                                  <button
                                    onClick={() => toggleChargeStatus(index, true)}
                                    className="bg-white text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 text-xs font-bold px-2.5 py-1 rounded-md border border-gray-200 transition active:scale-95 flex items-center gap-1"
                                  >
                                    <Check size={12} /> Approve
                                  </button>
                                  <button
                                    onClick={() => toggleChargeStatus(index, false)}
                                    className="bg-white text-gray-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 text-xs font-bold px-2.5 py-1 rounded-md border border-gray-200 transition active:scale-95 flex items-center gap-1"
                                  >
                                    <X size={12} /> Reject
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {step === 3 && (
                    <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-xs">
                      <span className="text-gray-400 italic">Review mapped code matrices prior to fetching citation payloads.</span>
                      <button
                        onClick={handleFinalizeCharges}
                        disabled={loading}
                        className="bg-[#081f4d] hover:bg-[#122e66] text-white font-semibold px-6 py-2.5 rounded-xl transition shadow-sm flex items-center gap-2"
                      >
                        {loading ? "Cross-referencing..." : "Confirm & Continue"}
                        {!loading && <ArrowRight size={14} />}
                      </button>
                    </div>
                  )}
                </div>

                {/* STEP 4 Element Card Deck */}
                {step === 4 && (
                  <div className="space-y-4 border-t border-gray-200 pt-6 animate-slideUp">
                    <div className="flex items-center gap-2 text-gray-900">
                      <FolderOpen size={18} className="text-[#081f4d]" />
                      <h3 className="font-bold text-lg tracking-tight">Precedent Analysis & Similar Cases</h3>
                    </div>
                    
                    {precedents.length === 0 ? (
                      <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center text-sm text-gray-400 font-medium">
                        Searching systems matrix databases... No active citation objects matched yet.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {precedents.map((item) => (
                          <div key={item.id} className="bg-white border border-gray-200 hover:border-gray-300 rounded-xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                            <div className="space-y-2">
                              <div className="flex justify-between items-center text-[10px] font-bold font-mono tracking-wider">
                                <span className="text-gray-400">CASE ID: {item.id ? item.id.slice(0, 10).toUpperCase() : "2024/DL-8042"}</span>
                                <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">98.2% Match</span>
                              </div>
                              <h4 className="font-bold text-gray-900 leading-snug line-clamp-2">{item.title}</h4>
                              <div className="flex gap-4 text-[11px] text-gray-400 font-medium">
                                <span>⚖️ Judgment: Guilty</span>
                                <span>📅 Date: Oct 12, 2023</span>
                              </div>
                            </div>
                            <div className="mt-5 pt-3 border-t border-gray-50 flex justify-end">
                              <a
                                href={item.doc_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition"
                              >
                                View Details <ArrowRight size={12} />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Manual Entry Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 animate-scaleUp">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900 text-sm tracking-tight flex items-center gap-1.5">
                <Scale size={16} className="text-[#081f4d]" /> Add Manual Statutory Section
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition p-1 hover:bg-gray-200/50 rounded-lg">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddManualSection} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-600">IPC Section Code *</label>
                  <input type="text" required placeholder="e.g. IPC Section 420" value={newIpc} onChange={(e) => setNewIpc(e.target.value)} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-gray-400 bg-gray-50/50 font-mono" />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-600">BNS Equivalent</label>
                  <input type="text" placeholder="e.g. BNS Section 318" value={newBns} onChange={(e) => setNewBns(e.target.value)} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-gray-400 bg-gray-50/50 font-mono" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-600">Legal Category</label>
                <input type="text" placeholder="e.g. Corporate Cheating" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-gray-400 bg-gray-50/50" />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-600">Case Offense Description *</label>
                <textarea required rows={4} placeholder="Provide explicit reasons for adding this section..." value={newExplanation} onChange={(e) => setNewExplanation(e.target.value)} className="w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-gray-400 bg-gray-50/50 resize-none leading-relaxed" />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 transition font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-[#081f4d] hover:bg-[#122e66] text-white font-semibold shadow-sm transition">Add to Table</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}