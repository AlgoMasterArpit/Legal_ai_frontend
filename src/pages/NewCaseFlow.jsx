import { useState } from "react";
import {
  Search,
  Bell,
  PlusCircle,
  FolderOpen,
  Settings,
  LayoutDashboard,
} from "lucide-react";

import {
  createCase,
  extractCharges,
  finalizeCharges,
  fetchPrecedents,
} from "../Services/caseService";

export default function NewCaseFlow({ onBack }) {
  const [step, setStep] = useState(1);

  const [description, setDescription] = useState("");
  const [summary, setSummary] = useState("");
  const [charges, setCharges] = useState([]);
  const [precedents, setPrecedents] = useState([]);
  const [caseId, setCaseId] = useState(null);

  const userId = localStorage.getItem("user_id");
const handleGenerateSummary = async () => {
  try {
    const data = await createCase(
      description,
      userId
    );

    console.log(
      "Create Case Response:",
      data
    );

    setCaseId(data.id);

    setSummary(
      data.llm_summary ||
      data.lawyer_approved_summary ||
      ""
    );

    setStep(2);
  } catch (err) {
    console.error(
      "Generate Summary Error:",
      err
    );
  }
};
const handleApproveSummary = async () => {
  try {
    const data = await extractCharges(
      caseId,
      summary
    );

    console.log(
      "Extract Charges Response:",
      data
    );

    if (!data.draft_charges) {
      alert(
        "No draft charges returned from backend"
      );
      return;
    }

    const formattedCharges =
      data.draft_charges.map((c) => ({
        ...c,
        is_approved: true,
      }));

    console.log(
      "Formatted Charges:",
      formattedCharges
    );

    setCharges(formattedCharges);

    setStep(3);
  } catch (err) {
    console.error(
      "Approve Summary Error:",
      err
    );
  }
};

const handleFinalizeCharges = async () => {
  try {
    const approvedIds = charges
      .filter((c) => c.is_approved)
      .map((c) => c.id);

    const rejectedData = charges
      .filter((c) => !c.is_approved)
      .map((c) => ({
        id: c.id,
        reason: "Rejected by lawyer",
      }));

    console.log("Approved:", approvedIds);
    console.log("Rejected:", rejectedData);

    const finalizeResponse = await finalizeCharges(
      caseId,
      approvedIds,
      rejectedData
    );

    console.log("Finalize Response:", finalizeResponse);

    const precedentData = await fetchPrecedents(caseId);

    console.log("Precedent Response:", precedentData);

    setPrecedents(precedentData.precedent_cases || []);

    setStep(4);
  } catch (err) {
    console.error(err);
  }
};

  return (
    <div className="flex h-screen bg-[#f5f5fa]">
      {/* Sidebar */}

      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold">
            LegalAI
          </h1>

          <p className="text-sm text-gray-500">
            Premium LegalTech
          </p>
        </div>

        <nav className="px-4 flex-1">
          <button
            onClick={onBack}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg"
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg">
            <FolderOpen size={18} />
            Cases
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-3 bg-[#eef2ff] rounded-lg font-medium">
            <PlusCircle size={18} />
            New Case
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 rounded-lg">
            <Settings size={18} />
            Settings
          </button>
        </nav>
      </aside>

      {/* Main */}

      <main className="flex-1 overflow-auto">
        {/* Top Bar */}

        <div className="bg-white border-b px-8 py-4 flex justify-between">
          <h1 className="text-3xl font-bold">
            New Case Analysis
          </h1>

          <div className="flex items-center gap-5">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-3 text-gray-400"
              />

              <input
                placeholder="Search precedents..."
                className="border rounded-full pl-10 py-2 w-72"
              />
            </div>

            <Bell size={18} />
          </div>
        </div>

        <div className="p-8">
          <div className="bg-white border rounded-xl p-6">
            {/* STEP 1 */}

            {step === 1 && (
              <>
                <h2 className="font-semibold text-xl mb-4">
                  Case Description
                </h2>

                <textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  placeholder="Paste the case details, evidence narratives, or witness statements..."
                  className="w-full h-80 border rounded-lg p-4"
                />

                <div className="flex justify-end mt-6">
                  <button
                    onClick={
                      handleGenerateSummary
                    }
                    className="bg-[#081f4d] text-white px-8 py-3 rounded-lg"
                  >
                    Generate Summary
                  </button>
                </div>
              </>
            )}

            {/* STEP 2 */}

            {step === 2 && (
              <>
                <h2 className="font-semibold text-xl mb-4">
                  Review Summary
                </h2>

                <textarea
                  value={summary}
                  onChange={(e) =>
                    setSummary(e.target.value)
                  }
                  className="w-full h-72 border rounded-lg p-4"
                />

                <div className="flex justify-end mt-6">
                  <button
                    onClick={
                      handleApproveSummary
                    }
                    className="bg-green-600 text-white px-8 py-3 rounded-lg"
                  >
                    Approve Summary
                  </button>
                </div>
              </>
            )}

        {/* STEP 3 */}

{step === 3 && (
  <>
    <h2 className="font-semibold text-xl mb-6">
      Review Charges
    </h2>

    {charges.map((charge, index) => (
      <div
        key={index}
        className="border rounded-xl p-5 mb-4 bg-white"
      >
        <div className="font-semibold text-lg">
          IPC {charge.ipc_section}
        </div>

        <div className="text-gray-600 mt-1">
          BNS {charge.bns_equivalent}
        </div>

        <p className="mt-3 text-gray-700">
          {charge.explanation}
        </p>

        <div className="flex gap-3 mt-4">
          <button
            onClick={() => {
              const updated = [...charges];
              updated[index].is_approved = true;
              setCharges(updated);
            }}
            className={`px-4 py-2 rounded-lg ${
              charge.is_approved
                ? "bg-green-600 text-white"
                : "bg-gray-100"
            }`}
          >
            Approve
          </button>

          <button
            onClick={() => {
              const updated = [...charges];
              updated[index].is_approved = false;
              setCharges(updated);
            }}
            className={`px-4 py-2 rounded-lg ${
              charge.is_approved === false
                ? "bg-red-600 text-white"
                : "bg-gray-100"
            }`}
          >
            Reject
          </button>
        </div>
      </div>
    ))}

    <div className="flex justify-end">
      <button
        onClick={handleFinalizeCharges}
        className="bg-purple-600 text-white px-8 py-3 rounded-lg"
      >
        Save Charges
      </button>
    </div>
  </>
)}

            {/* STEP 4 */}

            {step === 4 && (
              <>
                <h2 className="font-semibold text-xl mb-6">
                  Relevant Precedents
                </h2>

                {precedents.map((item) => (
                  <div
                    key={item.id}
                    className="border rounded-lg p-4 mb-4"
                  >
                    <h3 className="font-semibold">
                      {item.title}
                    </h3>

                    <a
                      href={item.doc_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600"
                    >
                      Open Case
                    </a>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}