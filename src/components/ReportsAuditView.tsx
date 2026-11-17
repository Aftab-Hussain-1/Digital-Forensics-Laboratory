import { Download, Printer, Search } from 'lucide-react';
import { useState } from 'react';
import type { AuditRecord, LabStatePayload } from '../types/forensics';
import { formatDateTime } from '../utils/crypto';
import { CaseStatusLabel, IntegrityStatusLabel } from './StatusText';

interface ReportsAuditViewProps {
  state: LabStatePayload;
}

export function ReportsAuditView({ state }: ReportsAuditViewProps) {
  const [subTab, setSubTab] = useState<'report' | 'audit'>('report');
  const [selectedCaseId, setSelectedCaseId] = useState<string>(state.cases[0]?.id ?? '');
  const [auditFilter, setAuditFilter] = useState<'All' | AuditRecord['targetType']>('All');
  const [auditSearch, setAuditSearch] = useState('');

  const selectedCase = state.cases.find((c) => c.id === selectedCaseId) ?? state.cases[0];
  const caseEvidence = selectedCase
    ? state.evidence.filter((e) => e.caseId === selectedCase.id)
    : [];
  const caseCustody = selectedCase
    ? state.custodyTransfers.filter((t) => t.caseNumber === selectedCase.caseNumber)
    : [];
  const caseNotes = selectedCase
    ? state.notes.filter((n) => n.caseId === selectedCase.id)
    : [];
  const caseVerifications = selectedCase
    ? state.verifications.filter((v) => v.caseNumber === selectedCase.caseNumber)
    : [];

  const filteredAudit = state.auditLogs.filter((log) => {
    const matchesType = auditFilter === 'All' || log.targetType === auditFilter;
    const q = auditSearch.trim().toLowerCase();
    const matchesQuery =
      !q ||
      log.actor.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.targetId.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q);
    return matchesType && matchesQuery;
  });

  const handleDownloadMarkdown = () => {
    if (!selectedCase) return;
    const lines = [
      `# DIGITAL FORENSICS LABORATORY — TECHNICAL EXAMINATION REPORT`,
      ``,
      `- **Case Number:** ${selectedCase.caseNumber}`,
      `- **Title:** ${selectedCase.title}`,
      `- **Division:** ${selectedCase.division}`,
      `- **Requesting Party:** ${selectedCase.requestingParty}`,
      `- **Authorization Reference:** ${selectedCase.authorizationRef}`,
      `- **Lead Examiner:** ${selectedCase.leadExaminerName}`,
      `- **Status:** ${selectedCase.status}`,
      `- **Opened:** ${selectedCase.openedAt}`,
      ``,
      `## Scope & Summary`,
      selectedCase.summary,
      ``,
      `## Evidence Inventory & SHA-256 Baselines`,
      ...caseEvidence.map(
        (ev) =>
          `- **${ev.evidenceCode}** (${ev.mediaType}, S/N: ${ev.serialNumber}): ${ev.description}\n  - Baseline SHA-256: \`${ev.baselineSha256}\`\n  - Integrity Status: ${ev.integrityStatus}\n  - Acquisition: ${ev.acquisitionMethod}`
      ),
      ``,
      `## Chain of Custody`,
      ...caseCustody.map(
        (t) =>
          `- ${t.transferredAt} | **${t.evidenceCode}** | ${t.fromHolder} -> ${t.toHolder} | Purpose: ${t.purpose} | Seal: ${t.sealNumber}`
      ),
      ``,
      `## Technical Examination Notes`,
      ...caseNotes.map(
        (n) =>
          `### ${n.findingTitle} (${n.toolUsed})\n*Examiner: ${n.examinerName} · ${n.createdAt}*\n\n${n.content}\n`
      ),
      `---`,
      `Prepared in accordance with ISO/IEC 17025, ISO/IEC 27001, and ISO/IEC 27037 procedural principles.`,
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedCase.caseNumber}_Examination_Report.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAuditCsv = () => {
    const headers = ['Timestamp', 'Actor', 'Action', 'TargetType', 'TargetID', 'Details'];
    const rows = filteredAudit.map((r) =>
      [r.timestamp, r.actor, r.action, r.targetType, r.targetId, r.details]
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'DFL_Audit_Activity_Log.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-100">
            Printable Reports & Audit Records
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Generate formal case examination dossiers for print/PDF and review immutable laboratory activity records.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#131a26] border border-slate-800 rounded-lg w-fit">
          <button
            type="button"
            onClick={() => setSubTab('report')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              subTab === 'report' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Printable Case Report
          </button>
          <button
            type="button"
            onClick={() => setSubTab('audit')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              subTab === 'audit' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Audit & Activity Log ({state.auditLogs.length})
          </button>
        </div>
      </div>

      {subTab === 'report' && selectedCase ? (
        <div className="space-y-5">
          <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#131a26] border border-slate-800 rounded-lg px-5 py-3.5">
            <div className="flex items-center gap-3">
              <label htmlFor="report-case-select" className="text-xs font-medium text-slate-300 whitespace-nowrap">
                Select Case Dossier
              </label>
              <select
                id="report-case-select"
                value={selectedCase.id}
                onChange={(e) => setSelectedCaseId(e.target.value)}
                className="px-3 py-1.5 text-xs text-slate-100 bg-[#0b0f17] border border-slate-700 rounded-lg"
              >
                {state.cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.caseNumber} — {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleDownloadMarkdown}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-200 bg-[#0b0f17] border border-slate-700 rounded-lg hover:bg-slate-800"
              >
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Export Markdown</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-500"
              >
                <Printer className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>

          <div className="print-only-container bg-[#131a26] border border-slate-800 rounded-lg p-8 space-y-8">
            <header className="border-b border-slate-700 pb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-slate-400">
                  Digital Forensics Laboratory · Private Organization
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-100">
                  Digital Forensic Examination & Chain-of-Custody Report
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Confidential — Prepared for authorized legal, audit, and incident response review
                </p>
              </div>
              <div className="text-left sm:text-right text-xs space-y-1">
                <p className="font-mono font-semibold text-sky-400">{selectedCase.caseNumber}</p>
                <p className="text-slate-400 font-mono tabular-nums">
                  Generated: {formatDateTime(new Date().toISOString())}
                </p>
                <CaseStatusLabel status={selectedCase.status} />
              </div>
            </header>

            <section className="print-break-inside-avoid">
              <h3 className="text-sm font-semibold text-slate-100 mb-3">1. Case Identification & Scope</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5 text-xs border border-slate-800 rounded-lg p-4 bg-[#0b0f17]">
                <div>
                  <span className="text-slate-400">Case Title:</span>{' '}
                  <span className="font-medium text-slate-100">{selectedCase.title}</span>
                </div>
                <div>
                  <span className="text-slate-400">Laboratory Division:</span>{' '}
                  <span className="font-medium text-slate-100">{selectedCase.division}</span>
                </div>
                <div>
                  <span className="text-slate-400">Requesting Party:</span>{' '}
                  <span className="font-medium text-slate-100">{selectedCase.requestingParty}</span>
                </div>
                <div>
                  <span className="text-slate-400">Authorization Ref:</span>{' '}
                  <span className="font-mono font-medium text-slate-100">{selectedCase.authorizationRef}</span>
                </div>
                <div>
                  <span className="text-slate-400">Lead Examiner:</span>{' '}
                  <span className="font-medium text-slate-100">{selectedCase.leadExaminerName}</span>
                </div>
                <div>
                  <span className="text-slate-400">Opened Date:</span>{' '}
                  <span className="font-mono tabular-nums text-slate-100">{formatDateTime(selectedCase.openedAt)}</span>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-300 leading-relaxed">{selectedCase.summary}</p>
            </section>

            <section className="print-break-inside-avoid">
              <h3 className="text-sm font-semibold text-slate-100 mb-3">
                2. Evidence Inventory & Cryptographic Hashes (SHA-256)
              </h3>
              {caseEvidence.length === 0 ? (
                <p className="text-xs text-slate-400">No evidence items registered under this case.</p>
              ) : (
                <div className="overflow-x-auto border border-slate-800 rounded-lg">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 bg-[#0b0f17] font-medium text-slate-400">
                        <th className="py-2 px-3">Evidence ID</th>
                        <th className="py-2 px-3">Description & Serial</th>
                        <th className="py-2 px-3">Acquisition Method</th>
                        <th className="py-2 px-3">Integrity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {caseEvidence.map((ev) => (
                        <tr key={ev.id}>
                          <td className="py-2.5 px-3 font-mono font-semibold text-sky-400 align-top">
                            {ev.evidenceCode}
                          </td>
                          <td className="py-2.5 px-3 align-top">
                            <p className="font-medium text-slate-100">{ev.description}</p>
                            <p className="text-slate-400 mt-0.5">
                              {ev.mediaType} · S/N: {ev.serialNumber}
                            </p>
                            <p className="font-mono text-[10px] text-emerald-400 mt-1 break-all">
                              SHA-256: {ev.baselineSha256}
                            </p>
                          </td>
                          <td className="py-2.5 px-3 text-slate-300 align-top">
                            <p>{ev.acquisitionMethod}</p>
                            <p className="font-mono text-slate-400 mt-0.5">Copy: {ev.forensicCopyId}</p>
                          </td>
                          <td className="py-2.5 px-3 align-top">
                            <IntegrityStatusLabel status={ev.integrityStatus} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="print-break-inside-avoid">
              <h3 className="text-sm font-semibold text-slate-100 mb-3">3. Chain-of-Custody Chronology</h3>
              {caseCustody.length === 0 ? (
                <p className="text-xs text-slate-400">No custody transfer events recorded yet.</p>
              ) : (
                <div className="overflow-x-auto border border-slate-800 rounded-lg">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 bg-[#0b0f17] font-medium text-slate-400">
                        <th className="py-2 px-3">Timestamp</th>
                        <th className="py-2 px-3">Evidence</th>
                        <th className="py-2 px-3">From</th>
                        <th className="py-2 px-3">To</th>
                        <th className="py-2 px-3">Purpose & Seal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {caseCustody.map((t) => (
                        <tr key={t.id}>
                          <td className="py-2 px-3 font-mono tabular-nums text-slate-400 whitespace-nowrap">
                            {formatDateTime(t.transferredAt)}
                          </td>
                          <td className="py-2 px-3 font-mono font-medium text-sky-400">{t.evidenceCode}</td>
                          <td className="py-2 px-3 text-slate-300">{t.fromHolder}</td>
                          <td className="py-2 px-3 text-slate-100 font-medium">{t.toHolder}</td>
                          <td className="py-2 px-3 text-slate-300">
                            {t.purpose} (Seal: <span className="font-mono">{t.sealNumber}</span>)
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="print-break-inside-avoid">
              <h3 className="text-sm font-semibold text-slate-100 mb-3">
                4. Technical Examination Findings ({caseNotes.length} notes · {caseVerifications.length} hash checks)
              </h3>
              {caseNotes.length === 0 ? (
                <p className="text-xs text-slate-400">No examination notes recorded for this case yet.</p>
              ) : (
                <div className="space-y-3">
                  {caseNotes.map((n) => (
                    <div key={n.id} className="border border-slate-800 bg-[#0b0f17] rounded-lg p-3.5 text-xs">
                      <div className="flex items-center justify-between text-slate-400 mb-1">
                        <span className="font-semibold text-slate-100">
                          {n.findingTitle} ({n.evidenceCode})
                        </span>
                        <span className="font-mono tabular-nums">
                          {n.toolUsed} · {formatDateTime(n.createdAt)}
                        </span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">{n.content}</p>
                      <p className="mt-1.5 text-slate-500">Examiner: {n.examinerName}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <footer className="print-break-inside-avoid border-t border-slate-700 pt-5 space-y-4">
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Procedural Alignment Notice: Examination procedures follow documented laboratory SOPs aligned with ISO/IEC 17025 principles, ISO/IEC 27001 information security controls, and ISO/IEC 27037 digital evidence preservation guidance. Formal third-party accreditation is subject to separate conformity assessment.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-3 text-xs">
                <div className="border-t border-slate-700 pt-2">
                  <p className="font-medium text-slate-100">{selectedCase.leadExaminerName}</p>
                  <p className="text-slate-400">Lead Forensic Examiner</p>
                </div>
                <div className="border-t border-slate-700 pt-2">
                  <p className="font-medium text-slate-100">Dr. Nadia Javed</p>
                  <p className="text-slate-400">Quality Assurance Reviewer</p>
                </div>
                <div className="border-t border-slate-700 pt-2">
                  <p className="font-medium text-slate-100">Tariq Mahmood</p>
                  <p className="text-slate-400">Laboratory Director</p>
                </div>
              </div>
            </footer>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1 p-1 bg-[#131a26] border border-slate-800 rounded-lg w-fit">
              {(['All', 'Case', 'Evidence', 'HashVerification', 'Custody', 'Note', 'Proposal'] as const).map(
                (t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setAuditFilter(t)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      auditFilter === t ? 'bg-slate-800 text-white' : 'text-slate-400'
                    }`}
                  >
                    {t}
                  </button>
                )
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                <input
                  type="text"
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  placeholder="Search audit events..."
                  className="pl-9 pr-3 py-2 text-xs text-slate-100 bg-[#131a26] border border-slate-800 rounded-lg w-56"
                />
              </div>
              <button
                type="button"
                onClick={handleDownloadAuditCsv}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-200 bg-[#131a26] border border-slate-700 rounded-lg hover:bg-slate-800 whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Download CSV</span>
              </button>
            </div>
          </div>

          <div className="bg-[#131a26] border border-slate-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#0f1520] text-slate-400 font-medium">
                    <th className="py-2.5 px-4">Timestamp</th>
                    <th className="py-2.5 px-4">Actor</th>
                    <th className="py-2.5 px-4">Action</th>
                    <th className="py-2.5 px-4">Target</th>
                    <th className="py-2.5 px-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredAudit.map((row) => (
                    <tr key={row.id} className="hover:bg-[#171f2d]">
                      <td className="py-3 px-4 font-mono text-slate-400 tabular-nums whitespace-nowrap">
                        {formatDateTime(row.timestamp)}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-100 whitespace-nowrap">{row.actor}</td>
                      <td className="py-3 px-4 font-mono text-sky-400 whitespace-nowrap">{row.action}</td>
                      <td className="py-3 px-4 font-mono text-slate-300 whitespace-nowrap">
                        {row.targetType} · {row.targetId}
                      </td>
                      <td className="py-3 px-4 text-slate-300">{row.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
