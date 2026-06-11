import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react';

const summaryPrompt = (text) =>
  `AI-generated summary of the case: ${text.slice(0, 180)}...`; 

const createIpcs = () => [
  {
    id: 'IPC 420',
    title: 'Criminal Breach of Trust',
    description:
      'Alleged misuse of property or trust in a business or fiduciary relationship.',
    reasoning:
      'The approved summary identifies a possible breach of obligation toward the victim’s assets and trust relationship.',
  },
  {
    id: 'IPC 406',
    title: 'Criminal Trespass',
    description:
      'Entering or remaining on property in possession of another without permission.',
    reasoning:
      'The facts suggest unauthorized entry or presence in the disputed premises described in the incident.',
  },
  {
    id: 'IPC 120B',
    title: 'Intentional Assault',
    description:
      'Intentional use of force causing hurt, with possibility of aggravated injuries.',
    reasoning:
      'The narrative indicates a deliberate physical attack and threats to the victim’s safety.',
  },
];

const researchPayload = {
  similarCases: [
    {
      caseId: '2023/CL-049',
      title: 'Patel vs. State',
      judgment: 'Guilty',
      date: 'Oct 12, 2023',
      similarity: '95.3%',
    },
    {
      caseId: '2022/CR-310',
      title: 'Rao vs. City Police',
      judgment: 'Acquitted',
      date: 'Dec 04, 2022',
      similarity: '87.6%',
    },
  ],
  precedents: [
    {
      title: 'State vs. Kumar',
      summary: 'Court held that unauthorized trespass can support IPC 406 and related offenses.',
      date: 'Jan 18, 2022',
    },
    {
      title: 'Singh vs. State',
      summary: 'Higher court emphasized the link between deliberate assault and aggravated charges.',
      date: 'Mar 09, 2023',
    },
  ],
  insights:
    'The approved summary and IPC selection together strengthen the case for reviewing precedent on trespass and intentional assault. Consider the risk factors identified in the narrative and use similar judgments to support prosecutorial strategy.',
};

const steps = [
  'Case Description',
  'AI Summary Review',
  'IPC Review',
  'Legal Research',
];

