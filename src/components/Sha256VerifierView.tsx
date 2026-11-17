import { CheckCircle2, Copy, Download, FileUp, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import type { LabStatePayload } from '../types/forensics';
import { computeSha256FromFile, computeSha256FromText, formatBytes, formatDateTime } from '../utils/crypto';

interface Sha256VerifierViewProps {
  state: LabStatePayload;
  preselectedEvidenceId?: string;
  onLogVerification: (payload: {
    evidenceId: string;
    fileName: string;
    fileSizeBytes: number;
    computedSha256: string;
    verifiedBy: string;
    notes: string;
  }) => Promise<void>;
}

export function Sha256VerifierView({
  state,
  preselectedEvidenceId,
  onLogVerification,
}: Sha256VerifierViewProps) {
  const [inputMode, setInputMode] = useState<'file' | 'text'>('file');
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string>(
    preselectedEvidenceId || state.evidence[0]?.id || ''
  );
  const [fileName, setFileName] = useState<string>('');
  const [fileSizeBytes, setFileSizeBytes] = useState<number>(0);
  const [textPayload, setTextPayload] = useState<string>('');
  const [computedHash, setComputedHash] = useState<string>('');
  const [computing, setComputing] = useState<boolean>(false);
  const [verifiedBy, setVerifiedBy] = useState<string>('Ayesha Siddiqui');
  const [notes, setNotes] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [savedBanner, setSavedBanner] = useState<string | null>(null);

  const selectedEvidence = state.evidence.find((e) => e.id === selectedEvidenceId);
  const hasComparison = Boolean(computedHash && selectedEvidence);
  const isMatch =
    hasComparison &&
    computedHash.toLowerCase() === selectedEvidence!.baselineSha256.toLowerCase();

  const handleFileChange = async (file: File | undefined) => {
    if (!file) return;
    setComputing(true);
    setSavedBanner(null);
    try {
      const hash = await computeSha256FromFile(file);
      setFileName(file.name);
      setFileSizeBytes(file.size);
      setComputedHash(hash);
    } finally {
      setComputing(false);
    }
  };

  const handleComputeText = async (value: string) => {
    setTextPayload(value);
    setSavedBanner(null);
    if (!value) {
      setComputedHash('');
      setFileName('');
      setFileSizeBytes(0);
      return;
    }
    const hash = await computeSha256FromText(value);
    setFileName('text-artifact-buffer.txt');
    setFileSizeBytes(new TextEncoder().encode(value).length);
    setComputedHash(hash);
  };

  const handleDownloadSample = () => {
    const sampleContent = [
      'DIGITAL FORENSICS LABORATORY — SAMPLE FORENSIC ACQUISITION MANIFEST',
      `Case Reference: ${selectedEvidence?.caseNumber || 'DFL-2026-001'}`,
      `Evidence Code: ${selectedEvidence?.evidenceCode || 'EVD-2026-001'}`,
      'Acquisition Tool: FTK Imager 4.7.1 (Hardware Write-Blocker Active)',
      'Verification Standard: ISO/IEC 27037 SHA-256 Cryptographic Seal',
    ].join('\n');
    const blob = new Blob([sampleContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_forensic_artifact.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLogResult = async () => {
    if (!selectedEvidence || !computedHash) return;
    setSaving(true);
    try {
      await onLogVerification({
        evidenceId: selectedEvidence.id,
        fileName: fileName || 'manual-verification',
        fileSizeBytes,
        computedSha256: computedHash,
        verifiedBy,
        notes:
          notes.trim() ||
          (isMatch
            ? 'Client-side Web Crypto SHA-256 digest matches baseline evidence record.'
            : 'ALERT: Computed SHA-256 digest does not match baseline intake record.'),
      });
      setNotes('');
      setSavedBanner(`Verification logged for ${selectedEvidence.evidenceCode}.`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-100">
            SHA-256 Cryptographic File Verification
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Compute local SHA-256 digests in-browser via Web Crypto API and verify against registered evidence baselines.
          </p>
        </div>
        <button
          type="button"
          onClick={handleDownloadSample}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-200 bg-[#151c28] border border-slate-700 rounded-lg hover:bg-[#1c2536] transition-colors whitespace-nowrap shrink-0"
        >
          <Download className="w-4 h-4 text-sky-400" aria-hidden="true" />
          <span>Download Sample Artifact</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#131a26] border border-slate-800 rounded-lg p-6 space-y-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-sm font-semibold text-slate-100">1. Compute Local SHA-256 Digest</h2>
            <div className="flex items-center gap-1 p-1 bg-[#0b0f17] border border-slate-800 rounded-lg">
              <button
                type="button"
                onClick={() => setInputMode('file')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  inputMode === 'file' ? 'bg-slate-800 text-white' : 'text-slate-400'
                }`}
              >
                File Input
              </button>
              <button
                type="button"
                onClick={() => setInputMode('text')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  inputMode === 'text' ? 'bg-slate-800 text-white' : 'text-slate-400'
                }`}
              >
                Text / Log Buffer
              </button>
            </div>
          </div>

          {inputMode === 'file' ? (
            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFileChange(e.dataTransfer.files?.[0]);
              }}
              className="flex flex-col items-center justify-center border border-dashed border-slate-700 rounded-lg p-8 bg-[#0b0f17] hover:bg-[#101724] transition-colors cursor-pointer text-center"
            >
              <FileUp className="w-7 h-7 text-sky-400 mb-2" aria-hidden="true" />
              <p className="text-sm font-medium text-slate-100">
                Select or drop any forensic file, log, or image
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Hashing executes locally in memory; raw bytes never leave your workstation.
              </p>
              <input
                type="file"
                onChange={(e) => handleFileChange(e.target.files?.[0])}
                className="sr-only"
              />
            </label>
          ) : (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Paste log snippet, manifest, or raw text
              </label>
              <textarea
                rows={5}
                value={textPayload}
                onChange={(e) => handleComputeText(e.target.value)}
                placeholder="Paste text content to compute its exact UTF-8 SHA-256 digest..."
                className="w-full px-3 py-2 text-xs font-mono text-slate-100 bg-[#0b0f17] border border-slate-700 rounded-lg focus:outline-none focus:border-sky-500"
              />
            </div>
          )}

          <div className="bg-[#0b0f17] border border-slate-800 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-300">
                {computing ? 'Computing SHA-256...' : 'Computed SHA-256 Output'}
              </span>
              {computedHash && (
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(computedHash);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                  className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300"
                >
                  <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{copied ? 'Copied' : 'Copy digest'}</span>
                </button>
              )}
            </div>
            <p className="font-mono text-xs break-all text-emerald-400 min-h-[2rem]">
              {computedHash || 'Awaiting file or text input...'}
            </p>
            {fileName && (
              <p className="text-xs text-slate-400 tabular-nums">
                Artifact: <span className="font-mono text-slate-200">{fileName}</span> · {formatBytes(fileSizeBytes)}
              </p>
            )}
          </div>
        </div>

        <div className="bg-[#131a26] border border-slate-800 rounded-lg p-6 space-y-5">
          <h2 className="text-sm font-semibold text-slate-100">
            2. Compare & Record Against Evidence Item
          </h2>

          <div>
            <label htmlFor="target-evidence-select" className="block text-xs font-medium text-slate-300 mb-1.5">
              Registered Evidence Record
            </label>
            <select
              id="target-evidence-select"
              value={selectedEvidenceId}
              onChange={(e) => {
                setSelectedEvidenceId(e.target.value);
                setSavedBanner(null);
              }}
              className="w-full px-3 py-2 text-xs font-medium text-slate-100 bg-[#0b0f17] border border-slate-700 rounded-lg"
            >
              {state.evidence.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.evidenceCode} ({ev.caseNumber}) — {ev.description}
                </option>
              ))}
            </select>
          </div>

          {selectedEvidence && (
            <div className="bg-[#0b0f17] border border-slate-800 rounded-lg p-4 space-y-1.5">
              <p className="text-xs font-medium text-slate-400">Stored Baseline Intake SHA-256</p>
              <p className="font-mono text-xs break-all text-sky-400">
                {selectedEvidence.baselineSha256}
              </p>
            </div>
          )}

          {hasComparison && (
            <div
              className={`border rounded-lg p-4 flex items-start gap-3 ${
                isMatch
                  ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-700/60 text-rose-200'
              }`}
            >
              {isMatch ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />
              )}
              <div className="text-xs space-y-1">
                <p className="font-semibold text-sm">
                  {isMatch ? 'Cryptographic Match Confirmed' : 'Hash Mismatch Detected'}
                </p>
                <p className="text-slate-300">
                  {isMatch
                    ? `The computed SHA-256 digest matches the baseline record for ${selectedEvidence?.evidenceCode}.`
                    : `The computed SHA-256 digest differs from the baseline record for ${selectedEvidence?.evidenceCode}.`}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Verifying Examiner</label>
              <select
                value={verifiedBy}
                onChange={(e) => setVerifiedBy(e.target.value)}
                className="w-full px-3 py-2 text-xs text-slate-100 bg-[#0b0f17] border border-slate-700 rounded-lg"
              >
                {state.investigators.map((inv) => (
                  <option key={inv.id} value={inv.fullName}>
                    {inv.fullName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Verification Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Pre-examination working copy check"
                className="w-full px-3 py-2 text-xs text-slate-100 bg-[#0b0f17] border border-slate-700 rounded-lg"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 pt-1">
            {savedBanner ? (
              <span className="text-xs font-medium text-emerald-400">{savedBanner}</span>
            ) : (
              <span className="text-xs text-slate-400">Appends to Evidence Hash Records & Audit Log</span>
            )}
            <button
              type="button"
              disabled={!hasComparison || saving}
              onClick={handleLogResult}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-500 disabled:opacity-40 transition-colors whitespace-nowrap shrink-0"
            >
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
              <span>{saving ? 'Logging...' : 'Log Verification Result'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Verification History Table */}
      <div className="bg-[#131a26] border border-slate-800 rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800">
          <h2 className="text-sm font-semibold text-slate-100">Evidence Hash Verification History</h2>
          <p className="text-xs text-slate-400">Immutable ledger of cryptographic integrity checks</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-[#0f1520] text-slate-400 font-medium">
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4">Evidence / Case</th>
                <th className="py-2.5 px-4">Artifact & Size</th>
                <th className="py-2.5 px-4">Computed SHA-256</th>
                <th className="py-2.5 px-4">Verdict</th>
                <th className="py-2.5 px-4">Verified By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {state.verifications.map((v) => (
                <tr key={v.id} className="hover:bg-[#171f2d]">
                  <td className="py-3 px-4 font-mono text-slate-400 tabular-nums whitespace-nowrap">
                    {formatDateTime(v.verifiedAt)}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="font-mono font-semibold text-sky-400">{v.evidenceCode}</span>
                    <span className="text-slate-600 mx-1">·</span>
                    <span className="font-mono text-slate-300">{v.caseNumber}</span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-slate-100">{v.fileName}</p>
                    <p className="text-slate-400 tabular-nums">{formatBytes(v.fileSizeBytes)}</p>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-300 max-w-[240px] truncate" title={v.computedSha256}>
                    {v.computedSha256}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {v.matched ? (
                      <span className="inline-flex items-center gap-1 font-medium text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Match</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-semibold text-rose-400">
                        <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Mismatch</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-300 whitespace-nowrap">{v.verifiedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
