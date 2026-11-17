import { FilePlus2, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { HR_PLAN } from '../data/proposalData';
import type { Investigator, LabStatePayload } from '../types/forensics';
import { formatDateTime } from '../utils/crypto';

interface ExaminersNotesViewProps {
  state: LabStatePayload;
  onAddNote: (payload: {
    caseId: string;
    evidenceCode: string;
    examinerName: string;
    toolUsed: string;
    findingTitle: string;
    content: string;
  }) => Promise<void>;
  onAddInvestigator: (payload: {
    fullName: string;
    roleTitle: string;
    division: Investigator['division'];
    certifications: string[];
    email: string;
    clearanceLevel: string;
  }) => Promise<void>;
}

export function ExaminersNotesView({ state, onAddNote, onAddInvestigator }: ExaminersNotesViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'notes' | 'roster'>('notes');
  const [filterCaseId, setFilterCaseId] = useState<string>('All');

  const [noteForm, setNoteForm] = useState({
    caseId: state.cases[0]?.id ?? '',
    evidenceCode: state.evidence[0]?.evidenceCode ?? '',
    examinerName: 'Ayesha Siddiqui',
    toolUsed: 'Autopsy / The Sleuth Kit',
    findingTitle: '',
    content: '',
  });
  const [savingNote, setSavingNote] = useState(false);

  const [invForm, setInvForm] = useState({
    fullName: '',
    roleTitle: 'Digital Forensic Examiner',
    division: 'Computer Forensics' as Investigator['division'],
    certifications: 'GCFE, EnCE',
    email: '',
    clearanceLevel: 'Level 2 — Examiner',
  });
  const [savingInv, setSavingInv] = useState(false);

  const filteredNotes =
    filterCaseId === 'All' ? state.notes : state.notes.filter((n) => n.caseId === filterCaseId);

  const handleNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteForm.findingTitle.trim() || !noteForm.content.trim()) return;
    setSavingNote(true);
    try {
      await onAddNote(noteForm);
      setNoteForm((prev) => ({ ...prev, findingTitle: '', content: '' }));
    } finally {
      setSavingNote(false);
    }
  };

  const handleInvSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invForm.fullName.trim()) return;
    setSavingInv(true);
    try {
      await onAddInvestigator({
        ...invForm,
        certifications: invForm.certifications
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      });
      setInvForm((prev) => ({ ...prev, fullName: '', email: '' }));
    } finally {
      setSavingInv(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-100">
            Examination Notes & Investigator Records
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Document forensic findings by validated tool and manage laboratory examiners and QA personnel.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#131a26] border border-slate-800 rounded-lg w-fit">
          <button
            type="button"
            onClick={() => setActiveSubTab('notes')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeSubTab === 'notes' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Examination Notes ({state.notes.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('roster')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeSubTab === 'roster' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Investigator Roster ({state.investigators.length})
          </button>
        </div>
      </div>

      {activeSubTab === 'notes' ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          <div className="bg-[#131a26] border border-slate-800 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-slate-100">Record Examination Note</h2>
            <p className="text-xs text-slate-400 mt-0.5">Timestamped technical finding linked to case</p>

            <form onSubmit={handleNoteSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Case</label>
                <select
                  value={noteForm.caseId}
                  onChange={(e) => setNoteForm({ ...noteForm, caseId: e.target.value })}
                  className="w-full px-3 py-2 text-xs text-slate-100 bg-[#0b0f17] border border-slate-700 rounded-lg"
                >
                  {state.cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.caseNumber} — {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Evidence Ref</label>
                  <select
                    value={noteForm.evidenceCode}
                    onChange={(e) => setNoteForm({ ...noteForm, evidenceCode: e.target.value })}
                    className="w-full px-2.5 py-2 text-xs text-slate-100 bg-[#0b0f17] border border-slate-700 rounded-lg"
                  >
                    <option value="Case-Wide">Case-Wide</option>
                    {state.evidence.map((ev) => (
                      <option key={ev.id} value={ev.evidenceCode}>
                        {ev.evidenceCode}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Examiner</label>
                  <select
                    value={noteForm.examinerName}
                    onChange={(e) => setNoteForm({ ...noteForm, examinerName: e.target.value })}
                    className="w-full px-2.5 py-2 text-xs text-slate-100 bg-[#0b0f17] border border-slate-700 rounded-lg"
                  >
                    {state.investigators.map((inv) => (
                      <option key={inv.id} value={inv.fullName}>
                        {inv.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Validated Tool Used</label>
                <select
                  value={noteForm.toolUsed}
                  onChange={(e) => setNoteForm({ ...noteForm, toolUsed: e.target.value })}
                  className="w-full px-3 py-2 text-xs text-slate-100 bg-[#0b0f17] border border-slate-700 rounded-lg"
                >
                  <option value="Autopsy / The Sleuth Kit">Autopsy / The Sleuth Kit</option>
                  <option value="FTK Imager">FTK Imager</option>
                  <option value="Wireshark">Wireshark</option>
                  <option value="Volatility 3">Volatility 3</option>
                  <option value="KAPE">KAPE</option>
                  <option value="SQLite Browser">SQLite Browser</option>
                  <option value="Python Forensic Script">Python Forensic Script</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Finding Title</label>
                <input
                  required
                  type="text"
                  value={noteForm.findingTitle}
                  onChange={(e) => setNoteForm({ ...noteForm, findingTitle: e.target.value })}
                  placeholder="e.g., Deleted Browser History SQLite Recovery"
                  className="w-full px-3 py-2 text-xs text-slate-100 bg-[#0b0f17] border border-slate-700 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Technical Observations</label>
                <textarea
                  required
                  rows={4}
                  value={noteForm.content}
                  onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                  placeholder="Include artifact paths, UTC timestamps, offset details, and methodology..."
                  className="w-full px-3 py-2 text-xs text-slate-100 bg-[#0b0f17] border border-slate-700 rounded-lg"
                />
              </div>

              <button
                type="submit"
                disabled={savingNote}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-500 disabled:opacity-50"
              >
                <FilePlus2 className="w-4 h-4" aria-hidden="true" />
                <span>{savingNote ? 'Saving...' : 'Save Examination Note'}</span>
              </button>
            </form>
          </div>

          <div className="xl:col-span-2 space-y-4">
            <div className="flex items-center justify-between bg-[#131a26] border border-slate-800 rounded-lg px-5 py-3">
              <span className="text-xs font-medium text-slate-300">Filter Notes by Case</span>
              <select
                value={filterCaseId}
                onChange={(e) => setFilterCaseId(e.target.value)}
                className="px-3 py-1.5 text-xs text-slate-100 bg-[#0b0f17] border border-slate-700 rounded-lg"
              >
                <option value="All">All Cases</option>
                {state.cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.caseNumber} — {c.title}
                  </option>
                ))}
              </select>
            </div>

            {filteredNotes.map((n) => (
              <article key={n.id} className="bg-[#131a26] border border-slate-800 rounded-lg p-5 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-sky-400">{n.caseNumber}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-slate-200">{n.evidenceCode}</span>
                    <span aria-hidden="true">·</span>
                    <span>{n.toolUsed}</span>
                  </div>
                  <span className="font-mono tabular-nums">{formatDateTime(n.createdAt)}</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-100">{n.findingTitle}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{n.content}</p>
                <p className="text-xs text-slate-500 pt-1">Recorded by {n.examinerName}</p>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-[#131a26] border border-slate-800 rounded-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-800">
                <h2 className="text-sm font-semibold text-slate-100">Active Laboratory Personnel</h2>
                <p className="text-xs text-slate-400">Aligned with Section 9 Staffing Plan (7 core positions)</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-[#0f1520] text-slate-400 font-medium">
                      <th className="py-2.5 px-4">ID</th>
                      <th className="py-2.5 px-4">Name & Role</th>
                      <th className="py-2.5 px-4">Division</th>
                      <th className="py-2.5 px-4">Certifications</th>
                      <th className="py-2.5 px-4 text-right">Assigned Cases</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {state.investigators.map((inv) => {
                      const assignedCount = state.cases.filter(
                        (c) => c.leadExaminerId === inv.id && c.status !== 'Closed'
                      ).length;
                      return (
                        <tr key={inv.id} className="hover:bg-[#171f2d]">
                          <td className="py-3 px-4 font-mono text-sky-400 whitespace-nowrap">{inv.employeeCode}</td>
                          <td className="py-3 px-4">
                            <p className="font-semibold text-slate-100">{inv.fullName}</p>
                            <p className="text-slate-400">{inv.roleTitle}</p>
                          </td>
                          <td className="py-3 px-4 text-slate-300">{inv.division}</td>
                          <td className="py-3 px-4 font-mono text-slate-400">
                            {inv.certifications.join(' · ') || '—'}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-semibold text-slate-100 tabular-nums">
                            {assignedCount}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-[#131a26] border border-slate-800 rounded-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-800">
                <h2 className="text-sm font-semibold text-slate-100">Proposed Organizational Structure (Section 9)</h2>
              </div>
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#0f1520] font-medium text-slate-400">
                    <th className="py-2.5 px-4">Position</th>
                    <th className="py-2.5 px-4 text-right">Headcount</th>
                    <th className="py-2.5 px-4">Core Mandate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {HR_PLAN.map((row) => (
                    <tr key={row.position}>
                      <td className="py-2.5 px-4 font-medium text-slate-100">{row.position}</td>
                      <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-100">{row.count}</td>
                      <td className="py-2.5 px-4 text-slate-400">{row.responsibilities}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-[#131a26] border border-slate-800 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-slate-100">Register Laboratory Staff</h2>
            <p className="text-xs text-slate-400 mt-0.5">Add authorized examiner or QA staff</p>
            <form onSubmit={handleInvSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <input
                  required
                  type="text"
                  value={invForm.fullName}
                  onChange={(e) => setInvForm({ ...invForm, fullName: e.target.value })}
                  placeholder="e.g., Kamran Hussain"
                  className="w-full px-3 py-2 text-xs text-slate-100 bg-[#0b0f17] border border-slate-700 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Role Title</label>
                <input
                  required
                  type="text"
                  value={invForm.roleTitle}
                  onChange={(e) => setInvForm({ ...invForm, roleTitle: e.target.value })}
                  className="w-full px-3 py-2 text-xs text-slate-100 bg-[#0b0f17] border border-slate-700 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Division</label>
                <select
                  value={invForm.division}
                  onChange={(e) => setInvForm({ ...invForm, division: e.target.value as Investigator['division'] })}
                  className="w-full px-3 py-2 text-xs text-slate-100 bg-[#0b0f17] border border-slate-700 rounded-lg"
                >
                  <option value="Computer Forensics">Computer Forensics</option>
                  <option value="Mobile Forensics">Mobile Forensics</option>
                  <option value="Network Forensics">Network Forensics</option>
                  <option value="Digital Evidence Management">Digital Evidence Management</option>
                  <option value="Quality & Administration">Quality & Administration</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Certifications (comma-separated)</label>
                <input
                  type="text"
                  value={invForm.certifications}
                  onChange={(e) => setInvForm({ ...invForm, certifications: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono text-slate-100 bg-[#0b0f17] border border-slate-700 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Clearance Level</label>
                <input
                  type="text"
                  value={invForm.clearanceLevel}
                  onChange={(e) => setInvForm({ ...invForm, clearanceLevel: e.target.value })}
                  className="w-full px-3 py-2 text-xs text-slate-100 bg-[#0b0f17] border border-slate-700 rounded-lg"
                />
              </div>
              <button
                type="submit"
                disabled={savingInv}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-500 disabled:opacity-50"
              >
                <UserPlus className="w-4 h-4" aria-hidden="true" />
                <span>{savingInv ? 'Adding...' : 'Add Personnel Record'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
