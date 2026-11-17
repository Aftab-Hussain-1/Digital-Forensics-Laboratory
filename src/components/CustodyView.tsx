import { ArrowRightLeft } from 'lucide-react';
import { useState } from 'react';
import type { LabStatePayload } from '../types/forensics';
import { formatDateTime } from '../utils/crypto';

interface CustodyViewProps {
  state: LabStatePayload;
  onCreateTransfer: (payload: {
    evidenceId: string;
    fromHolder: string;
    toHolder: string;
    purpose: string;
    sealNumber: string;
    authorizedBy: string;
    remarks: string;
  }) => Promise<void>;
}

export function CustodyView({ state, onCreateTransfer }: CustodyViewProps) {
  const [filterEvidenceId, setFilterEvidenceId] = useState<string>('All');
  const [evidenceId, setEvidenceId] = useState<string>(state.evidence[0]?.id ?? '');
  const selectedEv = state.evidence.find((e) => e.id === evidenceId);

  const [fromHolder, setFromHolder] = useState<string>(selectedEv?.currentCustodian ?? '');
  const [toHolder, setToHolder] = useState<string>('Ayesha Siddiqui (Forensic Workstation 01)');
  const [purpose, setPurpose] = useState<string>('Examination on Controlled Forensic Copy');
  const [sealNumber, setSealNumber] = useState<string>('TE-88415');
  const [authorizedBy, setAuthorizedBy] = useState<string>('Tariq Mahmood');
  const [remarks, setRemarks] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const handleEvidenceSelect = (id: string) => {
    setEvidenceId(id);
    const found = state.evidence.find((e) => e.id === id);
    if (found) {
      setFromHolder(found.currentCustodian);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceId || !fromHolder.trim() || !toHolder.trim()) return;
    setSubmitting(true);
    try {
      await onCreateTransfer({
        evidenceId,
        fromHolder,
        toHolder,
        purpose,
        sealNumber,
        authorizedBy,
        remarks,
      });
      setFromHolder(toHolder);
      setRemarks('');
    } finally {
      setSubmitting(false);
    }
  };

  const transfers =
    filterEvidenceId === 'All'
      ? state.custodyTransfers
      : state.custodyTransfers.filter((t) => t.evidenceId === filterEvidenceId);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-100">
          Chain-of-Custody Documentation
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Record every physical and logical evidence transfer, tamper-evident seal verification, and vault movement.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div className="bg-[#131a26] border border-slate-800 rounded-lg p-5">
          <h2 className="text-sm font-semibold text-slate-100">Log Custody Transfer</h2>
          <p className="text-xs text-slate-400 mt-0.5">Updates active custodian and appends to ledger</p>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Evidence Item</label>
              <select
                value={evidenceId}
                onChange={(e) => handleEvidenceSelect(e.target.value)}
                className="w-full px-3 py-2 text-xs text-slate-100 bg-[#0b0f17] border border-slate-700 rounded-lg"
              >
                {state.evidence.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.evidenceCode} ({ev.caseNumber}) — {ev.description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Released By (From)</label>
              <input
                required
                type="text"
                value={fromHolder}
                onChange={(e) => setFromHolder(e.target.value)}
                className="w-full px-3 py-2 text-xs text-slate-100 bg-[#0b0f17] border border-slate-700 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Received By (To)</label>
              <input
                required
                type="text"
                value={toHolder}
                onChange={(e) => setToHolder(e.target.value)}
                className="w-full px-3 py-2 text-xs text-slate-100 bg-[#0b0f17] border border-slate-700 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Purpose</label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs text-slate-100 bg-[#0b0f17] border border-slate-700 rounded-lg"
                >
                  <option value="Write-Blocked Forensic Acquisition">Write-Blocked Acquisition</option>
                  <option value="Examination on Controlled Forensic Copy">Forensic Examination</option>
                  <option value="Original Media Preservation Return">Vault Preservation Return</option>
                  <option value="Independent Quality Assurance Review">QA Peer Review</option>
                  <option value="Authorized Client Release">Authorized Client Release</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Seal Number</label>
                <input
                  required
                  type="text"
                  value={sealNumber}
                  onChange={(e) => setSealNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono text-slate-100 bg-[#0b0f17] border border-slate-700 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Authorized By</label>
              <select
                value={authorizedBy}
                onChange={(e) => setAuthorizedBy(e.target.value)}
                className="w-full px-3 py-2 text-xs text-slate-100 bg-[#0b0f17] border border-slate-700 rounded-lg"
              >
                {state.investigators.map((inv) => (
                  <option key={inv.id} value={inv.fullName}>
                    {inv.fullName} ({inv.roleTitle})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Condition & Remarks</label>
              <textarea
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Confirm tamper-evident seal integrity upon handoff..."
                className="w-full px-3 py-2 text-xs text-slate-100 bg-[#0b0f17] border border-slate-700 rounded-lg"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-500 disabled:opacity-50"
            >
              <ArrowRightLeft className="w-4 h-4" aria-hidden="true" />
              <span>{submitting ? 'Recording...' : 'Record Custody Transfer'}</span>
            </button>
          </form>
        </div>

        <div className="xl:col-span-2 bg-[#131a26] border border-slate-800 rounded-lg overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">Custody Transfer Ledger</h2>
              <p className="text-xs text-slate-400">Chronological chain-of-custody records</p>
            </div>
            <select
              aria-label="Filter custody by evidence"
              value={filterEvidenceId}
              onChange={(e) => setFilterEvidenceId(e.target.value)}
              className="px-3 py-1.5 text-xs text-slate-100 bg-[#0b0f17] border border-slate-700 rounded-lg"
            >
              <option value="All">All Evidence Items</option>
              {state.evidence.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.evidenceCode} — {ev.caseNumber}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-[#0f1520] text-slate-400 font-medium">
                  <th className="py-2.5 px-4">Date / Time</th>
                  <th className="py-2.5 px-4">Evidence</th>
                  <th className="py-2.5 px-4">Custody Handoff</th>
                  <th className="py-2.5 px-4">Purpose & Seal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {transfers.map((t) => (
                  <tr key={t.id} className="hover:bg-[#171f2d]">
                    <td className="py-3 px-4 font-mono text-slate-400 tabular-nums whitespace-nowrap">
                      {formatDateTime(t.transferredAt)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <p className="font-mono font-semibold text-sky-400">{t.evidenceCode}</p>
                      <p className="font-mono text-slate-400">{t.caseNumber}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-slate-400">
                        From: <span className="text-slate-200">{t.fromHolder}</span>
                      </p>
                      <p className="font-medium text-slate-100 mt-0.5">
                        To: <span className="text-emerald-400">{t.toHolder}</span>
                      </p>
                      {t.remarks && <p className="text-slate-400 mt-1">{t.remarks}</p>}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-200">{t.purpose}</p>
                      <p className="font-mono text-slate-400 mt-0.5">
                        Seal: {t.sealNumber} · Auth: {t.authorizedBy}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