export default function NewCaseFlow({ onClose = () => {} }) {
  const [caseTitle, setCaseTitle] = useState('');
  const [caseDescription, setCaseDescription] = useState('');
  const [stage, setStage] = useState('description');
  const [summary, setSummary] = useState('');
  const [summaryStatus, setSummaryStatus] = useState('pending');
  const [editMode, setEditMode] = useState(false);
  const [ipcs, setIpcs] = useState([]);
  const [ipcDecisions, setIpcDecisions] = useState({});
  const [research, setResearch] = useState({
    status: 'pending',
    similar: { status: 'pending', items: [] },
    precedent: { status: 'pending', items: [] },
    insights: '',
  });

  const canGenerateSummary = caseDescription.trim().length > 0;
  const allIpcDecided = useMemo(
    () => ipcs.length > 0 && ipcs.every((item) => ipcDecisions[item.id]),
    [ipcs, ipcDecisions],
  );

  useEffect(() => {
    if (stage !== 'legalResearch') {
      return;
    }

    if (research.status === 'pending') {
      setResearch((current) => ({
        ...current,
        status: 'processing',
      }));

      const timer = window.setTimeout(() => {
        setResearch({
          status: 'completed',
          similar: { status: 'completed', items: researchPayload.similarCases },
          precedent: { status: 'completed', items: researchPayload.precedents },
          insights: researchPayload.insights,
        });
      }, 1000);

      return () => window.clearTimeout(timer);
    }
  }, [stage, research.status]);

  const currentStep =
    stage === 'description'
      ? 1
      : stage === 'summaryReview'
      ? 2
      : stage === 'ipcReview'
      ? 3
      : 4;

  const handleGenerateSummary = () => {
    if (!canGenerateSummary) {
      return;
    }

    setSummary(summaryPrompt(caseDescription));
    setSummaryStatus('pending');
    setEditMode(false);
    setStage('summaryReview');
  };

  const handleApproveSummary = () => {
    setSummaryStatus('approved');
    setIpcs(createIpcs());
    setStage('ipcReview');
  };

  const handleRejectSummary = () => {
    setSummaryStatus('rejected');
    setEditMode(true);
  };

  const handleRegenerateSummary = () => {
    setSummary((current) =>
      current.includes('updated')
        ? `${summaryPrompt(caseDescription)}`
        : `${summaryPrompt(caseDescription)} Updated with additional clarity.`,
    );
    setSummaryStatus('pending');
    setEditMode(false);
  };

  const handleIpcDecision = (ipcId, decision) => {
    setIpcDecisions((current) => ({
      ...current,
      [ipcId]: decision,
    }));
  };

  const handleContinueToResearch = () => {
    setStage('legalResearch');
  };

  const handleRetrySimilar = () => {
    setResearch((current) => ({
      ...current,
      similar: { status: 'processing', items: [] },
    }));

    window.setTimeout(() => {
      setResearch((current) => ({
        ...current,
        similar: { status: 'completed', items: researchPayload.similarCases },
      }));
    }, 800);
  };

  const handleRetryPrecedent = () => {
    setResearch((current) => ({
      ...current,
      precedent: { status: 'processing', items: [] },
    }));

    window.setTimeout(() => {
      setResearch((current) => ({
        ...current,
        precedent: { status: 'completed', items: researchPayload.precedents },
      }));
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#f7f8fc] pb-10">
      <div className="mx-auto w-full max-w-7xl px-5 pt-8">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300"
          >
            <ArrowLeft size={16} /> Back to dashboard
          </button>

          <div className="text-right">
            <p className="text-sm text-slate-500">New Case Workflow</p>
            <h1 className="text-2xl font-semibold text-slate-900">
              Create New Case Analysis
            </h1>
          </div>
        </div>

        <div className="mt-6 grid gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:grid-cols-4 sm:px-6">
          {steps.map((label, index) => {
            const stepIndex = index + 1;
            const isActive = currentStep === stepIndex;
            return (
              <div
                key={label}
                className={`flex items-center gap-3 rounded-3xl border px-4 py-3 transition ${
                  isActive
                    ? 'border-blue-300 bg-blue-50 text-slate-900 shadow-sm'
                    : 'border-transparent text-slate-500'
                }`}
              >
                <span
                  className={`grid h-9 w-9 place-items-center rounded-full text-sm font-semibold ${
                    isActive ? 'bg-[#081f4d] text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {stepIndex}
                </span>
                <div className="text-sm leading-5">
                  <p className="font-semibold">{label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {stage === 'description' && (
          <section className="mt-8">
            <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
              <div className="space-y-4 rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="space-y-2">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
                    Case Description
                  </p>
                  <h2 className="text-2xl font-semibold text-slate-900">
                    Start a new review with one case summary.
                  </h2>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-medium text-slate-700">
                    Case Title (optional)
                    <input
                      value={caseTitle}
                      onChange={(event) => setCaseTitle(event.target.value)}
                      className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                      placeholder="Enter a short case title"
                    />
                  </label>

                  <label className="block text-sm font-medium text-slate-700">
                    Case Description
                    <textarea
                      value={caseDescription}
                      onChange={(event) => setCaseDescription(event.target.value)}
                      rows={10}
                      className="mt-2 w-full rounded-[28px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                      placeholder="Paste the case details, evidence narrative, or witness summary here for AI processing..."
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-sm font-medium text-slate-500">Workflow Guidance</p>
                  <ul className="mt-4 space-y-3 text-sm text-slate-600">
                    <li>• Provide the case description clearly for best AI accuracy.</li>
                    <li>• Summary generation begins after you submit.</li>
                    <li>• Lawyer review is required before IPC generation.</li>
                  </ul>
                </div>

                <div className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-sm font-medium text-slate-500">Ready to continue</p>
                  <p className="mt-3 text-sm text-slate-600">
                    Only the case title and description are shown on this page. No AI output appears until you click Generate AI Summary.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleGenerateSummary}
                disabled={!canGenerateSummary}
                className="inline-flex items-center justify-center rounded-[28px] bg-[#081f4d] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#0b305c] disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Generate AI Summary
              </button>
            </div>
          </section>
        )}

        {stage === 'summaryReview' && (
          <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <div className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
                    Original Case Description
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                    Review the source text.
                  </h2>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                  Source
                </span>
              </div>

              <div className="mt-6 space-y-4 rounded-[28px] border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-700">
                {caseTitle && (
                  <p className="text-sm font-semibold text-slate-900">{caseTitle}</p>
                )}
                <p>{caseDescription}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[36px] border border-slate-200 bg-[#061b41] p-6 text-white shadow-[0_18px_50px_rgba(9,22,56,0.16)]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-300">
                      AI Generated Summary
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold">Lawyer review required</h2>
                  </div>
                  <div className="rounded-full bg-slate-900/10 px-3 py-1 text-sm text-slate-200">
                    {summaryStatus === 'approved'
                      ? 'Approved'
                      : summaryStatus === 'rejected'
                      ? 'Rejected'
                      : 'Pending'}
                  </div>
                </div>

                <div className="mt-6 space-y-4 text-sm leading-7 text-slate-100">
                  {editMode ? (
                    <textarea
                      value={summary}
                      onChange={(event) => setSummary(event.target.value)}
                      rows={10}
                      className="w-full rounded-[28px] border border-slate-200/20 bg-white/5 px-4 py-4 text-sm text-white outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-400/40"
                    />
                  ) : (
                    <p>{summary}</p>
                  )}
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setEditMode((current) => !current)}
                    className="inline-flex items-center gap-2 rounded-[28px] border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
                  >
                    <FileText size={16} /> Edit Summary
                  </button>

                  <button
                    type="button"
                    onClick={handleApproveSummary}
                    className="inline-flex items-center gap-2 rounded-[28px] bg-[#00a45a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#009154]"
                  >
                    <CheckCircle2 size={16} /> Approve Summary
                  </button>

                  <button
                    type="button"
                    onClick={handleRejectSummary}
                    className="inline-flex items-center gap-2 rounded-[28px] border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
                  >
                    <AlertTriangle size={16} /> Reject Summary
                  </button>
                </div>

                {summaryStatus === 'rejected' && (
                  <div className="mt-5 rounded-3xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-700">
                    <p className="font-semibold">Summary rejected</p>
                    <p className="mt-1">
                      Update the summary text or regenerate it before proceeding to IPC selection.
                    </p>
                    <button
                      type="button"
                      onClick={handleRegenerateSummary}
                      className="mt-4 inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                    >
                      <RefreshCw size={16} /> Regenerate Summary
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {stage === 'ipcReview' && (
          <section className="mt-8 space-y-6">
            <div className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
                    Approved Summary
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                    Reference for IPC review
                  </h2>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
                  <ShieldCheck size={16} /> Summary approved
                </span>
              </div>

              <div className="mt-6 rounded-[28px] border border-slate-200 bg-[#0f2449] p-6 text-slate-100 shadow-[0_18px_50px_rgba(9,22,56,0.14)]">
                <p className="text-sm leading-7">{summary}</p>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
                      IPC Suggestions
                    </p>
                    <h3 className="mt-2 text-xl font-semibold text-slate-900">
                      Review and decide each section.
                    </h3>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                    {ipcs.length} suggestions
                  </span>
                </div>

                <div className="mt-6 space-y-4">
                  {ipcs.map((ipc) => {
                    const decision = ipcDecisions[ipc.id];
                    return (
                      <div
                        key={ipc.id}
                        className="rounded-[28px] border border-slate-200 bg-slate-50 p-5"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-[#eef5ff] px-3 py-1 text-sm font-semibold text-[#0a3f8a]">
                                {ipc.id}
                              </span>
                              <h4 className="text-lg font-semibold text-slate-900">
                                {ipc.title}
                              </h4>
                            </div>
                            <p className="mt-3 text-sm text-slate-700">{ipc.description}</p>
                            <p className="mt-3 text-sm text-slate-600">{ipc.reasoning}</p>
                          </div>

                          <div className="flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() => handleIpcDecision(ipc.id, 'approved')}
                              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                                decision === 'approved'
                                  ? 'bg-green-600 text-white'
                                  : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              <ThumbsUp size={16} /> Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleIpcDecision(ipc.id, 'rejected')}
                              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                                decision === 'rejected'
                                  ? 'bg-red-600 text-white'
                                  : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              <ThumbsDown size={16} /> Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-4 rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
                    Decision status
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-900">
                    {allIpcDecided ? 'Ready for legal research' : 'Complete all IPC decisions'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleContinueToResearch}
                  disabled={!allIpcDecided}
                  className="inline-flex items-center gap-2 rounded-[28px] bg-[#081f4d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0b315f] disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  Continue to Legal Research <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </section>
        )}

        {stage === 'legalResearch' && (
          <section className="mt-8 space-y-6">
            <div className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
                    Legal Research
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                    Research using approved summary and IPC sections
                  </h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { label: 'Similar Cases Search', status: research.similar.status },
                    { label: 'Precedent Retrieval', status: research.precedent.status },
                    { label: 'Research Analysis', status: research.status },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                    >
                      <p className="text-slate-500">{item.label}</p>
                      <p className="mt-2 font-semibold text-slate-900 capitalize">
                        {item.status}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {research.similar.items.length > 0 && (
              <div className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleRetrySimilar}
                      className="inline-flex h-11 items-center gap-2 rounded-full bg-slate-100 px-4 text-sm font-medium text-slate-700 hover:bg-slate-200"
                    >
                      <RefreshCw size={16} /> Retry
                    </button>
                    <div>
                      <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
                        Similar Cases
                      </p>
                      <h3 className="text-xl font-semibold text-slate-900">
                        Cases matching your approved summary
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {research.similar.items.map((item) => (
                    <div key={item.caseId} className="rounded-[28px] border border-slate-200 p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                          <p className="text-sm text-slate-500">{item.caseId}</p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                          {item.similarity}
                        </span>
                      </div>
                      <div className="mt-4 text-sm text-slate-600">
                        <p>Judgment: {item.judgment}</p>
                        <p className="mt-2">{item.date}</p>
                      </div>
                      <button className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#081f4d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0b305f]">
                        View Details <ArrowRight size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {research.precedent.items.length > 0 && (
              <div className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleRetryPrecedent}
                      className="inline-flex h-11 items-center gap-2 rounded-full bg-slate-100 px-4 text-sm font-medium text-slate-700 hover:bg-slate-200"
                    >
                      <RefreshCw size={16} /> Retry
                    </button>
                    <div>
                      <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
                        Precedent Analysis
                      </p>
                      <h3 className="text-xl font-semibold text-slate-900">
                        Relevant case law and citations
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {research.precedent.items.map((item) => (
                    <div key={item.title} className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-lg font-semibold text-slate-900">{item.title}</p>
                          <p className="mt-1 text-sm text-slate-500">{item.date}</p>
                        </div>
                      </div>
                      <p className="mt-4 text-sm leading-7 text-slate-700">{item.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {research.insights && (
              <div className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <Sparkles className="text-slate-500" size={18} />
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
                      Research Insights
                    </p>
                    <h3 className="mt-1 text-xl font-semibold text-slate-900">
                      What the analysis reveals
                    </h3>
                  </div>
                </div>
                <p className="mt-5 text-sm leading-7 text-slate-700">{research.insights}</p>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
