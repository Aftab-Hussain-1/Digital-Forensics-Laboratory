import { ArrowRight, FolderKanban, HardDrive, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import type { DivisionType, LabStatePayload } from '../types/forensics';
import { formatDateTime } from '../utils/crypto';
import { CaseStatusLabel, IntegrityStatusLabel } from './StatusText';

export type ActiveTab =
  | 'dashboard'
  | 'cases'
  | 'evidence'
  | 'verify'
  | 'analysis'
  | 'custody'
  | 'examiners'
  | 'reports'
  | 'proposal-overview'
  | 'proposal-infra'
  | 'proposal-budget';

interface DashboardViewProps {
  state: LabStatePayload;
  onNavigate: (tab: ActiveTab) => void;
  onOpenNewCase: () => void;
  onSelectCaseInWorkspace: (caseId: string) => void;
}

const DIVISION_META: { name: DivisionType; color: string; stroke: string }[] = [
  { name: 'Computer Forensics', color: 'bg-violet-500', stroke: '#8b5cf6' },
  { name: 'Mobile Forensics', color: 'bg-sky-500', stroke: '#0ea5e9' },
  { name: 'Network Forensics', color: 'bg-emerald-500', stroke: '#10b981' },
  { name: 'Digital Evidence Management', color: 'bg-amber-500', stroke: '#f59e0b' },
];

const MONTHLY_SERIES = [
  { month: 'Dec 25', cases: 2, evidence: 4, hashes: 4 },
  { month: 'Jan 26', cases: 3, evidence: 6, hashes: 5 },
  { month: 'Feb 26', cases: 2, evidence: 5, hashes: 5 },
  { month: 'Mar 26', cases: 4, evidence: 9, hashes: 8 },
  { month: 'Apr 26', cases: 3, evidence: 7, hashes: 7 },
  { month: 'May 26', cases: 5, evidence: 11, hashes: 10 },
  { month: 'Jun 26', cases: 4, evidence: 8, hashes: 8 },
  { month: 'Jul 26', cases: 6, evidence: 13, hashes: 12 },
  { month: 'Aug 26', cases: 5, evidence: 10, hashes: 10 },
  { month: 'Sep 26', cases: 4, evidence: 9, hashes: 9 },
  { month: 'Oct 26', cases: 5, evidence: 12, hashes: 11 },
  { month: 'Nov 26', cases: 4, evidence: 5, hashes: 4 },
];

export function DashboardView({
  state,
  onNavigate,
  onOpenNewCase,
  onSelectCaseInWorkspace,
}: DashboardViewProps) {
  const [hoveredDiv, setHoveredDiv] = useState<string | null>(null);
  const [hoveredMonthIdx, setHoveredMonthIdx] = useState<number | null>(null);

  const totalCases = state.cases.length;
  const activeCases = state.cases.filter((c) => c.status !== 'Closed').length;
  const pendingVerify = state.evidence.filter((e) => e.integrityStatus !== 'Verified Match');
  const peerReviewCases = state.cases.filter((c) => c.status === 'Peer Review');

  // Donut SVG math
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  let cumulativeOffset = 0;
  const donutSegments = DIVISION_META.map((div) => {
    const count = state.cases.filter((c) => c.division === div.name).length;
    const fraction = totalCases > 0 ? count / totalCases : 0.25;
    const length = fraction * circumference;
    const offset = cumulativeOffset;
    cumulativeOffset += length;
    return { ...div, count, length, offset };
  });

  // 12-Month Line Chart SVG math
  const chartW = 580;
  const chartH = 150;
  const padX = 24;
  const padY = 16;
  const maxVal = 14;
  const xAt = (i: number) => padX + (i / (MONTHLY_SERIES.length - 1)) * (chartW - padX * 2);
  const yAt = (v: number) => chartH - padY - (v / maxVal) * (chartH - padY * 2);

  const buildPolyline = (key: 'cases' | 'evidence' | 'hashes') =>
    MONTHLY_SERIES.map((d, i) => `${xAt(i).toFixed(1)},${yAt(d[key]).toFixed(1)}`).join(' ');

  const todayLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Centered Briefing Header inspired by Reference Screen 1 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <p className="text-xs font-medium text-slate-400">{todayLabel}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-100">
            Forensic Operations Command
          </h1>
          <p className="mt-0.5 text-xs text-slate-400">
            Active cases, cryptographic integrity metrics, and chain-of-custody activity across 4 divisions.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => onNavigate('verify')}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-200 bg-[#151c28] border border-slate-700 rounded-lg hover:bg-[#1c2536] transition-colors whitespace-nowrap shrink-0"
          >
            <ShieldCheck className="w-4 h-4 text-sky-400" aria-hidden="true" />
            <span>SHA-256 Verifier</span>
          </button>
          <button
            type="button"
            onClick={onOpenNewCase}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-500 transition-colors whitespace-nowrap shrink-0"
          >
            <span>Register Case</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Row 1: Case Load Assignments (Donut) + Cases & Evidence 12-Month Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-4 bg-[#131a26] border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-100">Case Load Assignments</h2>
            <span className="text-xs font-mono text-slate-400 tabular-nums">{activeCases} active</span>
          </div>

          <div className="my-4 flex items-center justify-center">
            <div className="relative w-36 h-36">
              <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="18"
                />
                {donutSegments.map((seg) => (
                  <circle
                    key={seg.name}
                    cx="70"
                    cy="70"
                    r={radius}
                    fill="none"
                    stroke={seg.stroke}
                    strokeWidth={hoveredDiv === seg.name ? '21' : '18'}
                    strokeDasharray={`${seg.length} ${circumference}`}
                    strokeDashoffset={-seg.offset}
                    className="transition-all duration-150 cursor-pointer"
                    onMouseEnter={() => setHoveredDiv(seg.name)}
                    onMouseLeave={() => setHoveredDiv(null)}
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-semibold text-slate-100 tabular-nums">{totalCases}</span>
                <span className="text-[11px] text-slate-400">Total Cases</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
            {donutSegments.map((seg) => (
              <div
                key={seg.name}
                onMouseEnter={() => setHoveredDiv(seg.name)}
                onMouseLeave={() => setHoveredDiv(null)}
                className="flex items-center justify-between gap-2 px-1.5 py-1 rounded hover:bg-slate-800/60 cursor-default"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={`w-2 h-2 rounded-xs shrink-0 ${seg.color}`} />
                  <span className="text-slate-300 truncate">{seg.name.replace(' Forensics', '').replace('Digital Evidence ', '')}</span>
                </div>
                <span className="font-mono text-slate-400 tabular-nums">{seg.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-8 bg-[#131a26] border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">Cases & Evidence Activity (12 Months)</h2>
              <p className="text-xs text-slate-400">Monthly intake, evidence items, and SHA-256 verification volume</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="inline-flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-0.5 bg-sky-400 inline-block" /> Cases
              </span>
              <span className="inline-flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-0.5 bg-amber-400 inline-block" /> Evidence
              </span>
              <span className="inline-flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-0.5 bg-emerald-400 inline-block" /> Verified
              </span>
            </div>
          </div>

          <div className="mt-4 relative">
            <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-44 overflow-visible">
              {[0, 4, 8, 12].map((tick) => {
                const y = yAt(tick);
                return (
                  <g key={tick}>
                    <line x1={padX} y1={y} x2={chartW - padX} y2={y} stroke="#1e293b" strokeWidth="1" />
                    <text x={4} y={y + 3} fill="#64748b" fontSize="10" fontFamily="JetBrains Mono, monospace">
                      {tick}
                    </text>
                  </g>
                );
              })}

              <polyline fill="none" stroke="#38bdf8" strokeWidth="2" points={buildPolyline('cases')} />
              <polyline fill="none" stroke="#f59e0b" strokeWidth="2" points={buildPolyline('evidence')} />
              <polyline fill="none" stroke="#10b981" strokeWidth="2" points={buildPolyline('hashes')} />

              {MONTHLY_SERIES.map((d, i) => (
                <g key={d.month}>
                  <circle cx={xAt(i)} cy={yAt(d.cases)} r="3" fill="#38bdf8" />
                  <circle cx={xAt(i)} cy={yAt(d.evidence)} r="3" fill="#f59e0b" />
                  <circle cx={xAt(i)} cy={yAt(d.hashes)} r="3" fill="#10b981" />
                  <rect
                    x={xAt(i) - 18}
                    y={0}
                    width={36}
                    height={chartH}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredMonthIdx(i)}
                    onMouseLeave={() => setHoveredMonthIdx(null)}
                  />
                </g>
              ))}
            </svg>

            <div className="flex justify-between px-4 text-[10px] font-mono text-slate-500 mt-1">
              {MONTHLY_SERIES.filter((_, idx) => idx % 2 === 0).map((d) => (
                <span key={d.month}>{d.month}</span>
              ))}
            </div>

            {hoveredMonthIdx !== null && (
              <div className="mt-2 flex items-center justify-between px-3 py-1.5 bg-[#0b0f17] border border-slate-700 rounded text-xs font-mono text-slate-300 tabular-nums">
                <span>{MONTHLY_SERIES[hoveredMonthIdx].month}</span>
                <span>
                  Cases: {MONTHLY_SERIES[hoveredMonthIdx].cases} · Evidence:{' '}
                  {MONTHLY_SERIES[hoveredMonthIdx].evidence} · Verified:{' '}
                  {MONTHLY_SERIES[hoveredMonthIdx].hashes}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Active Cases Table */}
      <div className="bg-[#131a26] border border-slate-800 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-sky-400" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-slate-100">Active Case Queue</h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('cases')}
            className="text-xs font-medium text-sky-400 hover:text-sky-300"
          >
            Open Investigation Workspace
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-[#0f1520] text-slate-400 font-medium">
                <th className="py-2.5 px-4">Case Number</th>
                <th className="py-2.5 px-4">Case Title & Division</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Lead Examiner</th>
                <th className="py-2.5 px-4">Requesting Party</th>
                <th className="py-2.5 px-4 text-right">Policy</th>
                <th className="py-2.5 px-4 text-right">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {state.cases.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => onSelectCaseInWorkspace(c.id)}
                  className="hover:bg-[#192232] cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 font-mono font-semibold text-sky-400 whitespace-nowrap tabular-nums">
                    {c.caseNumber}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-slate-100">{c.title}</p>
                    <p className="text-slate-400">{c.division}</p>
                  </td>
                  <td className="py-3 px-4">
                    <CaseStatusLabel status={c.status} />
                  </td>
                  <td className="py-3 px-4 text-slate-300 whitespace-nowrap">{c.leadExaminerName}</td>
                  <td className="py-3 px-4 text-slate-400">{c.requestingParty}</td>
                  <td className="py-3 px-4 text-right font-mono text-slate-300 tabular-nums whitespace-nowrap">
                    {c.completedPolicySteps.length}/10
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-400 tabular-nums whitespace-nowrap">
                    {formatDateTime(c.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 3: Upcoming Tasks & Recent Evidence Intake */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-[#131a26] border border-slate-800 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-slate-100">Pending Forensic Tasks</h2>
            <span className="text-xs font-mono text-slate-400 tabular-nums">
              {pendingVerify.length + peerReviewCases.length} open
            </span>
          </div>
          <div className="divide-y divide-slate-800/80">
            {pendingVerify.map((ev) => (
              <div key={ev.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-100 truncate">
                    Verify baseline SHA-256 for {ev.description}
                  </p>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                    {ev.evidenceCode} · {ev.caseNumber} · Custodian: {ev.currentCustodian}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('verify')}
                  className="px-2.5 py-1 text-xs font-medium text-sky-400 bg-sky-500/10 border border-sky-500/30 rounded hover:bg-sky-500/20 whitespace-nowrap shrink-0"
                >
                  Verify Hash
                </button>
              </div>
            ))}
            {peerReviewCases.map((c) => (
              <div key={c.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-100 truncate">
                    QA Peer Review & Report Sign-Off: {c.title}
                  </p>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                    {c.caseNumber} · Examiner: {c.leadExaminerName}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('reports')}
                  className="px-2.5 py-1 text-xs font-medium text-violet-300 bg-violet-500/10 border border-violet-500/30 rounded hover:bg-violet-500/20 whitespace-nowrap shrink-0"
                >
                  Open Report
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#131a26] border border-slate-800 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-slate-400" aria-hidden="true" />
              <h2 className="text-sm font-semibold text-slate-100">Evidence Integrity Snapshot</h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('evidence')}
              className="text-xs font-medium text-sky-400 hover:text-sky-300"
            >
              View inventory
            </button>
          </div>
          <div className="divide-y divide-slate-800/80">
            {state.evidence.slice(0, 4).map((ev) => (
              <div key={ev.id} className="px-5 py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                    <span className="text-sky-400 font-semibold">{ev.evidenceCode}</span>
                    <span>·</span>
                    <span>{ev.caseNumber}</span>
                    <span>·</span>
                    <span>{ev.mediaType}</span>
                  </div>
                  <p className="text-xs font-medium text-slate-100 truncate mt-0.5">{ev.description}</p>
                </div>
                <IntegrityStatusLabel status={ev.integrityStatus} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
