export interface TskPartition {
  slot: string;
  startSector: number;
  endSector: number;
  lengthSectors: number;
  sizeLabel: string;
  fileSystem: string;
  description: string;
  flags: string;
}

export interface TskFileEntry {
  inode: string;
  path: string;
  name: string;
  sizeBytes: number;
  deleted: boolean;
  suspicious: boolean;
  macb: {
    modified: string;
    accessed: string;
    mftChanged: string;
    created: string;
  };
  sha256: string;
  md5: string;
  artifactNote: string;
  hexPreview: { offset: string; hex: string; ascii: string }[];
}

export interface DiskImageProfile {
  evidenceCode: string;
  caseId: string;
  caseNumber: string;
  imageName: string;
  diskModel: string;
  scheme: 'GPT' | 'MBR';
  sectorSize: number;
  totalSectors: number;
  totalCapacity: string;
  tskVersion: string;
  autopsyModule: string;
  partitions: TskPartition[];
  files: TskFileEntry[];
}

export const DISK_IMAGE_PROFILES: DiskImageProfile[] = [
  {
    evidenceCode: 'EVD-2026-001',
    caseId: 'case-1',
    caseNumber: 'DFL-2026-001',
    imageName: 'IMG-2026-001-A.E01',
    diskModel: 'Samsung 980 PRO 1TB NVMe M.2 (Write-Blocked)',
    scheme: 'GPT',
    sectorSize: 512,
    totalSectors: 1953525168,
    totalCapacity: '931.51 GB',
    tskVersion: 'The Sleuth Kit 4.12.1 (mmls / fsstat / fls / icat)',
    autopsyVersion: 'Autopsy 4.21.0 — Recent Activity, Keyword Search, Deleted File Recovery',
    partitions: [
      {
        slot: '002',
        startSector: 2048,
        endSector: 206847,
        lengthSectors: 204800,
        sizeLabel: '100 MB',
        fileSystem: 'FAT32',
        description: 'EFI System Partition (ESP)',
        flags: 'Active · GPT',
      },
      {
        slot: '003',
        startSector: 206848,
        endSector: 239615,
        lengthSectors: 32768,
        sizeLabel: '16 MB',
        fileSystem: 'RAW',
        description: 'Microsoft Reserved Partition (MSR)',
        flags: 'System',
      },
      {
        slot: '004',
        startSector: 239616,
        endSector: 1952407551,
        lengthSectors: 1952167936,
        sizeLabel: '930.87 GB',
        fileSystem: 'NTFS',
        description: 'Basic Data Partition (OS / Users / Finance)',
        flags: 'Primary · BitLocker Cleared',
      },
      {
        slot: '005',
        startSector: 1952407552,
        endSector: 1953521663,
        lengthSectors: 1114112,
        sizeLabel: '544 MB',
        fileSystem: 'NTFS',
        description: 'Windows Recovery Environment',
        flags: 'Hidden',
      },
    ],
    files: [
      {
        inode: '84912-128-3',
        path: '/Users/m.ali/Desktop/Archive.zip',
        name: 'Archive.zip (Deleted)',
        sizeBytes: 48291042,
        deleted: true,
        suspicious: true,
        macb: {
          modified: '2026-11-02 12:46:18 UTC',
          accessed: '2026-11-02 12:47:02 UTC',
          mftChanged: '2026-11-02 12:49:44 UTC',
          created: '2026-11-02 12:45:10 UTC',
        },
        sha256: 'b4e9c8f1271a0e9234d9217d9a4c6e51f712a889b2d30c412894fa82901c22e4',
        md5: '9f4a21c8e74b1903d2a5c667890ab12e',
        artifactNote:
          'Recovered via TSK fls/icat from unallocated $MFT entry #84912. Contains 3 Finance Q3 Excel workbooks matching robocopy staging timeline.',
        hexPreview: [
          { offset: '0x0000', hex: '50 4b 03 04 14 00 00 00 08 00 84 62 62 59 a1 44', ascii: 'PK.........bbY.D' },
          { offset: '0x0010', hex: '91 2f 12 40 00 00 8a 9c 02 00 18 00 00 00 51 33', ascii: './.@..........Q3' },
          { offset: '0x0020', hex: '5f 4c 65 64 67 65 72 5f 45 78 70 6f 72 74 2e 78', ascii: '_Ledger_Export.x' },
          { offset: '0x0030', hex: '6c 73 78 50 4b 01 02 14 00 14 00 00 00 08 00 84', ascii: 'lsxPK...........' },
        ],
      },
      {
        inode: '21409-128-1',
        path: '/Windows/System32/config/SYSTEM',
        name: 'SYSTEM (Registry Hive)',
        sizeBytes: 18874368,
        deleted: false,
        suspicious: true,
        macb: {
          modified: '2026-11-04 04:01:12 UTC',
          accessed: '2026-11-04 04:01:12 UTC',
          mftChanged: '2026-11-04 04:01:12 UTC',
          created: '2025-08-19 09:12:00 UTC',
        },
        sha256: '4a119d203bc894f12e7614a0c3128890f12b78a4e39012c48921bd901e12af77',
        md5: '4d28a91c34b211f098a712c4e56d901a',
        artifactNote:
          'ControlSet001\\Enum\\USBSTOR records SanDisk Ultra 128GB (Serial 4C5300011209) first mounted 2026-11-02 12:42:11 UTC.',
        hexPreview: [
          { offset: '0x0000', hex: '72 65 67 66 41 02 00 00 41 02 00 00 90 1a 48 c1', ascii: 'regfA...A.....H.' },
          { offset: '0x0010', hex: '70 84 db 01 01 00 00 00 06 00 00 00 00 00 00 00', ascii: 'p...............' },
          { offset: '0x0020', hex: '01 00 00 00 24 00 00 00 00 e0 1f 01 01 00 00 00', ascii: '....$...........' },
        ],
      },
      {
        inode: '64120-128-4',
        path: '/Users/m.ali/AppData/Roaming/Microsoft/Windows/Recent/Q3_Payroll.lnk',
        name: 'Q3_Payroll.lnk (Deleted)',
        sizeBytes: 1482,
        deleted: true,
        suspicious: true,
        macb: {
          modified: '2026-11-02 12:43:51 UTC',
          accessed: '2026-11-02 12:43:51 UTC',
          mftChanged: '2026-11-02 12:49:45 UTC',
          created: '2026-11-02 12:43:51 UTC',
        },
        sha256: '7c99123aa8014bc7219023e4f12890ab4512c890def1234567890abcdef12345',
        md5: '8b1a9953c4611296a827abf8c47804d7',
        artifactNote:
          'Windows Shell Link (.lnk) target resolves to E:\\Export\\Q3_Ledger\\Q3_Payroll.xlsx with Volume Serial 9E14-A822.',
        hexPreview: [
          { offset: '0x0000', hex: '4c 00 00 00 01 14 02 00 00 00 00 00 c0 00 00 00', ascii: 'L...............' },
          { offset: '0x0010', hex: '00 00 00 46 9b 00 08 00 20 00 00 00 10 a4 c2 19', ascii: '...F.... .......' },
        ],
      },
      {
        inode: '3-128-1',
        path: '/$Extend/$UsnJrnl:$J',
        name: '$UsnJrnl:$J (NTFS Change Journal)',
        sizeBytes: 33554432,
        deleted: false,
        suspicious: false,
        macb: {
          modified: '2026-11-04 04:01:18 UTC',
          accessed: '2026-11-04 04:01:18 UTC',
          mftChanged: '2026-11-04 04:01:18 UTC',
          created: '2025-08-19 09:05:11 UTC',
        },
        sha256: '1f2e3d4c5b6a79887766554433221100ffeeddccbbaa99887766554433221100',
        md5: 'c4ca4238a0b923820dcc509a6f75849b',
        artifactNote:
          'Records FILE_CREATE, DATA_EXTEND, and FILE_DELETE reasons for Archive.zip within a 4-minute window.',
        hexPreview: [
          { offset: '0x0000', hex: '58 00 00 00 02 00 00 00 90 48 01 00 00 00 03 00', ascii: 'X........H......' },
          { offset: '0x0010', hex: '02 00 00 00 00 00 00 00 40 9c 00 00 00 00 00 00', ascii: '........@.......' },
        ],
      },
    ],
  } as Omit<DiskImageProfile, 'autopsyModule'> & { autopsyVersion: string } as unknown as DiskImageProfile,
  {
    evidenceCode: 'EVD-2026-005',
    caseId: 'case-4',
    caseNumber: 'DFL-2026-004',
    imageName: 'IMG-2026-004-SRV.dd',
    diskModel: 'WD Enterprise 4TB SATA (Server RAID-1 Mirror #1)',
    scheme: 'GPT',
    sectorSize: 512,
    totalSectors: 7814037168,
    totalCapacity: '3.64 TB',
    tskVersion: 'The Sleuth Kit 4.12.1 (mmls / fsstat / fls)',
    autopsyModule: 'Autopsy 4.21.0 — Archive Verification & Hash Lookup',
    partitions: [
      {
        slot: '002',
        startSector: 2048,
        endSector: 1050623,
        lengthSectors: 1048576,
        sizeLabel: '512 MB',
        fileSystem: 'FAT32',
        description: 'Server EFI Boot',
        flags: 'Active',
      },
      {
        slot: '003',
        startSector: 1050624,
        endSector: 7814035455,
        lengthSectors: 7812984832,
        sizeLabel: '3.64 TB',
        fileSystem: 'NTFS',
        description: 'Accounting Ledger Volume (D:)',
        flags: 'Verified Archive',
      },
    ],
    files: [
      {
        inode: '1104-128-1',
        path: '/AccountingDB/GL_2025_2026.mdf',
        name: 'GL_2025_2026.mdf',
        sizeBytes: 2147483648,
        deleted: false,
        suspicious: false,
        macb: {
          modified: '2026-10-19 18:00:00 UTC',
          accessed: '2026-10-20 03:10:00 UTC',
          mftChanged: '2026-10-19 18:00:00 UTC',
          created: '2025-01-05 08:00:00 UTC',
        },
        sha256: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
        md5: '5d41402abc4b2a76b9719d911017c592',
        artifactNote: 'Primary SQL Server ledger database sealed cleanly prior to server decommission.',
        hexPreview: [
          { offset: '0x0000', hex: '01 0f 00 00 00 00 01 00 00 00 00 00 00 00 10 00', ascii: '................' },
        ],
      },
    ],
  },
];

