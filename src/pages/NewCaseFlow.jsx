import { useState, useEffect } from "react";
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
  RefreshCw,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Eye,
  CheckCircle,
  XCircle,
  ArrowLeftRight
} from "lucide-react";

import {
  createCase,
  extractCharges,
  finalizeCharges,
  fetchPrecedents,
  regenerateSummary
} from "../Services/caseService";

const FLOW_STEPS = [
  { id: 1, label: "Case Input", icon: FileText },
  { id: 2, label: "Summary Review", icon: CheckCircle2 },
  { id: 3, label: "Section Mapping", icon: Scale },
  { id: 4, label: "Final Precedents", icon: Activity }
];

export default function NewCaseFlow({ onBack }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [description, setDescription] = useState("");
  const [summary, setSummary] = useState("");
  const [charges, setCharges] = useState([]);
  const [precedents, setPrecedents] = useState([]);
  const [caseId, setCaseId] = useState(null);

  // Layout UI State handlers
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [isRawDocOpen, setIsRawDocOpen] = useState(false);
  const [activeHoverModal, setActiveHoverModal] = useState(null); // 'approved' | 'rejected' | null

  // Dynamic User Initials State
  const [userInitials, setUserInitials] = useState("AI");

  // Manual Entry States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newIpc, setNewIpc] = useState("");
  const [newBns, setNewBns] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newExplanation, setNewExplanation] = useState("");

  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    const fullName = localStorage.getItem("user_name") || "";
    if (fullName.trim()) {
      const parts = fullName.split(" ").filter(Boolean);
      if (parts.length >= 2) {
        setUserInitials((parts[0][0] + parts[1][0]).toUpperCase());
      } else if (parts.length === 1) {
        setUserInitials(parts[0].slice(0, 2).toUpperCase());
      }
    } else {
      const email = localStorage.getItem("user_email") || "AI";
      setUserInitials(email.slice(0, 2).toUpperCase());
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("legalai_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_email");
    sessionStorage.clear();
    window.location.reload();
  };

  // Computed state to check if all charges have been explicitly approved or rejected
  const allChargesEvaluated = charges.length > 0 && charges.every((charge) => charge.is_approved !== null);

  const handleGenerateSummary = async () => {
    if (description.trim().length < 100) return;
    try {
      setLoading(true);
      let data;
      // 🔄 If caseId exists, we are REGENERATING. Do not create a new case.
      if (caseId) {
        // You will need to import 'regenerateSummary' at the top of your file
        data = await regenerateSummary(caseId, description);
      } else {
        // 🆕 First time generating, create a new case
        data = await createCase(description, userId);
        setCaseId(data.id);
      }
      setSummary(data.llm_summary || data.lawyer_approved_summary || "");
      setIsEditingSummary(false);
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
      if (!data.draft_charges) return;
      const formattedCharges = data.draft_charges.map((c) => ({
        ...c,
        // Map exactly to your DB column names
        bns_section: c.bns_section || "N/A",
        reason: c.reason || "No explanation provided",
        is_approved: null,
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
    if (!allChargesEvaluated) return;

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
      bns_section: newBns || "N/A",
      legal_category: newCategory || "Manual Entry",
      reason: newExplanation,
      confidence: 100, 
      is_approved: true
    };

    setCharges((prev) => [...prev, customRow]);
    setIsModalOpen(false);
  };

  // Derived Filter States
  const approvedChargesCount = charges.filter(c => c.is_approved === true).length;
  const rejectedChargesCount = charges.filter(c => c.is_approved === false).length;
  const activePendingCharges = charges.filter(c => c.is_approved === null);

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-[#0F172A] relative overflow-hidden">
      
      {/* Sidebar Layout */}
      <aside className="w-64 bg-[#0F172A] flex flex-col shrink-0 shadow-[4px_0_24px_rgba(15,23,42,0.15)]">
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

        <nav className="px-4 flex-1 py-6 space-y-1">
          <button onClick={onBack} className="w-full flex items-center gap-3 px-4 py-3.5 text-[#CBD5E1] hover:text-white hover:bg-slate-800/50 rounded-xl transition font-semibold text-sm text-left">
            <LayoutDashboard size={18} className="text-slate-400" /> Dashboard
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3.5 text-[#CBD5E1] hover:text-white hover:bg-slate-800/50 rounded-xl transition font-semibold text-sm text-left">
            <FolderOpen size={18} className="text-slate-400" /> Cases
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3.5 bg-[#2563EB] text-white rounded-xl font-bold text-sm text-left shadow-md shadow-blue-900/20">
            <Plus size={18} strokeWidth={2.5} /> New Case
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3.5 text-[#CBD5E1] hover:text-white hover:bg-slate-800/50 rounded-xl transition font-semibold text-sm text-left">
            <Settings size={18} className="text-slate-400" /> Settings
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800/60 bg-slate-950/20">
          <button onClick={handleLogout} className="w-full text-center text-xs font-bold tracking-wider uppercase text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 border border-transparent hover:border-rose-900/30 px-4 py-3 rounded-xl transition-all duration-200">
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Framework Body Viewport */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        
        <header className="bg-white border-b border-[#E2E8F0] px-8 py-5 flex justify-between items-center shrink-0">
          <div>
            <h1 className="text-lg font-extrabold text-[#0F172A] tracking-tight">
              {step === 1 && "Step 1: Enter Case Details & Evidence"}
              {step === 2 && "Step 2: Review & Verify Case Summary"}
              {step === 3 && "Step 3: Match IPC & BNS Legal Sections"}
              {step === 4 && "Step 4: View Matching Precedents & Citations"}
            </h1>
            <p className="text-xs font-semibold text-[#64748B] mt-0.5">Secure AI-assisted verification workflow</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
              <input placeholder="Search precedents..." className="border border-[#E2E8F0] rounded-xl bg-[#F8FAFC] pl-10 pr-4 py-2 text-xs w-64 focus:outline-none focus:border-[#3B82F6] transition" />
            </div>
            <Bell size={18} className="text-[#64748B] cursor-pointer hover:text-gray-900 transition" />
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1E40AF] to-[#3B82F6] text-white flex items-center justify-center font-black text-xs tracking-wider shadow-sm border border-blue-400/20 select-none">
              {userInitials}
            </div>
          </div>
        </header>

        {/* Dropdown Widget - View Raw Description Layer */}
        {step > 1 && (
          <div className="bg-white border-b border-[#E2E8F0] px-8 py-3 flex flex-col shrink-0 transition-all duration-200">
            <button 
              onClick={() => setIsRawDocOpen(!isRawDocOpen)}
              className="flex items-center gap-1.5 text-xs font-bold text-[#1E40AF] hover:text-blue-700 w-fit transition select-none"
            >
              <Eye size={14} /> 
              {isRawDocOpen ? "Collapse Raw Case Narrative" : "View Raw Case Description Log"}
              {isRawDocOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {isRawDocOpen && (
              <div className="mt-2.5 p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-slate-600 leading-relaxed font-medium whitespace-pre-wrap max-h-32 overflow-auto animate-in fade-in slide-in-from-top-1 duration-150">
                {description}
              </div>
            )}
          </div>
        )}

        {/* Main Processing Scroll View Container */}
        <div className="flex-1 overflow-auto p-8 lg:p-12 space-y-8">
          
          {/* Timeline wizard mapping panel node */}
          {step > 1 && (
            <div className="max-w-5xl mx-auto bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-2xs">
              <div className="flex items-center justify-between relative">
                {FLOW_STEPS.map((s, index) => {
                  const StepIcon = s.icon;
                  const isCompleted = step > s.id;
                  const isActive = step === s.id;
                  return (
                    <div key={s.id} className="flex flex-col items-center flex-1 relative z-10">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        isCompleted ? "bg-[#1E40AF] border-[#1E40AF] text-white" :
                        isActive ? "bg-blue-50 border-[#2563EB] text-[#1E40AF] font-bold shadow-sm scale-105" :
                        "bg-white border-[#E2E8F0] text-slate-400"
                      }`}>
                        {isCompleted ? <Check size={16} strokeWidth={3} /> : <StepIcon size={16} />}
                      </div>
                      <span className={`text-xs mt-2.5 font-bold tracking-tight ${isActive ? "text-[#1E40AF]" : "text-slate-400"}`}>
                        {s.label}
                      </span>
                      {index < FLOW_STEPS.length - 1 && (
                        <div className="absolute left-[calc(50%+1.25rem)] right-[-50%] top-5 h-[2px] bg-[#E2E8F0] z-[-1]">
                          <div className="h-full bg-[#1E40AF] transition-all duration-500" style={{ width: step > s.id ? '100%' : '0%' }}></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="max-w-5xl mx-auto">
            
            {/* STEP 1: Textarea Core Box View */}
            {step === 1 && (
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
            )}

            {/* STEP 2: Comparative Split Review Sheet Layout */}
            {step === 2 && (
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
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processing Mapping Matrix...
                        </>
                      ) : (
                        <>
                          Sync Approve <ArrowRight size={13} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3 & 4: Sections Grid Matrix Framework */}
            {(step === 3 || step === 4) && (
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
                              <span className="text-[9px] font-normal text-slate-400 lowercase">click item to edit state</span>
                            </h4>
                            <ul className="space-y-1 max-h-40 overflow-y-auto">
                              {charges.map((c, i) => c.is_approved === true ? (
                                <li key={i} className="bg-slate-50 p-1.5 rounded border border-slate-100 flex items-center justify-between gap-2 text-[10px] font-medium font-mono">
                                  <span className="truncate text-slate-800">{c.ipc_section}</span>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); toggleChargeStatus(i, false); }}
                                    className="px-1.5 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded border border-rose-200/60 flex items-center gap-0.5 transition font-sans text-[9px]"
                                  >
                                    <ArrowLeftRight size={10} /> Reject
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
                              <span className="text-[9px] font-normal text-slate-400 lowercase">click item to edit state</span>
                            </h4>
                            <ul className="space-y-1 max-h-40 overflow-y-auto">
                              {charges.map((c, i) => c.is_approved === false ? (
                                <li key={i} className="bg-slate-50 p-1.5 rounded border border-slate-100 flex items-center justify-between gap-2 text-[10px] font-medium font-mono">
                                  <span className="truncate text-slate-800">{c.ipc_section}</span>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); toggleChargeStatus(i, true); }}
                                    className="px-1.5 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded border border-emerald-200/60 flex items-center gap-0.5 transition font-sans text-[9px]"
                                  >
                                    <ArrowLeftRight size={10} /> Approve
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
                        {activePendingCharges.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="text-center py-12 text-[#137333] font-bold bg-slate-50/40 italic">
                              🎉 All statutory rows reviewed successfully! Verify or edit via counter elements above to unlock confirmation.
                            </td>
                          </tr>
                        ) : (
                          activePendingCharges.map((charge, realIdx) => {
                            const absoluteIndex = charges.findIndex(c => c.ipc_section === charge.ipc_section && c.explanation === charge.explanation);
                            return (
                              <tr key={realIdx} className="hover:bg-[#F8FAFC] transition-all duration-200">
                                <td className="px-6 py-4.5 font-mono font-bold text-gray-900">
                                  <span className="text-xs px-2 py-0.5 rounded bg-slate-100 border border-slate-200">{charge.ipc_section}</span>
                                  <div className="text-[10px] text-slate-400 font-semibold mt-1.5 pl-0.5">BNS: {charge.bns_section || "N/A"}</div>
                                </td>
                                <td className="px-6 py-4.5">
                                <span className="inline-flex items-center justify-center bg-[#DBEAFE] text-[#1D4ED8] px-3 py-1 text-[11px] rounded-xl font-bold border border-[#BFDBFE] tracking-wide whitespace-nowrap">
                                  {charge.legal_category || "Statutory Check"}
                                </span>
                              </td>
                                <td className="px-6 py-4.5 text-slate-600 max-w-sm leading-relaxed font-medium">
                                  {charge.reason}
                                </td>
                                <td className="px-6 py-4.5 font-bold whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full" style={{ width: `${charge.confidence || 85}%` }}></div>
                                    </div>
                                    <span className="font-mono text-slate-500 text-[11px]">{charge.confidence || 85}%</span>
                                  </div>
                                </td>
                                
                                <td className="px-6 py-4.5 text-right whitespace-nowrap">
                                  <div className="inline-flex gap-1.5">
                                    <button
                                      onClick={() => toggleChargeStatus(absoluteIndex, true)}
                                      className="bg-white text-[#64748B] hover:text-[#137333] hover:bg-[#E6F4EA] hover:border-[#CEEAD6] text-xs font-bold px-2.5 py-1.5 rounded-xl border border-slate-200 transition active:scale-95 flex items-center gap-1 shadow-3xs"
                                    >
                                      <Check size={12} /> Approve
                                    </button>
                                    <button
                                      onClick={() => toggleChargeStatus(absoluteIndex, false)}
                                      className="bg-white text-[#64748B] hover:text-rose-700 hover:bg-rose-50 hover:border-rose-200 text-xs font-bold px-2.5 py-1.5 rounded-xl border border-slate-200 transition active:scale-95 flex items-center gap-1 shadow-3xs"
                                    >
                                      <X size={12} /> Reject
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Footer Controller Bar */}
                  {step === 3 && (
                    <div className="p-5 bg-[#F8FAFC] border-t border-[#E2E8F0] flex justify-between items-center text-xs font-bold">
                      {!allChargesEvaluated ? (
                        <span className="text-amber-600 flex items-center gap-1 bg-amber-50 border border-amber-200/50 px-3 py-1.5 rounded-xl animate-pulse">
                          <AlertCircle size={13} /> Gating Error: Review remaining {activePendingCharges.length} identified code nodes to unlock confirmation.
                        </span>
                      ) : (
                        <span className="text-[#137333] flex items-center gap-1 bg-[#E6F4EA] border border-[#CEEAD6] px-3 py-1.5 rounded-xl">
                          <CheckCircle size={13} /> Complete structure audit cleared. Lock encryption keys.
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
                  )}
                </div>

                {/* STEP 4: Citations List Deck */}
                {step === 4 && (
                  <div className="space-y-4 border-t border-[#E2E8F0] pt-6">
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
                          <div key={item.id} className="bg-[#F1F5F9]/70 border border-[#E2E8F0] hover:border-slate-300 rounded-xl p-5 shadow-2xs hover:shadow-xs transition flex flex-col justify-between">
                            <div className="space-y-2">
                              <div className="flex justify-between items-center text-[10px] font-bold font-mono tracking-wider">
                                <span className="text-slate-400">CASE ID: {item.id ? item.id.slice(0, 10).toUpperCase() : "2024/DL-8042"}</span>
                                <span className="text-[#137333] bg-[#E6F4EA] px-2 py-0.5 rounded-xl border border-[#CEEAD6]">98.2% Match</span>
                              </div>
                              <h4 className="font-bold text-[#0F172A] leading-snug text-sm line-clamp-2">{item.title}</h4>
                              <div className="flex gap-4 text-[11px] text-slate-400 font-semibold">
                                <span>⚖️ Judgment: Guilty</span>
                                <span>📅 Date: Oct 12, 2023</span>
                              </div>
                            </div>
                            <div className="mt-5 pt-3 border-t border-slate-200 flex justify-end">
                              <a href={item.doc_url} target="_blank" rel="noreferrer" className="text-xs font-bold text-[#1E40AF] hover:text-blue-700 flex items-center gap-1 transition">
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

      {/* Manual Entry Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100">
            <div className="px-6 py-4 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFC]">
              <h3 className="font-extrabold text-[#0F172A] text-sm tracking-tight flex items-center gap-1.5">
                <Scale size={16} className="text-[#1E40AF]" /> Add Manual Statutory Section
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition p-1 hover:bg-slate-100 rounded-lg">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddManualSection} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-[#64748B] uppercase tracking-wide text-[10px]">IPC Section Code *</label>
                  <input type="text" required placeholder="e.g. IPC Section 420" value={newIpc} onChange={(e) => setNewIpc(e.target.value)} className="w-full border border-[#E2E8F0] rounded-xl p-2.5 focus:outline-none focus:border-[#3B82F6] bg-[#F8FAFC]/50 font-mono text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-[#64748B] uppercase tracking-wide text-[10px]">BNS Equivalent</label>
                  <input type="text" placeholder="e.g. BNS Section 318" value={newBns} onChange={(e) => setNewBns(e.target.value)} className="w-full border border-[#E2E8F0] rounded-xl p-2.5 focus:outline-none focus:border-[#3B82F6] bg-[#F8FAFC]/50 font-mono text-sm" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#64748B] uppercase tracking-wide text-[10px]">Legal Category</label>
                <input type="text" placeholder="e.g. Corporate Cheating" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="w-full border border-[#E2E8F0] rounded-xl p-2.5 focus:outline-none focus:border-[#3B82F6] bg-[#F8FAFC]/50 text-sm" />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#64748B] uppercase tracking-wide text-[10px]">Case Offense Description *</label>
                <textarea required rows={4} placeholder="Provide explicit reasons for adding this section..." value={newExplanation} onChange={(e) => setNewExplanation(e.target.value)} className="w-full border border-[#E2E8F0] rounded-xl p-2.5 focus:outline-none focus:border-[#3B82F6] bg-[#F8FAFC]/50 text-sm resize-none leading-relaxed" />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl border border-[#E2E8F0] hover:bg-slate-50 text-[#64748B] transition font-bold text-xs">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] text-white font-bold shadow-sm text-xs transition">Add to Table</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}