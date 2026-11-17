import {
  ArrowRightLeft,
  CheckSquare,
  FileText,
  HardDrive,
  Plus,
  Search,
  ShieldCheck,
  Square,
} from 'lucide-react';
import { useState } from 'react';
import { EVIDENCE_HANDLING_STEPS } from '../data/proposalData';
import type { CasePriority, CaseStatus, DivisionType, ForensicCase, LabStatePayload } from '../types/forensics';
import { formatDateTime } from '../utils/crypto';
import { CaseStatusLabel, PriorityLabel } from './StatusText';

interface InvestigationWorkspaceViewProps {
  state: LabStatePayload;
  selectedCaseId: string;
  onSelectCaseId: (id: string) => void;
  onCreateCase: (payload: {
    title: string;
    requestingParty: string;
    authorizationRef: string;
    division: DivisionType;
    priority: CasePriority;
    leadExaminerId: string;
    summary: string;
  }) => Promise<void>;
  onUpdateCase: (id: string, patch: { status?: CaseStatus; completedPolicySteps?: number[] }) => Promise<void>;
  showCreateModal: boolean;
  setShowCreateModal: (v: boolean) => void;
}

interface TimelineNode {
  id: string;
  timestamp: string;
  lane: 0 | 1 | 2 | 3; // 0: Intake/Host, 1: Custody, 2: Hash/Verification, 3: Findings
  laneLabel: string;
  title: string;
  subtitle: string;
  detail: string;
  accent: 'sky' | 'amber' | 'emerald' | 'violet';
}

