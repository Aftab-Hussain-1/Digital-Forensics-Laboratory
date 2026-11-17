import { CheckCircle2, HardDrive, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import {
  BUDGET_ITEMS,
  COMPLIANCE_STANDARDS,
  EVIDENCE_HANDLING_STEPS,
  HARDWARE_REQUIREMENTS,
  IMPLEMENTATION_TIMELINE,
  LABORATORY_DIVISIONS,
  PHYSICAL_INFRASTRUCTURE,
  PROJECT_OBJECTIVES,
  PROPOSAL_METADATA,
  RISK_REGISTER,
  SOFTWARE_TOOLS,
  WORKSTATION_BASELINE,
} from '../data/proposalData';
import type { LabStatePayload } from '../types/forensics';
import { formatDateTime, formatPkr } from '../utils/crypto';

export function ProposalOverviewView() {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch border-b border-slate-800 pb-8">
        <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
          <div>
            <p className="text-xs font-medium text-slate-400">
              {PROPOSAL_METADATA.organizationType} · {PROPOSAL_METADATA.deploymentPlatform} Deployment · {PROPOSAL_METADATA.documentStatus}
            </p>
            <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-slate-100 text-balance">
              Establishment of a Digital Forensics Laboratory
            </h1>
            <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
              This proposal outlines the establishment of a dedicated, access-controlled Digital Forensics Laboratory providing digital investigation, evidence preservation, forensic examination, incident analysis, and technically defensible reporting across computer, mobile, storage, and network domains.
            </p>
            <p className="mt-2.5 text-xs sm:text-sm text-slate-400 leading-relaxed">
              Target architecture pairs a Windows 11 Pro / Enterprise forensic workstation environment with a centralized Laboratory Management System (proposed Python Flask / SQLite production stack) enforcing SHA-256 verification and unbroken chain-of-custody documentation.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-[#131a26] border border-slate-800 rounded-lg p-3.5">
              <p className="text-xs text-slate-400">Divisions</p>
              <p className="mt-1 text-xl font-semibold text-slate-100 tabular-nums">4</p>
            </div>
            <div className="bg-[#131a26] border border-slate-800 rounded-lg p-3.5">
              <p className="text-xs text-slate-400">Core Staff</p>
              <p className="mt-1 text-xl font-semibold text-slate-100 tabular-nums">7</p>
            </div>
            <div className="bg-[#131a26] border border-slate-800 rounded-lg p-3.5">
              <p className="text-xs text-slate-400">Investment</p>
              <p className="mt-1 text-lg font-semibold font-mono text-sky-400 tabular-nums">9.735M PKR</p>
            </div>
            <div className="bg-[#131a26] border border-slate-800 rounded-lg p-3.5">
              <p className="text-xs text-slate-400">Rollout</p>
              <p className="mt-1 text-xl font-semibold text-slate-100 tabular-nums">18 Weeks</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="h-full min-h-[260px] bg-[#131a26] border border-slate-800 rounded-lg overflow-hidden">
            {!imgError ? (
              <img
                src="/src/assets/images/lab_facility_interior_1794843798866.jpg"
                alt="Access-controlled Digital Forensics Laboratory interior with dual-monitor workstations and secure steel evidence cabinets"
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                <ShieldCheck className="w-8 h-8 text-sky-400 mb-2" aria-hidden="true" />
                <p className="text-sm font-medium text-slate-200">Access-Controlled Forensics Facility</p>
                <p className="text-xs text-slate-400 mt-1">Isolated workstations, vault storage & CCTV monitoring</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-slate-100">2. Primary Project Objectives</h2>
          <p className="text-xs text-slate-400">Ten foundational mandates governing facility design and operations</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-[#131a26] border border-slate-800 rounded-lg p-5">
          {PROJECT_OBJECTIVES.map((obj, idx) => (
            <div key={obj} className="flex items-start gap-3 py-1.5">
              <span className="font-mono text-xs font-semibold text-sky-400 tabular-nums mt-0.5">
                {String(idx + 1).padStart(2, '0')}.
              </span>
              <p className="text-xs text-slate-200 leading-relaxed">{obj}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-slate-100">3. Proposed Laboratory Divisions</h2>
          <p className="text-xs text-slate-400">Specialized functional units and technical scope</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {LABORATORY_DIVISIONS.map((div) => (
            <div key={div.id} className="bg-[#131a26] border border-slate-800 rounded-lg p-5 space-y-3">
              <div>
                <span className="font-mono text-xs text-sky-400">Division {div.code}</span>
                <h3 className="text-sm font-semibold text-slate-100 mt-0.5">{div.title}</h3>
                <p className="text-xs text-slate-400 mt-1">{div.summary}</p>
              </div>
              <ul className="space-y-1.5 border-t border-slate-800 pt-3">
                {div.capabilities.map((cap) => (
                  <li key={cap} className="flex items-start gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{cap}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-slate-100">7. Digital Evidence Handling Policy</h2>
          <p className="text-xs text-slate-400">
            Mandatory 10-step lifecycle ensuring original evidence is never altered during routine examination
          </p>
        </div>
        <div className="bg-[#131a26] border border-slate-800 rounded-lg divide-y divide-slate-800/80">
          {EVIDENCE_HANDLING_STEPS.map((s) => (
            <div key={s.step} className="px-5 py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
              <div className="flex items-center gap-3 sm:w-72 shrink-0">
                <span className="font-mono text-xs font-semibold text-sky-400 tabular-nums">
                  Step {String(s.step).padStart(2, '0')}
                </span>
                <span className="text-xs font-medium text-slate-100">{s.title}</span>
              </div>
              <p className="text-xs text-slate-400">{s.detail}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function ProposalInfraView() {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-100">
          Physical Infrastructure, Hardware & Software Stack
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Facility safeguards, Windows forensic workstation specifications, hardware acquisition gear, and validated tooling.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 bg-[#131a26] border border-slate-800 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-slate-100">4. Physical Infrastructure Requirements</h2>
          </div>
          <div className="divide-y divide-slate-800/80">
            {PHYSICAL_INFRASTRUCTURE.map((row) => (
              <div key={row.item} className="px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <span className="font-medium text-slate-100">{row.item}</span>
                <span className="text-slate-400 sm:text-right">{row.specification}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex-1 min-h-[220px] bg-[#131a26] border border-slate-800 rounded-lg overflow-hidden">
            {!imgError ? (
              <img
                src="/src/assets/images/forensic_write_blocker_1794843801536.jpg"
                alt="Forensic hardware write-blocker connected to NVMe solid-state drive alongside tamper-evident evidence bag"
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                <HardDrive className="w-8 h-8 text-sky-400 mb-2" aria-hidden="true" />
                <p className="text-sm font-medium text-slate-200">Hardware Write-Blocking Acquisition</p>
              </div>
            )}
          </div>

          <div className="bg-[#131a26] border border-slate-800 rounded-lg p-5 space-y-2.5">
            <h3 className="text-sm font-semibold text-slate-100">Recommended Workstation Configuration</h3>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {WORKSTATION_BASELINE.map((spec) => (
                <li key={spec} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{spec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <section className="bg-[#131a26] border border-slate-800 rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800">
          <h2 className="text-sm font-semibold text-slate-100">5. Hardware Procurement Schedule</h2>
          <p className="text-xs text-slate-400">Baseline initial laboratory equipment quantities</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-[#0f1520] font-medium text-slate-400">
                <th className="py-2.5 px-4">Equipment</th>
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4 text-right">Quantity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {HARDWARE_REQUIREMENTS.map((hw) => (
                <tr key={hw.equipment} className="hover:bg-[#171f2d]">
                  <td className="py-2.5 px-4 font-medium text-slate-100">{hw.equipment}</td>
                  <td className="py-2.5 px-4 text-slate-400">{hw.category}</td>
                  <td className="py-2.5 px-4 text-right font-mono font-semibold text-sky-400 tabular-nums">
                    {hw.quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-[#131a26] border border-slate-800 rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800">
          <h2 className="text-sm font-semibold text-slate-100">6. Validated Forensic Software Stack</h2>
          <p className="text-xs text-slate-400">
            All utilities must be version-controlled, tested, and approved prior to operational case deployment
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-[#0f1520] font-medium text-slate-400">
                <th className="py-2.5 px-4">Software Tool</th>
                <th className="py-2.5 px-4">Primary Forensic Purpose</th>
                <th className="py-2.5 px-4">Division</th>
                <th className="py-2.5 px-4">Licensing</th>
                <th className="py-2.5 px-4">Governance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {SOFTWARE_TOOLS.map((tool) => (
                <tr key={tool.name} className="hover:bg-[#171f2d]">
                  <td className="py-3 px-4 font-semibold text-slate-100 whitespace-nowrap">{tool.name}</td>
                  <td className="py-3 px-4 text-slate-300">{tool.purpose}</td>
                  <td className="py-3 px-4 text-slate-400 whitespace-nowrap">{tool.division}</td>
                  <td className="py-3 px-4 text-slate-400 whitespace-nowrap">{tool.licenseType}</td>
                  <td className="py-3 px-4 whitespace-nowrap font-medium text-emerald-400">{tool.validationStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

interface ProposalBudgetViewProps {
  state: LabStatePayload;
  onSaveApproval: (payload: {
    status: 'Pending Review' | 'Approved' | 'Revisions Requested';
    reviewedBy: string;
    reviewerRole: string;
    comments: string;
    approvedBudgetPkr: number;
  }) => Promise<void>;
}

export function ProposalBudgetView({ state, onSaveApproval }: ProposalBudgetViewProps) {
  const [contingencyPct, setContingencyPct] = useState<number>(10);
  const [approvalForm, setApprovalForm] = useState({
    status: state.proposalApproval.status,
    reviewedBy: state.proposalApproval.reviewedBy,
    reviewerRole: state.proposalApproval.reviewerRole,
    comments: state.proposalApproval.comments,
  });
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const nonContingencySubtotal = BUDGET_ITEMS.filter((b) => b.id !== 'b11').reduce(
    (sum, item) => sum + item.costPkr,
    0
  );
  const simulatedContingency = Math.round((nonContingencySubtotal * contingencyPct) / 100);
  const simulatedTotal = nonContingencySubtotal + simulatedContingency;

  const handleApprovalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedMsg(null);
    try {
      await onSaveApproval({
        ...approvalForm,
        approvedBudgetPkr: simulatedTotal,
      });
      setSavedMsg('Management review record saved to audit log.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-100">
          Budget Estimate, Implementation Timeline & Risk Governance
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Indicative PKR capital investment breakdown, 18-week phased execution plan, ISO compliance, and management sign-off.
        </p>
      </div>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div className="xl:col-span-2 bg-[#131a26] border border-slate-800 rounded-lg overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-5 py-4 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">10. Proposed Initial Investment (PKR)</h2>
              <p className="text-xs text-slate-400">Preliminary planning allowances excluding recurring salaries, rent, and utilities</p>
            </div>
            <span className="font-mono text-sm font-semibold text-sky-400 tabular-nums">
              Baseline: {formatPkr(PROPOSAL_METADATA.totalInvestmentPkr)}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-[#0f1520] font-medium text-slate-400">
                  <th className="py-2.5 px-4">Budget Component</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4 text-right">Share</th>
                  <th className="py-2.5 px-4 text-right">Estimated Cost (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {BUDGET_ITEMS.map((item) => {
                  const displayCost = item.id === 'b11' ? simulatedContingency : item.costPkr;
                  const share = ((displayCost / simulatedTotal) * 100).toFixed(1);
                  return (
                    <tr key={item.id} className="hover:bg-[#171f2d]">
                      <td className="py-2.5 px-4">
                        <p className="font-medium text-slate-100">{item.component}</p>
                        <p className="text-slate-400">{item.notes}</p>
                      </td>
                      <td className="py-2.5 px-4 text-slate-300 whitespace-nowrap">{item.category}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-400 tabular-nums whitespace-nowrap">
                        {share}%
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-100 tabular-nums whitespace-nowrap">
                        {displayCost.toLocaleString('en-US')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-700 bg-[#0f1520] font-semibold text-slate-100">
                  <td className="py-3 px-4" colSpan={3}>
                    Estimated Initial Investment ({contingencyPct}% contingency)
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-400 tabular-nums">
                    {formatPkr(simulatedTotal)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#131a26] border border-slate-800 rounded-lg p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-100">Contingency Allowance Modeler</h3>
            <p className="text-xs text-slate-400">
              Adjust contingency reserve percentage to model supplier quote or FX variance against the {formatPkr(nonContingencySubtotal)} equipment/facility base.
            </p>
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-slate-300">Contingency Rate</span>
                <span className="font-mono font-semibold text-sky-400 tabular-nums">{contingencyPct}%</span>
              </div>
              <input
                type="range"
                min={5}
                max={20}
                step={1}
                value={contingencyPct}
                onChange={(e) => setContingencyPct(Number(e.target.value))}
                className="w-full accent-sky-500"
              />
              <div className="flex justify-between text-[11px] font-mono text-slate-500 mt-1">
                <span>5%</span>
                <span>10% (Proposal)</span>
                <span>20%</span>
              </div>
            </div>
            <div className="border-t border-slate-800 pt-3 flex items-center justify-between text-xs">
              <span className="text-slate-400">Modeled Total</span>
              <span className="font-mono font-semibold text-emerald-400 tabular-nums">{formatPkr(simulatedTotal)}</span>
            </div>
          </div>

          <div className="bg-[#131a26] border border-slate-800 rounded-lg p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-100">15. Management Approval</h3>
              <span className="text-xs font-medium text-amber-400">{state.proposalApproval.status}</span>
            </div>
            {state.proposalApproval.reviewedAt && (
              <p className="text-xs text-slate-400 font-mono mt-1 tabular-nums">
                Last updated: {formatDateTime(state.proposalApproval.reviewedAt)}
              </p>
            )}

            <form onSubmit={handleApprovalSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Decision</label>
                <select
                  value={approvalForm.status}
                  onChange={(e) =>
                    setApprovalForm({
                      ...approvalForm,
                      status: e.target.value as 'Pending Review' | 'Approved' | 'Revisions Requested',
                    })
                  }
                  className="w-full px-3 py-2 text-xs text-slate-100 bg-[#0b0f17] border border-slate-700 rounded-lg"
                >
                  <option value="Pending Review">Pending Review</option>
                  <option value="Approved">Approved for Commissioning</option>
                  <option value="Revisions Requested">Revisions Requested</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Reviewer / Approver</label>
                <input
                  type="text"
                  value={approvalForm.reviewedBy}
                  onChange={(e) => setApprovalForm({ ...approvalForm, reviewedBy: e.target.value })}
                  className="w-full px-3 py-2 text-xs text-slate-100 bg-[#0b0f17] border border-slate-700 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Review Notes</label>
                <textarea
                  rows={3}
                  value={approvalForm.comments}
                  onChange={(e) => setApprovalForm({ ...approvalForm, comments: e.target.value })}
                  className="w-full px-3 py-2 text-xs text-slate-100 bg-[#0b0f17] border border-slate-700 rounded-lg"
                />
              </div>
              {savedMsg && <p className="text-xs font-medium text-emerald-400">{savedMsg}</p>}
              <button
                type="submit"
                disabled={saving}
                className="w-full px-4 py-2 text-xs font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-500 disabled:opacity-50"
              >
                {saving ? 'Recording...' : 'Record Management Decision'}
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="bg-[#131a26] border border-slate-800 rounded-lg p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">11. Implementation Timeline (18 Weeks)</h2>
            <p className="text-xs text-slate-400">Eight structured phases with overlapping procurement and infrastructure tracks</p>
          </div>
          <span className="font-mono text-xs text-sky-400 tabular-nums">Weeks 1 – 18</span>
        </div>

        <div className="space-y-3">
          {IMPLEMENTATION_TIMELINE.map((p) => {
            const leftPct = ((p.startWeek - 1) / 18) * 100;
            const widthPct = ((p.endWeek - p.startWeek + 1) / 18) * 100;
            return (
              <div key={p.phase} className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center text-xs">
                <div className="lg:col-span-4">
                  <p className="font-medium text-slate-100">
                    Phase {p.phase}: {p.activity}
                  </p>
                  <p className="text-slate-400">{p.deliverable}</p>
                </div>
                <div className="lg:col-span-6">
                  <div className="h-6 bg-[#0b0f17] border border-slate-800 rounded relative overflow-hidden">
                    <div
                      className="absolute top-1 bottom-1 bg-sky-600/80 rounded-sm flex items-center px-2 text-[10px] font-mono text-white tabular-nums"
                      style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                    >
                      W{p.startWeek}–W{p.endWeek}
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-2 lg:text-right font-mono text-slate-300 tabular-nums">
                  {p.durationWeeks} {p.durationWeeks === 1 ? 'week' : 'weeks'}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-[#131a26] border border-slate-800 rounded-lg p-5 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">12. Quality Assurance & Compliance</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Policy alignment framework (formal accreditation requires separate conformity assessment)
            </p>
          </div>
          <div className="divide-y divide-slate-800/80">
            {COMPLIANCE_STANDARDS.map((std) => (
              <div key={std.code} className="py-3 first:pt-0 last:pb-0">
                <p className="text-xs font-semibold text-sky-400">
                  {std.code} — {std.title}
                </p>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{std.scope}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-[#131a26] border border-slate-800 rounded-lg p-5 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">13. Risk Management Register</h2>
            <p className="text-xs text-slate-400 mt-0.5">Identified operational & evidentiary risks with engineered controls</p>
          </div>
          <div className="divide-y divide-slate-800/80">
            {RISK_REGISTER.map((r) => (
              <div key={r.risk} className="py-3 first:pt-0 last:pb-0 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-100">{r.risk}</span>
                  <span className={`font-medium ${r.severity === 'High' ? 'text-rose-400' : 'text-amber-400'}`}>
                    {r.severity} Risk
                  </span>
                </div>
                <p className="text-slate-400 mt-1">{r.mitigation}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
