export interface ForensicAnalysisArtifact {
  id: string;
  timestamp: string;
  source: string;
  destinationOrTarget: string;
  protocolOrModule: string;
  severity: 'Suspicious' | 'Noteworthy' | 'Safe';
  summary: string;
}

export interface ForensicAnalysisDataset {
  id: string;
  caseNumber: string;
  title: string;
  subtitle: string;
  analysisType: 'Network Traffic Analysis' | 'Disk & Memory Forensics' | 'Mobile Artifact Inspection';
  dataSource: string;
  toolSuite: string;
  captureDurationOrSize: string;
  examiner: string;
  statusText: string;
  suspiciousCount: number;
  noteworthyCount: number;
  safeCount: number;
  endpointsCount: number;
  breakdown: { label: string; count: number; severity: 'Suspicious' | 'Noteworthy' | 'Safe' }[];
  artifacts: ForensicAnalysisArtifact[];
}

export const FORENSIC_ANALYSIS_DATASETS: ForensicAnalysisDataset[] = [
  {
    id: 'ana-network',
    caseNumber: 'DFL-2026-002',
    title: 'Traffic Analysis Dashboard',
    subtitle:
      'Summary of suspicious activity, noteworthy behaviors, flagged endpoints, and protocol usage observed in the core switch capture.',
    analysisType: 'Network Traffic Analysis',
    dataSource: 'SPAN-CORE-48H.pcapng (Offline Capture)',
    toolSuite: 'Wireshark 4.4 · Zeek · Python Log Correlator',
    captureDurationOrSize: '48h 00m · 460.5 MB',
    examiner: 'Sanaullah Khan',
    statusText: 'Analysis Complete',
    suspiciousCount: 2,
    noteworthyCount: 200,
    safeCount: 399,
    endpointsCount: 429,
    breakdown: [
      { label: 'Periodic TLS Beacons', count: 2, severity: 'Suspicious' },
      { label: 'Unusual Outbound Ports', count: 44, severity: 'Noteworthy' },
      { label: 'Self-Signed Certificates', count: 68, severity: 'Noteworthy' },
      { label: 'DNS NXDOMAIN Bursts', count: 88, severity: 'Noteworthy' },
      { label: 'Verified Enterprise TLS', count: 399, severity: 'Safe' },
    ],
    artifacts: [
      {
        id: 'art-1',
        timestamp: '2026-11-07 02:14:09 UTC',
        source: '10.24.8.41 (WS-ENG-09)',
        destinationOrTarget: '185.199.x.x:443',
        protocolOrModule: 'TLSv1.3 / JA3',
        severity: 'Suspicious',
        summary: '300s periodic ClientHello beacon matching unapproved external relay profile.',
      },
      {
        id: 'art-2',
        timestamp: '2026-11-07 02:19:09 UTC',
        source: '10.24.8.41 (WS-ENG-09)',
        destinationOrTarget: '185.199.x.x:443',
        protocolOrModule: 'TLSv1.3 / DNS',
        severity: 'Suspicious',
        summary: 'Repeated beacon burst following high-entropy TXT DNS resolution.',
      },
      {
        id: 'art-3',
        timestamp: '2026-11-07 09:42:18 UTC',
        source: '10.24.4.12 (NAS-BACKUP)',
        destinationOrTarget: '10.24.1.10:445',
        protocolOrModule: 'SMB3',
        severity: 'Noteworthy',
        summary: 'Large off-hours encrypted block synchronization (14.2 GB) verified against maintenance window.',
      },
      {
        id: 'art-4',
        timestamp: '2026-11-07 11:05:51 UTC',
        source: '10.24.2.104 (FIN-WS-14)',
        destinationOrTarget: '10.24.1.5:389',
        protocolOrModule: 'LDAP',
        severity: 'Safe',
        summary: 'Standard Active Directory Kerberos/LDAP directory bind.',
      },
    ],
  },
  {
    id: 'ana-disk-ram',
    caseNumber: 'DFL-2026-001',
    title: 'Disk & Memory Forensics Dashboard',
    subtitle:
      'Summary of USB mass storage artifacts, volatile process handles, registry persistence, and file-system timeline events on Finance WS-14.',
    analysisType: 'Disk & Memory Forensics',
    dataSource: 'IMG-2026-001-A.E01 + WS-FIN-014.raw',
    toolSuite: 'Autopsy 4.21 · Volatility 3 · KAPE · FTK Imager',
    captureDurationOrSize: '1 TB NVMe + 64 GB RAM',
    examiner: 'Ayesha Siddiqui',
    statusText: 'Examination Active',
    suspiciousCount: 3,
    noteworthyCount: 48,
    safeCount: 1240,
    endpointsCount: 18,
    breakdown: [
      { label: 'Unapproved USBSTOR Mount', count: 3, severity: 'Suspicious' },
      { label: 'Robocopy File Staging', count: 16, severity: 'Noteworthy' },
      { label: 'Deleted LNK / ShellBags', count: 32, severity: 'Noteworthy' },
      { label: 'Signed OS Binaries', count: 1240, severity: 'Safe' },
    ],
    artifacts: [
      {
        id: 'art-5',
        timestamp: '2026-11-02 12:42:11 UTC',
        source: 'SYSTEM\\USBSTOR',
        destinationOrTarget: 'SanDisk Ultra 128GB (4C5300011209)',
        protocolOrModule: 'Windows Registry',
        severity: 'Suspicious',
        summary: 'Unauthorized removable flash drive mounted on volume E: outside approved asset list.',
      },
      {
        id: 'art-6',
        timestamp: '2026-11-02 12:44:03 UTC',
        source: 'PID 4188 (robocopy.exe)',
        destinationOrTarget: 'E:\\Export\\Q3_Ledger\\',
        protocolOrModule: 'Volatility pslist / filescan',
        severity: 'Suspicious',
        summary: 'Bulk directory copy executed toward removable volume E: from Finance share.',
      },
      {
        id: 'art-7',
        timestamp: '2026-11-02 12:47:29 UTC',
        source: 'NTUSER.DAT ShellBags',
        destinationOrTarget: 'C:\\Users\\m.ali\\Desktop\\Archive.zip',
        protocolOrModule: 'Autopsy / KAPE',
        severity: 'Suspicious',
        summary: 'Deleted staging archive recovered from $MFT unallocated cluster run.',
      },
      {
        id: 'art-8',
        timestamp: '2026-11-02 12:55:00 UTC',
        source: 'PID 712 (lsass.exe)',
        destinationOrTarget: 'Kernel Memory Space',
        protocolOrModule: 'Volatility malfind',
        severity: 'Safe',
        summary: 'Zero injected RWX memory pages or unlinked kernel drivers detected.',
      },
    ],
  },
  {
    id: 'ana-mobile',
    caseNumber: 'DFL-2026-003',
    title: 'Mobile Artifact Inspection Dashboard',
    subtitle:
      'Authorized logical backup triage, SQLite messaging store extraction, and acquisition limitation summary.',
    analysisType: 'Mobile Artifact Inspection',
    dataSource: 'Corporate Handset Logical Backup (RF-109)',
    toolSuite: 'SQLite Browser · Python Decoder · SHA-256 Seal',
    captureDurationOrSize: '256 GB Logical Scope',
    examiner: 'Bilal Qureshi',
    statusText: 'Intake Staging',
    suspiciousCount: 1,
    noteworthyCount: 24,
    safeCount: 512,
    endpointsCount: 14,
    breakdown: [
      { label: 'Exported SQLite Attachments', count: 1, severity: 'Suspicious' },
      { label: 'Encrypted App Databases', count: 24, severity: 'Noteworthy' },
      { label: 'System App Manifests', count: 512, severity: 'Safe' },
    ],
    artifacts: [
      {
        id: 'art-9',
        timestamp: '2026-11-14 05:30:00 UTC',
        source: 'Backup Manifest.db',
        destinationOrTarget: 'Messaging Attachment Cache',
        protocolOrModule: 'SQLite Browser',
        severity: 'Suspicious',
        summary: 'Flagged outbound document attachment hash pending secondary verification.',
      },
      {
        id: 'art-10',
        timestamp: '2026-11-14 05:35:00 UTC',
        source: 'Keychain / Secure Enclave',
        destinationOrTarget: 'Hardware-Backed Partition',
        protocolOrModule: 'Acquisition Limitation',
        severity: 'Noteworthy',
        summary: 'Full physical dump excluded per authorized logical scope and hardware encryption boundary.',
      },
    ],
  },
];