export function InvestigationWorkspaceView({
  state,
  selectedCaseId,
  onSelectCaseId,
  onCreateCase,
  onUpdateCase,
  showCreateModal,
  setShowCreateModal,
}: InvestigationWorkspaceViewProps) {
  const [viewMode, setViewMode] = useState<'timeline' | 'cases'>('timeline');
  const [statusFilter, setStatusFilter] = useState<'All' | CaseStatus>('All');
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    requestingParty: '',
    authorizationRef: '',
    division: 'Computer Forensics' as DivisionType,
    priority: 'Standard' as CasePriority,
    leadExaminerId: state.investigators[1]?.id ?? state.investigators[0]?.id ?? '',
    summary: '',
  });

  const activeCase: ForensicCase | undefined =
    state.cases.find((c) => c.id === selectedCaseId) ?? state.cases[0];

  const filteredCases = state.cases.filter((c) => {
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const q = search.trim().toLowerCase();
    const matchesQuery =
      !q ||
      c.caseNumber.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.requestingParty.toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });

  // Build unified swimlane timeline for activeCase
  const timelineNodes: TimelineNode[] = [];
  if (activeCase) {
    timelineNodes.push({
      id: `tl-open-${activeCase.id}`,
      timestamp: activeCase.openedAt,
      lane: 0,
      laneLabel: 'CASE INTAKE',
      title: `Case Registered: ${activeCase.caseNumber}`,
      subtitle: `${activeCase.division} · Auth ${activeCase.authorizationRef}`,
      detail: activeCase.summary,
      accent: 'sky',
    });

    state.evidence
      .filter((e) => e.caseId === activeCase.id)
      .forEach((ev) => {
        timelineNodes.push({
          id: `tl-ev-${ev.id}`,
          timestamp: ev.receivedAt,
          lane: 0,
          laneLabel: 'EVIDENCE',
          title: `${ev.evidenceCode}: ${ev.description}`,
          subtitle: `${ev.mediaType} · ${ev.acquisitionMethod}`,
          detail: `Baseline SHA-256: ${ev.baselineSha256.slice(0, 20)}...`,
          accent: 'sky',
        });
      });

    state.custodyTransfers
      .filter((t) => t.caseNumber === activeCase.caseNumber)
      .forEach((t) => {
        timelineNodes.push({
          id: `tl-coc-${t.id}`,
          timestamp: t.transferredAt,
          lane: 1,
          laneLabel: 'CUSTODY',
          title: `${t.evidenceCode} · ${t.purpose}`,
          subtitle: `${t.fromHolder} → ${t.toHolder}`,
          detail: `Seal ${t.sealNumber} · Auth: ${t.authorizedBy}`,
          accent: 'amber',
        });
      });

    state.verifications
      .filter((v) => v.caseNumber === activeCase.caseNumber)
      .forEach((v) => {
        timelineNodes.push({
          id: `tl-ver-${v.id}`,
          timestamp: v.verifiedAt,
          lane: 2,
          laneLabel: 'SHA-256 CHECK',
          title: `${v.matched ? 'Hash Match' : 'Hash Mismatch'}: ${v.fileName}`,
          subtitle: `Verified by ${v.verifiedBy} (${v.evidenceCode})`,
          detail: v.notes,
          accent: v.matched ? 'emerald' : 'violet',
        });
      });

    state.notes
      .filter((n) => n.caseId === activeCase.id)
      .forEach((n) => {
        timelineNodes.push({
          id: `tl-note-${n.id}`,
          timestamp: n.createdAt,
          lane: 3,
          laneLabel: 'FINDING',
          title: n.findingTitle,
          subtitle: `${n.toolUsed} · ${n.examinerName}`,
          detail: n.content,
          accent: 'violet',
        });
      });

    timelineNodes.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.requestingParty.trim() || !form.authorizationRef.trim()) return;
    setSubmitting(true);
    try {
      await onCreateCase(form);
      setForm({
        title: '',
        requestingParty: '',
        authorizationRef: '',
        division: 'Computer Forensics',
        priority: 'Standard',
        leadExaminerId: state.investigators[1]?.id ?? state.investigators[0]?.id ?? '',
        summary: '',
      });
      setShowCreateModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const togglePolicyStep = async (target: ForensicCase, stepNumber: number) => {
    const exists = target.completedPolicySteps.includes(stepNumber);
    const nextSteps = exists
      ? target.completedPolicySteps.filter((s) => s !== stepNumber)
      : [...target.completedPolicySteps, stepNumber].sort((a, b) => a - b);
    await onUpdateCase(target.id, { completedPolicySteps: nextSteps });
  };

  const laneHeaders = ['HOSTS & EVIDENCE', 'CUSTODY TRANSFERS', 'SHA-256 VERIFICATION', 'EXAMINATION FINDINGS'];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center justify-between border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-100">
            Investigation Workspace & Case Management
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Chronological forensic swimlane timeline, case registration, status transitions, and 10-step SOP checklist.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-[#131a26] border border-slate-800 rounded-lg">
            <button
              type="button"
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                viewMode === 'timeline' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Case Swimlane Timeline
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cases')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                viewMode === 'cases' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Cases Directory
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-500 transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Register Case</span>
          </button>
        </div>
      </div>

      {viewMode === 'timeline' && activeCase ? (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Swimlane Forensic Timeline inspired by Reference Screen 3 */}
          <div className="xl:col-span-8 bg-[#0e1726] border border-slate-800 rounded-lg overflow-hidden">
            <div className="px-5 py-3.5 bg-[#131c2e] border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <label htmlFor="workspace-case-select" className="text-xs font-medium text-slate-400">
                  Active Case:
                </label>
                <select
                  id="workspace-case-select"
                  value={activeCase.id}
                  onChange={(e) => onSelectCaseId(e.target.value)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-100 bg-[#0b0f17] border border-slate-700 rounded-lg"
                >
                  {state.cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.caseNumber} — {c.title}
                    </option>
                  ))}
                </select>
              </div>
              <CaseStatusLabel status={activeCase.status} />
            </div>

            {/* Swimlane Column Headers */}
            <div className="hidden md:grid grid-cols-12 border-b border-slate-800/90 bg-[#0c1422] text-[11px] font-mono tracking-wider text-teal-400/90 px-4 py-2.5">
              <div className="col-span-2">TIMESTAMP</div>
              <div className="col-span-10 grid grid-cols-4 gap-2">
                {laneHeaders.map((lh) => (
                  <div key={lh}>{lh}</div>
                ))}
              </div>
            </div>

            {/* Timeline Rows */}
            <div className="divide-y divide-slate-800/60 p-4 space-y-3">
              {timelineNodes.map((node) => {
                const iconEl =
                  node.lane === 0 ? (
                    <HardDrive className="w-3.5 h-3.5 text-sky-400" aria-hidden="true" />
                  ) : node.lane === 1 ? (
                    <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                  ) : node.lane === 2 ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-violet-400" aria-hidden="true" />
                  );

                const borderAccent =
                  node.accent === 'sky'
                    ? 'border-sky-500/40'
                    : node.accent === 'amber'
                    ? 'border-amber-500/40'
                    : node.accent === 'emerald'
                    ? 'border-emerald-500/40'
                    : 'border-violet-500/40';

                return (
                  <div key={node.id} className="pt-3 first:pt-0 grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                    <div className="md:col-span-2 font-mono text-[11px] text-slate-400 tabular-nums pt-1">
                      {formatDateTime(node.timestamp)}
                    </div>
                    <div className="md:col-span-10 grid grid-cols-1 md:grid-cols-4 gap-2">
                      {/* Offset card horizontally into its swimlane */}
                      <div
                        className={`md:col-span-2 ${
                          node.lane === 0
                            ? 'md:col-start-1'
                            : node.lane === 1
                            ? 'md:col-start-2'
                            : node.lane === 2
                            ? 'md:col-start-3'
                            : 'md:col-start-3'
                        }`}
                      >
                        <div className={`bg-[#131d2f] border ${borderAccent} rounded-lg p-3 space-y-1`}>
                          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                            {iconEl}
                            <span>{node.laneLabel}</span>
                          </div>
                          <p className="text-xs font-semibold text-slate-100">{node.title}</p>
                          <p className="text-[11px] text-slate-300">{node.subtitle}</p>
                          <p className="text-[11px] text-slate-400 leading-relaxed">{node.detail}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Panel: Case Metadata & 10-Step Handling Policy */}
          <div className="xl:col-span-4 bg-[#131a26] border border-slate-800 rounded-lg p-5 space-y-5">
            <div className="border-b border-slate-800 pb-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-sky-400">{activeCase.caseNumber}</span>
                <PriorityLabel priority={activeCase.priority} />
              </div>
              <h2 className="mt-1.5 text-base font-semibold text-slate-100">{activeCase.title}</h2>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">{activeCase.summary}</p>
              <div className="mt-3 text-xs text-slate-400 space-y-1">
                <p>
                  Lead Examiner: <span className="text-slate-200">{activeCase.leadExaminerName}</span>
                </p>
                <p>
                  Authorization: <span className="font-mono text-slate-200">{activeCase.authorizationRef}</span>
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="workspace-stage-select" className="block text-xs font-medium text-slate-300 mb-1.5">
                Update Investigation Stage
              </label>
              <select
                id="workspace-stage-select"
                value={activeCase.status}
                onChange={(e) => onUpdateCase(activeCase.id, { status: e.target.value as CaseStatus })}
                className="w-full px-3 py-2 text-xs font-medium text-slate-100 bg-[#0b0f17] border border-slate-700 rounded-lg"
              >
                <option value="Intake">Intake</option>
                <option value="In Examination">In Examination</option>
                <option value="Peer Review">Peer Review</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-slate-200">Evidence Handling SOP (Section 7)</h3>
                <span className="font-mono text-xs text-slate-400 tabular-nums">
                  {activeCase.completedPolicySteps.length}/10
                </span>
              </div>
              <div className="space-y-1">
                {EVIDENCE_HANDLING_STEPS.map((s) => {
                  const done = activeCase.completedPolicySteps.includes(s.step);
                  return (
                    <button
                      key={s.step}
                      type="button"
                      onClick={() => togglePolicyStep(activeCase, s.step)}
                      className="w-full flex items-start gap-2.5 text-left py-1.5 px-2 rounded hover:bg-slate-800/60 transition-colors"
                    >
                      {done ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" aria-hidden="true" />
                      )}
                      <span className={`text-xs ${done ? 'text-slate-100 font-medium' : 'text-slate-400'}`}>
                        {s.step}. {s.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Cases Directory View */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1 p-1 bg-[#131a26] border border-slate-800 rounded-lg w-fit">
              {(['All', 'Intake', 'In Examination', 'Peer Review', 'Closed'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    statusFilter === st ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search case number or title..."
                className="pl-9 pr-3 py-2 text-xs text-slate-100 bg-[#131a26] border border-slate-800 rounded-lg w-64"
              />
            </div>
          </div>

          <div className="bg-[#131a26] border border-slate-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#0f1520] text-slate-400 font-medium">
                    <th className="py-2.5 px-4">Case Number</th>
                    <th className="py-2.5 px-4">Title & Requesting Party</th>
                    <th className="py-2.5 px-4">Division</th>
                    <th className="py-2.5 px-4">Priority</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Examiner</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredCases.map((c) => (
                    <tr key={c.id} className="hover:bg-[#171f2d]">
                      <td className="py-3 px-4 font-mono font-semibold text-sky-400 whitespace-nowrap">
                        {c.caseNumber}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-100">{c.title}</p>
                        <p className="text-slate-400">{c.requestingParty}</p>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{c.division}</td>
                      <td className="py-3 px-4">
                        <PriorityLabel priority={c.priority} />
                      </td>
                      <td className="py-3 px-4">
                        <CaseStatusLabel status={c.status} />
                      </td>
                      <td className="py-3 px-4 text-slate-300 whitespace-nowrap">{c.leadExaminerName}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            onSelectCaseId(c.id);
                            setViewMode('timeline');
                          }}
                          className="text-sky-400 hover:text-sky-300 font-medium whitespace-nowrap"
                        >
                          Open Timeline
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Register Case Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#131a26] border border-slate-700 rounded-lg w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-semibold text-slate-100">Register Forensic Case</h2>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-xs font-medium text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Case Title</label>
                <input
                  required
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g., Endpoint Phishing Payload & Disk Triage"
                  className="w-full px-3 py-2 text-xs text-slate-100 bg-[#0b0f17] border border-slate-700 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Requesting Party</label>
                  <input
                    required
                    type="text"
                    value={form.requestingParty}
                    onChange={(e) => setForm({ ...form, requestingParty: e.target.value })}
                    className="w-full px-3 py-2 text-xs text-slate-100 bg-[#0b0f17] border border-slate-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Authorization Reference</label>
                  <input
                    required
                    type="text"
                    value={form.authorizationRef}
                    onChange={(e) => setForm({ ...form, authorizationRef: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono text-slate-100 bg-[#0b0f17] border border-slate-700 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Division</label>
                  <select
                    value={form.division}
                    onChange={(e) => setForm({ ...form, division: e.target.value as DivisionType })}
                    className="w-full px-2.5 py-2 text-xs text-slate-100 bg-[#0b0f17] border border-slate-700 rounded-lg"
                  >
                    <option value="Computer Forensics">Computer Forensics</option>
                    <option value="Mobile Forensics">Mobile Forensics</option>
                    <option value="Network Forensics">Network Forensics</option>
                    <option value="Digital Evidence Management">Digital Evidence Management</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as CasePriority })}
                    className="w-full px-2.5 py-2 text-xs text-slate-100 bg-[#0b0f17] border border-slate-700 rounded-lg"
                  >
                    <option value="Standard">Standard</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Lead Examiner</label>
                  <select
                    value={form.leadExaminerId}
                    onChange={(e) => setForm({ ...form, leadExaminerId: e.target.value })}
                    className="w-full px-2.5 py-2 text-xs text-slate-100 bg-[#0b0f17] border border-slate-700 rounded-lg"
                  >
                    {state.investigators.map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Scope & Summary</label>
                <textarea
                  rows={3}
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  className="w-full px-3 py-2 text-xs text-slate-100 bg-[#0b0f17] border border-slate-700 rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-300 border border-slate-700 rounded-lg hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-500 disabled:opacity-50"
                >
                  {submitting ? 'Registering...' : 'Register Case'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
