import {
  Binary,
  CheckCircle2,
  Database,
  FileCheck2,
  FileUp,
  HardDrive,
  Search,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import {
  DFIL_ROADMAP_PHASES,
  DISK_IMAGE_PROFILES,
  type TskFileEntry,
} from '../data/diskForensicsData';
import type { LabStatePayload } from '../types/forensics';
import {
  computeDualHashesFromFile,
  formatBytes,
  inspectBinaryBuffer,
  type BinaryInspectionResult,
} from '../utils/crypto';

interface DiskForensicsViewProps {
  state: LabStatePayload;
  onLogFindingToCase: (payload: {
    caseId: string;
    evidenceCode: string;
    examinerName: string;
    toolUsed: string;
    findingTitle: string;
    content: string;
  }) => Promise<void>;
}

export function DiskForensicsView({ state, onLogFindingToCase }: DiskForensicsViewProps) {
  const [selectedProfileCode, setSelectedProfileCode] = useState<string>(
    DISK_IMAGE_PROFILES[0].evidenceCode
  );
  const [activeSubTab, setActiveSubTab] = useState<
    'partitions' | 'filesystem' | 'binary' | 'roadmap'
  >('filesystem');
  const [fileFilter, setFileFilter] = useState<'all' | 'deleted' | 'suspicious'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<TskFileEntry>(
    DISK_IMAGE_PROFILES[0].files[0]
  );

  // Live Local Binary / Disk Image Inspector state
  const [liveInspection, setLiveInspection] = useState<BinaryInspectionResult | null>(null);
  const [liveHashes, setLiveHashes] = useState<{ sha256: string; md5: string } | null>(null);
  const [loggingNoteId, setLoggingNoteId] = useState<string | null>(null);
  const [loggedFeedback, setLoggedFeedback] = useState<string | null>(null);

  const profile =
    DISK_IMAGE_PROFILES.find((p) => p.evidenceCode === selectedProfileCode) ??
    DISK_IMAGE_PROFILES[0];

  const handleProfileSwitch = (code: string) => {
    setSelectedProfileCode(code);
    const next = DISK_IMAGE_PROFILES.find((p) => p.evidenceCode === code);
    if (next && next.files[0]) {
      setSelectedFile(next.files[0]);
    }
    setLoggedFeedback(null);
  };

  const filteredFiles = profile.files.filter((f) => {
    if (fileFilter === 'deleted' && !f.deleted) return false;
    if (fileFilter === 'suspicious' && !f.suspicious) return false;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      f.name.toLowerCase().includes(q) ||
      f.path.toLowerCase().includes(q) ||
      f.inode.toLowerCase().includes(q)
    );
  });

  const handleInspectFile = async (file: File | undefined) => {
    if (!file) return;
    const { sha256, md5, buffer } = await computeDualHashesFromFile(file);
    const inspected = inspectBinaryBuffer(buffer, file.name);
    setLiveInspection(inspected);
    setLiveHashes({ sha256, md5 });
    setActiveSubTab('binary');
  };

  // Generate a synthetic 1024-byte MBR + NTFS/EXT4 partition table test disk image in memory
  const handleRunSyntheticMbrImage = async () => {
    const bytes = new Uint8Array(1024);
    const view = new DataView(bytes.buffer);
    // Bootloader label
    const oem = 'NTFS    ';
    for (let i = 0; i < oem.length; i++) bytes[3 + i] = oem.charCodeAt(i);
    const banner = 'DFIL-TSK-TEST-MBR-DISK-IMAGE';
    for (let i = 0; i < banner.length; i++) bytes[64 + i] = banner.charCodeAt(i);
    // Partition 1: Bootable NTFS (type 0x07), LBA 2048, 204800 sectors
    bytes[446] = 0x80;
    bytes[446 + 4] = 0x07;
    view.setUint32(446 + 8, 2048, true);
    view.setUint32(446 + 12, 204800, true);
    // Partition 2: Linux EXT4 (type 0x83), LBA 206848, 409600 sectors
    bytes[462] = 0x00;
    bytes[462 + 4] = 0x83;
    view.setUint32(462 + 8, 206848, true);
    view.setUint32(462 + 12, 409600, true);
    // MBR Signature 0x55AA
    bytes[510] = 0x55;
    bytes[511] = 0xaa;
    // Sector 1 string artifact
    const sec1 = 'FILE_RECORD_Q3_PAYROLL_DELETED_INODE_84912';
    for (let i = 0; i < sec1.length; i++) bytes[512 + i] = sec1.charCodeAt(i);

    const testFile = new File([bytes], 'test_mbr_disk_sample.img', {
      type: 'application/octet-stream',
    });
    await handleInspectFile(testFile);
  };

  const handleLogArtifactNote = async (entry: TskFileEntry) => {
    setLoggingNoteId(entry.inode);
    setLoggedFeedback(null);
    try {
      await onLogFindingToCase({
        caseId: profile.caseId,
        evidenceCode: profile.evidenceCode,
        examinerName: 'Ayesha Siddiqui',
        toolUsed: 'Autopsy 4.21 / The Sleuth Kit (fls + icat)',
        findingTitle: `TSK Artifact: ${entry.name} (Inode ${entry.inode})`,
        content: `Path: ${entry.path} | Size: ${formatBytes(entry.sizeBytes)} | Deleted: ${
          entry.deleted ? 'Yes (Unallocated)' : 'No'
        } | SHA-256: ${entry.sha256} | MD5: ${entry.md5}. ${entry.artifactNote}`,
      });
      setLoggedFeedback(`Logged ${entry.name} finding directly to case ${profile.caseNumber}.`);
    } finally {
      setLoggingNoteId(null);
    }
  };

  const handleLogBinaryInspection = async () => {
    if (!liveInspection || !liveHashes) return;
    setLoggingNoteId('live-binary');
    setLoggedFeedback(null);
    try {
      const targetCaseId = state.cases[0]?.id ?? profile.caseId;
      await onLogFindingToCase({
        caseId: targetCaseId,
        evidenceCode: profile.evidenceCode,
        examinerName: 'Ayesha Siddiqui',
        toolUsed: 'DFIL Disk Engine (Binary / MBR Inspector)',
        findingTitle: `Disk / Binary Inspection: ${liveInspection.fileName}`,
        content: `Signature: ${liveInspection.detectedSignature} | Size: ${formatBytes(
          liveInspection.sizeBytes
        )} | Shannon Entropy: ${liveInspection.entropy} bits/byte | Partitions Parsed: ${
          liveInspection.mbrPartitions.length
        } | SHA-256: ${liveHashes.sha256} | MD5: ${liveHashes.md5}`,
      });
      setLoggedFeedback(`Binary inspection for ${liveInspection.fileName} logged to case notes.`);
    } finally {
      setLoggingNoteId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end justify-between border-b border-slate-800 pb-5">
        <div>
          <p className="text-xs font-mono text-sky-400">
            Phase 2 Milestone · Autopsy & The Sleuth Kit (TSK)
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-100">
            Disk Forensics Engine
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Inspect partition tables (mmls), NTFS/FAT file systems & deleted $MFT records (fls/icat), and live disk binary headers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleRunSyntheticMbrImage}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-200 bg-[#151c28] border border-slate-700 rounded-lg hover:bg-[#1c2536] whitespace-nowrap"
          >
            <Binary className="w-4 h-4 text-sky-400" aria-hidden="true" />
            <span>Test MBR Disk Sample</span>
          </button>
          <label className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-500 cursor-pointer whitespace-nowrap">
            <FileUp className="w-4 h-4" aria-hidden="true" />
            <span>Inspect Local Disk Image / File</span>
            <input
              type="file"
              onChange={(e) => handleInspectFile(e.target.files?.[0])}
              className="sr-only"
            />
          </label>
        </div>
      </div>

      {/* Image Profile Selector + Engine Sub-Navigation */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="disk-evidence-select" className="text-xs font-medium text-slate-400">
            Mounted Forensic Image:
          </label>
          <select
            id="disk-evidence-select"
            value={profile.evidenceCode}
            onChange={(e) => handleProfileSwitch(e.target.value)}
            className="px-3 py-2 text-xs font-medium text-slate-100 bg-[#131a26] border border-slate-700 rounded-lg"
          >
            {DISK_IMAGE_PROFILES.map((p) => (
              <option key={p.evidenceCode} value={p.evidenceCode}>
                {p.evidenceCode} ({p.caseNumber}) — {p.imageName} · {p.totalCapacity}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 bg-[#131a26] border border-slate-800 rounded-lg w-fit">
          <button
            type="button"
            onClick={() => setActiveSubTab('filesystem')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeSubTab === 'filesystem' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            File System & Deleted ($MFT)
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('partitions')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeSubTab === 'partitions' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Partition Layout (mmls)
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('binary')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeSubTab === 'binary' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Hex & Live Image Parser
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('roadmap')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeSubTab === 'roadmap' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            DFIL Phase Roadmap
          </button>
        </div>
      </div>

      {/* Mounted Volume Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-[#131a26] border border-slate-800 rounded-lg p-4">
          <p className="text-[11px] text-slate-400">Physical Media & Scheme</p>
          <p className="mt-1 text-sm font-semibold text-slate-100 truncate">{profile.diskModel}</p>
          <p className="mt-0.5 text-xs font-mono text-sky-400">
            {profile.scheme} · {profile.sectorSize} B/sector
          </p>
        </div>
        <div className="bg-[#131a26] border border-slate-800 rounded-lg p-4">
          <p className="text-[11px] text-slate-400">Total Sectors / Capacity</p>
          <p className="mt-1 text-sm font-semibold font-mono text-slate-100 tabular-nums">
            {profile.totalCapacity}
          </p>
          <p className="mt-0.5 text-xs font-mono text-slate-400 tabular-nums">
            {profile.totalSectors.toLocaleString()} sectors
          </p>
        </div>
        <div className="bg-[#131a26] border border-slate-800 rounded-lg p-4">
          <p className="text-[11px] text-slate-400">Sleuth Kit Engine</p>
          <p className="mt-1 text-xs font-medium text-slate-100">{profile.tskVersion}</p>
          <p className="mt-0.5 text-[11px] text-emerald-400">Write-Blocked Image Mounted Read-Only</p>
        </div>
        <div className="bg-[#131a26] border border-slate-800 rounded-lg p-4">
          <p className="text-[11px] text-slate-400">Recovered / Flagged Artifacts</p>
          <p className="mt-1 text-sm font-semibold font-mono text-slate-100 tabular-nums">
            {profile.files.filter((f) => f.deleted).length} deleted ·{' '}
            {profile.files.filter((f) => f.suspicious).length} flagged
          </p>
          <p className="mt-0.5 text-[11px] text-slate-400 truncate">{profile.autopsyModule}</p>
        </div>
      </div>

      {loggedFeedback && (
        <div className="bg-emerald-950/40 border border-emerald-700/60 rounded-lg px-4 py-3 flex items-center gap-2 text-xs text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
          <span>{loggedFeedback}</span>
        </div>
      )}

      {/* TAB 1: File System & Deleted Files (fls / icat) */}
      {activeSubTab === 'filesystem' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          <div className="xl:col-span-7 bg-[#131a26] border border-slate-800 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1 p-1 bg-[#0b0f17] border border-slate-800 rounded-lg w-fit">
                <button
                  type="button"
                  onClick={() => setFileFilter('all')}
                  className={`px-2.5 py-1 text-xs font-medium rounded ${
                    fileFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400'
                  }`}
                >
                  All Entries
                </button>
                <button
                  type="button"
                  onClick={() => setFileFilter('deleted')}
                  className={`px-2.5 py-1 text-xs font-medium rounded ${
                    fileFilter === 'deleted' ? 'bg-slate-800 text-white' : 'text-slate-400'
                  }`}
                >
                  Deleted Only
                </button>
                <button
                  type="button"
                  onClick={() => setFileFilter('suspicious')}
                  className={`px-2.5 py-1 text-xs font-medium rounded ${
                    fileFilter === 'suspicious' ? 'bg-slate-800 text-white' : 'text-slate-400'
                  }`}
                >
                  Flagged
                </button>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter path or inode..."
                  className="pl-8 pr-3 py-1.5 text-xs text-slate-100 bg-[#0b0f17] border border-slate-700 rounded-lg w-52"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#0f1520] text-slate-400 font-medium">
                    <th className="py-2.5 px-3">MFT Inode</th>
                    <th className="py-2.5 px-3">File Path</th>
                    <th className="py-2.5 px-3">State</th>
                    <th className="py-2.5 px-3 text-right">Size</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredFiles.map((f) => (
                    <tr
                      key={f.inode}
                      onClick={() => setSelectedFile(f)}
                      className={`cursor-pointer transition-colors ${
                        selectedFile.inode === f.inode ? 'bg-[#1a2538]' : 'hover:bg-[#171f2d]'
                      }`}
                    >
                      <td className="py-3 px-3 font-mono text-sky-400 whitespace-nowrap">{f.inode}</td>
                      <td className="py-3 px-3">
                        <p className="font-medium text-slate-100">{f.name}</p>
                        <p className="font-mono text-[11px] text-slate-400 truncate max-w-xs">{f.path}</p>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        {f.deleted ? (
                          <span className="inline-flex items-center gap-1 text-rose-400 font-medium">
                            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Deleted</span>
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-medium">Allocated</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-300 tabular-nums whitespace-nowrap">
                        {formatBytes(f.sizeBytes)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Selected File Artifact Inspector */}
          <div className="xl:col-span-5 bg-[#131a26] border border-slate-800 rounded-lg p-5 space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <span className="font-mono text-xs text-sky-400">
                  TSK icat · Inode {selectedFile.inode}
                </span>
                <h2 className="text-base font-semibold text-slate-100 mt-0.5">{selectedFile.name}</h2>
                <p className="font-mono text-[11px] text-slate-400 break-all mt-0.5">{selectedFile.path}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-[#0b0f17] border border-slate-800 rounded-lg p-3">
              {selectedFile.artifactNote}
            </p>

            {/* MACB Timestamps */}
            <div>
              <h3 className="text-xs font-semibold text-slate-200 mb-2">NTFS $MFT MACB Timestamps</h3>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="bg-[#0b0f17] border border-slate-800 rounded p-2">
                  <span className="text-slate-500 block">Modified (M)</span>
                  <span className="text-slate-200 tabular-nums">{selectedFile.macb.modified}</span>
                </div>
                <div className="bg-[#0b0f17] border border-slate-800 rounded p-2">
                  <span className="text-slate-500 block">Accessed (A)</span>
                  <span className="text-slate-200 tabular-nums">{selectedFile.macb.accessed}</span>
                </div>
                <div className="bg-[#0b0f17] border border-slate-800 rounded p-2">
                  <span className="text-slate-500 block">MFT Changed (C)</span>
                  <span className="text-slate-200 tabular-nums">{selectedFile.macb.mftChanged}</span>
                </div>
                <div className="bg-[#0b0f17] border border-slate-800 rounded p-2">
                  <span className="text-slate-500 block">Created (B)</span>
                  <span className="text-slate-200 tabular-nums">{selectedFile.macb.created}</span>
                </div>
              </div>
            </div>

            {/* Dual SHA-256 + MD5 Hashes */}
            <div className="space-y-1.5 text-[11px] font-mono bg-[#0b0f17] border border-slate-800 rounded-lg p-3">
              <div>
                <span className="text-slate-500">SHA-256: </span>
                <span className="text-emerald-400 break-all">{selectedFile.sha256}</span>
              </div>
              <div>
                <span className="text-slate-500">MD5: </span>
                <span className="text-sky-400 break-all">{selectedFile.md5}</span>
              </div>
            </div>

            {/* Mini Hex Preview */}
            <div>
              <h3 className="text-xs font-semibold text-slate-200 mb-1.5">Header Sector Hex Preview</h3>
              <div className="bg-[#0b0f17] border border-slate-800 rounded-lg p-3 font-mono text-[11px] overflow-x-auto space-y-1">
                {selectedFile.hexPreview.map((row) => (
                  <div key={row.offset} className="flex gap-3 whitespace-nowrap">
                    <span className="text-slate-500">{row.offset}</span>
                    <span className="text-slate-300">{row.hex}</span>
                    <span className="text-amber-400">{row.ascii}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              disabled={loggingNoteId === selectedFile.inode}
              onClick={() => handleLogArtifactNote(selectedFile)}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-500 disabled:opacity-50"
            >
              <FileCheck2 className="w-4 h-4" aria-hidden="true" />
              <span>
                {loggingNoteId === selectedFile.inode
                  ? 'Logging to Case...'
                  : `Log Finding to Case ${profile.caseNumber}`}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: Partition Layout (mmls) */}
      {activeSubTab === 'partitions' && (
        <div className="space-y-5">
          <div className="bg-[#131a26] border border-slate-800 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-100">
                  Volume Partition Map (`mmls` — {profile.scheme})
                </h2>
                <p className="text-xs text-slate-400">
                  Logical block addressing (LBA) across {profile.totalSectors.toLocaleString()} sectors
                </p>
              </div>
              <HardDrive className="w-4 h-4 text-sky-400" aria-hidden="true" />
            </div>

            <div className="h-8 bg-[#0b0f17] border border-slate-800 rounded-lg overflow-hidden flex text-[11px] font-mono">
              {profile.partitions.map((part, idx) => {
                const widthPct = Math.max(
                  (part.lengthSectors / profile.totalSectors) * 100,
                  8
                );
                const colors = ['bg-sky-700/70', 'bg-slate-700/70', 'bg-emerald-700/70', 'bg-violet-700/70'];
                return (
                  <div
                    key={part.slot}
                    style={{ width: `${widthPct}%` }}
                    className={`${colors[idx % colors.length]} border-r border-slate-900 px-2 flex items-center justify-between truncate text-white`}
                    title={`${part.description} (${part.sizeLabel})`}
                  >
                    <span className="truncate">{part.fileSystem}</span>
                    <span className="hidden sm:inline text-slate-200">{part.sizeLabel}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-[#131a26] border border-slate-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#0f1520] text-slate-400 font-medium">
                    <th className="py-2.5 px-4">Slot</th>
                    <th className="py-2.5 px-4 text-right">Start Sector</th>
                    <th className="py-2.5 px-4 text-right">End Sector</th>
                    <th className="py-2.5 px-4 text-right">Length</th>
                    <th className="py-2.5 px-4">File System</th>
                    <th className="py-2.5 px-4">Description</th>
                    <th className="py-2.5 px-4">Flags</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono">
                  {profile.partitions.map((part) => (
                    <tr key={part.slot} className="hover:bg-[#171f2d]">
                      <td className="py-3 px-4 text-sky-400">{part.slot}</td>
                      <td className="py-3 px-4 text-right text-slate-200 tabular-nums">
                        {part.startSector.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-200 tabular-nums">
                        {part.endSector.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-300 tabular-nums">
                        {part.sizeLabel}
                      </td>
                      <td className="py-3 px-4 text-emerald-400">{part.fileSystem}</td>
                      <td className="py-3 px-4 font-sans text-slate-100">{part.description}</td>
                      <td className="py-3 px-4 font-sans text-slate-400">{part.flags}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Live Binary / Disk Image Inspector */}
      {activeSubTab === 'binary' && (
        <div className="space-y-6">
          {!liveInspection ? (
            <div className="bg-[#131a26] border border-dashed border-slate-700 rounded-lg p-10 text-center space-y-4">
              <Database className="w-8 h-8 text-sky-400 mx-auto" aria-hidden="true" />
              <div>
                <h2 className="text-base font-semibold text-slate-100">
                  Live Disk Image & Binary Sector Inspector
                </h2>
                <p className="mt-1 text-xs text-slate-400 max-w-xl mx-auto">
                  Upload any local raw disk image (.img, .dd), registry hive, EVTX log, SQLite DB, or executable to parse MBR partition tables, detect magic headers, compute Shannon entropy, extract ASCII strings, and generate dual SHA-256 + MD5 hashes locally.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleRunSyntheticMbrImage}
                  className="px-4 py-2 text-xs font-medium text-slate-200 bg-[#0b0f17] border border-slate-700 rounded-lg hover:bg-slate-800"
                >
                  Load Synthetic MBR Disk Sample
                </button>
                <label className="px-4 py-2 text-xs font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-500 cursor-pointer">
                  Browse Local Image / Artifact
                  <input
                    type="file"
                    onChange={(e) => handleInspectFile(e.target.files?.[0])}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="bg-[#131a26] border border-slate-800 rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-mono text-sky-400">{liveInspection.detectedSignature}</p>
                  <h2 className="text-lg font-semibold text-slate-100">{liveInspection.fileName}</h2>
                  <p className="text-xs font-mono text-slate-400 tabular-nums">
                    Size: {formatBytes(liveInspection.sizeBytes)} · Shannon Entropy: {liveInspection.entropy} bits/byte
                  </p>
                </div>
                <button
                  type="button"
                  disabled={loggingNoteId === 'live-binary'}
                  onClick={handleLogBinaryInspection}
                  className="px-4 py-2 text-xs font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-500 disabled:opacity-50 whitespace-nowrap"
                >
                  {loggingNoteId === 'live-binary' ? 'Saving...' : 'Log Inspection to Case Notes'}
                </button>
              </div>

              {liveHashes && (
                <div className="bg-[#131a26] border border-slate-800 rounded-lg p-4 space-y-2 text-xs font-mono">
                  <div>
                    <span className="text-slate-400">SHA-256: </span>
                    <span className="text-emerald-400 break-all">{liveHashes.sha256}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">MD5: </span>
                    <span className="text-sky-400 break-all">{liveHashes.md5}</span>
                  </div>
                </div>
              )}

              {liveInspection.mbrPartitions.length > 0 && (
                <div className="bg-[#131a26] border border-slate-800 rounded-lg overflow-hidden">
                  <div className="px-5 py-3 border-b border-slate-800">
                    <h3 className="text-xs font-semibold text-slate-100">
                      Parsed MBR Partition Table (Bytes 0x1BE – 0x1FD)
                    </h3>
                  </div>
                  <table className="w-full text-left border-collapse text-xs font-mono">
                    <thead>
                      <tr className="border-b border-slate-800 bg-[#0f1520] text-slate-400">
                        <th className="py-2 px-4">Slot</th>
                        <th className="py-2 px-4">Boot</th>
                        <th className="py-2 px-4">Type</th>
                        <th className="py-2 px-4 text-right">Start LBA</th>
                        <th className="py-2 px-4 text-right">Sectors</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {liveInspection.mbrPartitions.map((p) => (
                        <tr key={p.slot}>
                          <td className="py-2 px-4 text-sky-400">#{p.slot}</td>
                          <td className="py-2 px-4 text-slate-200">{p.bootable ? '0x80 (Active)' : '0x00'}</td>
                          <td className="py-2 px-4 text-emerald-400">
                            {p.typeHex} ({p.typeLabel})
                          </td>
                          <td className="py-2 px-4 text-right text-slate-200 tabular-nums">{p.startLba}</td>
                          <td className="py-2 px-4 text-right text-slate-200 tabular-nums">{p.sectors}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-[#131a26] border border-slate-800 rounded-lg p-4 space-y-2">
                  <h3 className="text-xs font-semibold text-slate-100">Sector 0 Hex & ASCII View (First 512 Bytes)</h3>
                  <div className="bg-[#0b0f17] border border-slate-800 rounded p-3 font-mono text-[11px] max-h-72 overflow-auto space-y-1">
                    {liveInspection.hexDumpLines.map((line) => (
                      <div key={line.offset} className="flex gap-3 whitespace-nowrap">
                        <span className="text-slate-500">{line.offset}</span>
                        <span className="text-slate-300 w-[330px] shrink-0">{line.hex}</span>
                        <span className="text-amber-400">{line.ascii}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#131a26] border border-slate-800 rounded-lg p-4 space-y-2">
                  <h3 className="text-xs font-semibold text-slate-100">
                    Extracted Printable Strings ({liveInspection.extractedStrings.length})
                  </h3>
                  <div className="bg-[#0b0f17] border border-slate-800 rounded p-3 font-mono text-[11px] max-h-72 overflow-auto space-y-1 text-emerald-400">
                    {liveInspection.extractedStrings.length === 0 ? (
                      <p className="text-slate-500">No ASCII strings of length &ge; 5 found in sample header.</p>
                    ) : (
                      liveInspection.extractedStrings.map((str, i) => <p key={`${i}-${str}`}>{str}</p>)
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: DFIL 7-Phase Development Roadmap */}
      {activeSubTab === 'roadmap' && (
        <div className="bg-[#131a26] border border-slate-800 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-slate-100">
              DFIL Windows 11 Laboratory Development Roadmap
            </h2>
            <p className="text-xs text-slate-400">
              Phased forensic engine integration status (local/authorized evidence restriction active)
            </p>
          </div>
          <div className="divide-y divide-slate-800/80">
            {DFIL_ROADMAP_PHASES.map((item) => (
              <div key={item.phase} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono font-semibold text-sky-400">{item.phase}</span>
                    <span className="text-slate-600">·</span>
                    <span className="font-semibold text-slate-100">{item.title}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.scope}</p>
                </div>
                <span
                  className={`text-xs font-medium whitespace-nowrap shrink-0 ${
                    item.status === 'Implemented'
                      ? 'text-emerald-400'
                      : item.status === 'Active Milestone'
                      ? 'text-sky-400'
                      : 'text-amber-400'
                  }`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
