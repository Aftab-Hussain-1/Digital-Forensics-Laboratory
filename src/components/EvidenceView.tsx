import { ChevronDown, ChevronRight, Copy, FileUp, Plus, Search, ShieldCheck } from 'lucide-react';
import { Fragment, useState } from 'react';
import type { IntegrityStatus, LabStatePayload } from '../types/forensics';
import { computeSha256FromFile, formatDateTime } from '../utils/crypto';
import { IntegrityStatusLabel } from './StatusText';

interface EvidenceViewProps {
  state: LabStatePayload;
  onCreateEvidence: (payload: {
    caseId: string;
    description: string;
    mediaType: string;
    serialNumber: string;
    receivedCondition: string;
    sourceOwner: string;
    receivingOfficer: string;
    acquisitionMethod: string;
    forensicCopyId: string;
    storageLocation: string;
    baselineSha256: string;
    sealNumber: string;
  }) => Promise<void>;
  onVerifyEvidence: (evidenceId: string) => void;
}

const INTEGRITY_FILTERS: ('All' | IntegrityStatus)[] = [
  'All',
  'Verified Match',
  'Pending Verification',
  'Hash Mismatch',
];

export function EvidenceView({ state, onCreateEvidence, onVerifyEvidence }: EvidenceViewProps) {
  const [statusFilter, setStatusFilter] = useState<'All' | IntegrityStatus>('All');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(state.evidence[0]?.id ?? null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [form, setForm] = useState({
    caseId: state.cases[0]?.id ?? '',
    description: '',
    mediaType: 'NVMe SSD',
    serialNumber: '',
    receivedCondition: 'Intact label, sealed in anti-static bag',
    sourceOwner: '',
    receivingOfficer: 'Hina Farooq',
    acquisitionMethod: 'Hardware Write-Blocker + FTK Imager E01',
    forensicCopyId: '',
    storageLocation: 'Vault Cabinet A · Shelf 3',
    baselineSha256: '',
    sealNumber: `TE-${Math.floor(89000 + Math.random() * 9000)}`,
  });

  const filtered = state.evidence.filter((ev) => {
    const matchesStatus = statusFilter === 'All' || ev.integrityStatus === statusFilter;
    const q = search.trim().toLowerCase();
    const matchesQuery =
      !q ||
      ev.evidenceCode.toLowerCase().includes(q) ||
      ev.caseNumber.toLowerCase().includes(q) ||
      ev.description.toLowerCase().includes(q) ||
      ev.serialNumber.toLowerCase().includes(q) ||
      ev.baselineSha256.toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });

  const handleFileHashForIntake = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const digest = await computeSha256FromFile(file);
    setForm((prev) => ({
      ...prev,
      baselineSha256: digest,
      description: prev.description || file.name,
    }));
  };

  const handleCopyHash = async (id: string, hash: string) => {
    await navigator.clipboard.writeText(hash);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.caseId || !form.description.trim() || !form.baselineSha256.trim()) return;
    setSubmitting(true);
    try {
      await onCreateEvidence(form);
      setShowModal(false);
      setForm((prev) => ({
        ...prev,
        description: '',
        serialNumber: '',
        sourceOwner: '',
        forensicCopyId: '',
        baselineSha256: '',
        sealNumber: `TE-${Math.floor(89000 + Math.random() * 9000)}`,
      }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-100">Evidence Items</h1>
          <p className="mt-1 text-xs text-slate-400">
            Click any evidence row to inspect inline acquisition details, vault storage, and SHA-256 digests.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-500 transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Add Evidence</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-[#131a26] border border-slate-800 rounded-lg w-fit">
          {INTEGRITY_FILTERS.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                statusFilter === st
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
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
            placeholder="Search evidence ID, serial, SHA-256..."
            className="pl-9 pr-3 py-2 w-full sm:w-72 text-xs text-slate-100 bg-[#131a26] border border-slate-800 rounded-lg placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* High-Density Expandable Grid modeled after Reference Screen 2 */}
      <div className="bg-[#131a26] border border-slate-800 rounded-lg overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-slate-200">No evidence items found</p>
            <p className="mt-1 text-xs text-slate-400">Adjust your search or log a new evidence intake item.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-[#0f1520] text-slate-400 font-medium">
                  <th className="py-2.5 px-3 w-8" />
                  <th className="py-2.5 px-3">Evidence Number</th>
                  <th className="py-2.5 px-3">Acquisition Date</th>
                  <th className="py-2.5 px-3">Case Name</th>
                  <th className="py-2.5 px-3">Serial / ID</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3">Custodian</th>
                  <th className="py-2.5 px-3">Integrity Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filtered.map((ev) => {
                  const isExpanded = expandedId === ev.id;
                  const parentCase = state.cases.find((c) => c.id === ev.caseId);
                  return (
                    <Fragment key={ev.id}>
                      <tr
                        onClick={() => setExpandedId(isExpanded ? null : ev.id)}
                        className={`cursor-pointer transition-colors ${
                          isExpanded ? 'bg-[#192334]' : 'hover:bg-[#171f2d]'
                        }`}
                      >
                        <td className="py-3 px-3 text-slate-400">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-sky-400" aria-hidden="true" />
                          ) : (
                            <ChevronRight className="w-4 h-4" aria-hidden="true" />
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono font-semibold text-sky-400 whitespace-nowrap tabular-nums">
                          {ev.evidenceCode}
                        </td>
                        <td className="py-3 px-3 font-mono text-emerald-400 whitespace-nowrap tabular-nums">
                          {formatDateTime(ev.receivedAt)}
                        </td>
                        <td className="py-3 px-3 text-slate-200 whitespace-nowrap">
                          {ev.caseNumber}
                          {parentCase ? ` · ${parentCase.division.replace(' Forensics', '')}` : ''}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-300 whitespace-nowrap">
                          {ev.serialNumber}
                        </td>
                        <td className="py-3 px-3 text-slate-300 whitespace-nowrap">{ev.mediaType}</td>
                        <td className="py-3 px-3 font-medium text-slate-100 max-w-xs truncate">
                          {ev.description}
                        </td>
                        <td className="py-3 px-3 text-slate-300 whitespace-nowrap">{ev.currentCustodian}</td>
                        <td className="py-3 px-3">
                          <IntegrityStatusLabel status={ev.integrityStatus} />
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="bg-[#0e141f]">
                          <td colSpan={9} className="p-5 border-t border-slate-800">
                            <div className="bg-[#131a26] border border-slate-700/80 rounded-lg p-5 space-y-4">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                                <span className="text-xs font-semibold tracking-wide text-slate-300">
                                  Evidence Details — {ev.evidenceCode}
                                </span>
                                <div className="flex items-center gap-3">
                                  <button
                                    type="button"
                                    onClick={() => handleCopyHash(ev.id, ev.baselineSha256)}
                                    className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white"
                                  >
                                    <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                                    <span>{copiedId === ev.id ? 'Copied SHA-256' : 'Copy SHA-256'}</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => onVerifyEvidence(ev.id)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-sky-600 rounded hover:bg-sky-500"
                                  >
                                    <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                                    <span>Verify SHA-256 File</span>
                                  </button>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
                                <div className="space-y-2">
                                  <div className="flex justify-between gap-3">
                                    <span className="text-slate-500">Evidence Number</span>
                                    <span className="font-mono text-slate-200">{ev.evidenceCode}</span>
                                  </div>
                                  <div className="flex justify-between gap-3">
                                    <span className="text-slate-500">Linked Case</span>
                                    <span className="font-mono text-sky-400">{ev.caseNumber}</span>
                                  </div>
                                  <div className="flex justify-between gap-3">
                                    <span className="text-slate-500">Receiving Officer</span>
                                    <span className="text-slate-200">{ev.receivingOfficer}</span>
                                  </div>
                                  <div className="flex justify-between gap-3">
                                    <span className="text-slate-500">Source / Owner</span>
                                    <span className="text-slate-200 text-right">{ev.sourceOwner}</span>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <div className="flex justify-between gap-3">
                                    <span className="text-slate-500">Media Type</span>
                                    <span className="text-slate-200">{ev.mediaType}</span>
                                  </div>
                                  <div className="flex justify-between gap-3">
                                    <span className="text-slate-500">Forensic Copy ID</span>
                                    <span className="font-mono text-slate-200">{ev.forensicCopyId}</span>
                                  </div>
                                  <div className="flex justify-between gap-3">
                                    <span className="text-slate-500">Vault Storage</span>
                                    <span className="text-slate-200 text-right">{ev.storageLocation}</span>
                                  </div>
                                  <div className="flex justify-between gap-3">
                                    <span className="text-slate-500">Verification Runs</span>
                                    <span className="font-mono text-slate-200 tabular-nums">{ev.verificationCount}</span>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <div>
                                    <span className="text-slate-500 block mb-1">Acquisition Method</span>
                                    <span className="text-slate-200">{ev.acquisitionMethod}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-500 block mb-1">Received Condition</span>
                                    <span className="text-slate-200">{ev.receivedCondition}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="pt-2 border-t border-slate-800 space-y-1.5">
                                <span className="text-[11px] font-medium text-slate-400 block">
                                  Baseline SHA-256 Cryptographic Digest
                                </span>
                                <p className="font-mono text-xs break-all text-emerald-400 bg-[#0b0f17] border border-slate-800 rounded px-3 py-2">
                                  {ev.baselineSha256}
                                </p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Intake Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#131a26] border border-slate-700 rounded-lg w-full max-w-xl p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-semibold text-slate-100">Evidence Intake Registration</h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-xs font-medium text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Linked Case</label>
                  <select
                    required
                    value={form.caseId}
                    onChange={(e) => setForm({ ...form, caseId: e.target.value })}
                    className="w-full px-3 py-2 text-xs text-slate-100 bg-[#0b0f17] border border-slate-700 rounded-lg"
                  >
                    {state.cases.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.caseNumber} — {c.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Media / Item Type</label>
                  <select
                    value={form.mediaType}
                    onChange={(e) => setForm({ ...form, mediaType: e.target.value })}
                    className="w-full px-3 py-2 text-xs text-slate-100 bg-[#0b0f17] border border-slate-700 rounded-lg"
                  >
                    <option value="NVMe SSD">NVMe SSD</option>
                    <option value="SATA HDD / SSD">SATA HDD / SSD</option>
                    <option value="Mobile Handset">Mobile Handset</option>
                    <option value="PCAP / Network Log">PCAP / Network Log</option>
                    <option value="Memory Image (.raw)">Memory Image (.raw)</option>
                    <option value="USB Flash Media">USB Flash Media</option>
                    <option value="Logical Archive">Logical Archive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Item Description</label>
                <input
                  required
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g., Dell Latitude 5430 NVMe 512GB Drive"
                  className="w-full px-3 py-2 text-xs text-slate-100 bg-[#0b0f17] border border-slate-700 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Serial / IMEI</label>
                  <input
                    type="text"
                    value={form.serialNumber}
                    onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
                    placeholder="S/N or Asset ID"
                    className="w-full px-3 py-2 text-xs font-mono text-slate-100 bg-[#0b0f17] border border-slate-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Tamper Seal ID</label>
                  <input
                    type="text"
                    value={form.sealNumber}
                    onChange={(e) => setForm({ ...form, sealNumber: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono text-slate-100 bg-[#0b0f17] border border-slate-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Receiving Officer</label>
                  <input
                    type="text"
                    value={form.receivingOfficer}
                    onChange={(e) => setForm({ ...form, receivingOfficer: e.target.value })}
                    className="w-full px-3 py-2 text-xs text-slate-100 bg-[#0b0f17] border border-slate-700 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Source / Owner</label>
                  <input
                    type="text"
                    value={form.sourceOwner}
                    onChange={(e) => setForm({ ...form, sourceOwner: e.target.value })}
                    placeholder="Department or Custodian"
                    className="w-full px-3 py-2 text-xs text-slate-100 bg-[#0b0f17] border border-slate-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Storage Vault Location</label>
                  <input
                    type="text"
                    value={form.storageLocation}
                    onChange={(e) => setForm({ ...form, storageLocation: e.target.value })}
                    className="w-full px-3 py-2 text-xs text-slate-100 bg-[#0b0f17] border border-slate-700 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Acquisition Method</label>
                  <input
                    type="text"
                    value={form.acquisitionMethod}
                    onChange={(e) => setForm({ ...form, acquisitionMethod: e.target.value })}
                    className="w-full px-3 py-2 text-xs text-slate-100 bg-[#0b0f17] border border-slate-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Received Condition</label>
                  <input
                    type="text"
                    value={form.receivedCondition}
                    onChange={(e) => setForm({ ...form, receivedCondition: e.target.value })}
                    className="w-full px-3 py-2 text-xs text-slate-100 bg-[#0b0f17] border border-slate-700 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-300">
                    Baseline SHA-256 Digest (64 hex chars)
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-400 hover:text-sky-300 cursor-pointer">
                    <FileUp className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Compute from local file</span>
                    <input type="file" onChange={handleFileHashForIntake} className="sr-only" />
                  </label>
                </div>
                <input
                  required
                  type="text"
                  pattern="[a-fA-F0-9]{64}"
                  value={form.baselineSha256}
                  onChange={(e) => setForm({ ...form, baselineSha256: e.target.value })}
                  placeholder="64-character hexadecimal SHA-256 digest"
                  className="w-full px-3 py-2 text-xs font-mono text-emerald-400 bg-[#0b0f17] border border-slate-700 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-300 bg-transparent border border-slate-700 rounded-lg hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-500 disabled:opacity-50"
                >
                  {submitting ? 'Logging...' : 'Register Evidence'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