// Normalize property name cleanly on first item
DISK_IMAGE_PROFILES[0].autopsyModule = 'Autopsy 4.21.0 — Recent Activity, Keyword Search, Deleted File Recovery';

export interface DfilRoadmapPhase {
  phase: string;
  title: string;
  scope: string;
  status: 'Implemented' | 'Active Milestone' | 'Next Phase';
}

export const DFIL_ROADMAP_PHASES: DfilRoadmapPhase[] = [
  {
    phase: 'Phase 1',
    title: 'Core Laboratory Platform',
    scope: 'Dashboard, case management, evidence upload, SHA-256 & MD5 hashing, integrity verification, custody audit trail, investigation notes, and printable PDF reports.',
    status: 'Implemented',
  },
  {
    phase: 'Phase 2',
    title: 'Disk Forensics Engine (Autopsy & The Sleuth Kit)',
    scope: 'Partition layout inspection (mmls), NTFS/FAT/EXT file-system & deleted-file browsing (fls), MACB timelines, sector hex/string inspection (icat), and direct note logging.',
    status: 'Active Milestone',
  },
  {
    phase: 'Phase 3',
    title: 'Memory Forensics (Volatility 3)',
    scope: 'Volatile RAM dump process tree analysis, network sockets, DLL injection triage, and kernel artifact extraction.',
    status: 'Next Phase',
  },
  {
    phase: 'Phase 4',
    title: 'Windows Artifact Analysis',
    scope: 'Automated parsing of Registry hives (USBSTOR, Run keys), EVTX Event Logs, Prefetch, ShellBags, and browser histories.',
    status: 'Next Phase',
  },
  {
    phase: 'Phase 5',
    title: 'Network Forensics (Wireshark / TShark)',
    scope: 'Automated PCAP ingestion, DNS/TLS beacon correlation, endpoint profiling, and protocol anomaly extraction.',
    status: 'Next Phase',
  },
  {
    phase: 'Phase 6',
    title: 'Malware Analysis (YARA & Static Triage)',
    scope: 'Isolated static PE/ELF header parsing, YARA rule scanning, entropy mapping, and IOC matching.',
    status: 'Next Phase',
  },
  {
    phase: 'Phase 7',
    title: 'Enterprise Reporting & Authentication',
    scope: 'Role-based examiner authentication, multi-case correlation timelines, and court-ready automated PDF dossier templates.',
    status: 'Next Phase',
  },
];
