export const PROPOSAL_METADATA = {
  projectName: 'Digital Forensics Laboratory',
  organizationType: 'Private Organization',
  deploymentPlatform: 'Windows',
  productionArchitecture: 'Python Flask / SQLite (proposed production architecture); interactive local prototype',
  category: 'Digital Forensics, Cybersecurity, Digital Evidence Management',
  documentStatus: 'Initial proposal for management review and budget approval',
  totalInvestmentPkr: 9735000,
  totalDurationWeeks: 18,
};

export const PROJECT_OBJECTIVES: string[] = [
  'Establish a secure and professionally equipped digital forensics laboratory.',
  'Develop standardized digital evidence acquisition and preservation procedures.',
  'Provide computer, mobile, storage, and network forensic examination capabilities.',
  'Maintain documented chain-of-custody records.',
  'Implement cryptographic integrity verification using SHA-256.',
  'Develop a centralized case and evidence management system.',
  'Produce consistent, technically defensible investigation reports.',
  'Protect confidential organizational and client information.',
  'Establish quality assurance and controlled access procedures.',
  'Support authorized internal investigations and external client engagements.',
];

export interface LaboratoryDivisionSpec {
  id: string;
  code: string;
  title: string;
  summary: string;
  capabilities: string[];
}

export const LABORATORY_DIVISIONS: LaboratoryDivisionSpec[] = [
  {
    id: 'computer',
    code: '3.1',
    title: 'Computer Forensics Division',
    summary: 'Host-based examination of workstations, storage volumes, operating system artifacts, and user timelines.',
    capabilities: [
      'Desktop and laptop examination.',
      'Storage media analysis.',
      'File system and operating system artifact examination.',
      'Deleted-file recovery using validated forensic tools.',
      'Timeline and user activity analysis.',
    ],
  },
  {
    id: 'mobile',
    code: '3.2',
    title: 'Mobile Forensics Division',
    summary: 'Controlled acquisition and artifact interpretation for authorized handheld devices and backups.',
    capabilities: [
      'Authorized mobile device acquisition.',
      'Mobile backup examination.',
      'Application and communication artifact analysis.',
      'Device and media inventory.',
      'Documentation of acquisition limitations.',
    ],
  },
  {
    id: 'network',
    code: '3.3',
    title: 'Network Forensics Division',
    summary: 'Packet inspection, perimeter log correlation, and incident timeline reconstruction across enterprise infrastructure.',
    capabilities: [
      'Network traffic examination.',
      'Firewall and server log analysis.',
      'Incident timeline reconstruction.',
      'Network event correlation.',
      'Authorized incident investigation.',
    ],
  },
  {
    id: 'dem',
    code: '3.4',
    title: 'Digital Evidence Management Division',
    summary: 'Custodial governance, cryptographic hash assurance, and court-ready documentation control.',
    capabilities: [
      'Evidence registration and unique identification.',
      'Evidence storage and access records.',
      'SHA-256 integrity verification.',
      'Chain-of-custody management.',
      'Investigation documentation and reporting.',
    ],
  },
];

export const PHYSICAL_INFRASTRUCTURE: { item: string; specification: string }[] = [
  { item: 'Dedicated laboratory room', specification: 'Access-controlled examination workspace with badge/PIN entry' },
  { item: 'Evidence receiving & storage area', specification: 'Physically separated intake counter and locked vault zone' },
  { item: 'Forensic examination workstations', specification: 'Isolated analysis benches with ESD-safe grounding mats' },
  { item: 'Secure network & server infrastructure', specification: 'Air-gapped forensic VLAN plus segmented storage server' },
  { item: 'CCTV and physical access monitoring', specification: 'Continuous corridor, intake counter, and vault recording' },
  { item: 'UPS and backup power', specification: 'Clean sine-wave power protection during multi-hour imaging runs' },
  { item: 'Fire detection and suppression systems', specification: 'Non-conductive clean-agent protection for hardware & media' },
  { item: 'Secure cabinets & tamper-evident packaging', specification: 'Keyed steel cabinets, anti-static bags, and serialized seals' },
  { item: 'Environmental monitoring & ventilation', specification: 'Temperature/humidity logging and continuous HVAC airflow' },
];

export const HARDWARE_REQUIREMENTS: { equipment: string; quantity: string; category: string }[] = [
  { equipment: 'High-performance forensic workstation', quantity: '2', category: 'Compute' },
  { equipment: 'General investigation workstation', quantity: '2', category: 'Compute' },
  { equipment: 'Secure NAS/storage system', quantity: '1', category: 'Storage' },
  { equipment: 'Evidence storage server', quantity: '1', category: 'Storage' },
  { equipment: 'Write-blocking equipment', quantity: '2', category: 'Acquisition' },
  { equipment: 'External encrypted storage devices', quantity: '4', category: 'Acquisition' },
  { equipment: 'Network analysis equipment', quantity: '1 set', category: 'Network' },
  { equipment: 'UPS systems', quantity: '3', category: 'Power' },
  { equipment: 'Secure evidence cabinets', quantity: '2', category: 'Security' },
  { equipment: 'CCTV and access control', quantity: '1 set', category: 'Security' },
  { equipment: 'Printer/scanner', quantity: '1', category: 'Documentation' },
];

export const WORKSTATION_BASELINE = [
  'Intel Core i7/i9 or AMD Ryzen 7/9 processor',
  'Minimum 32 GB RAM; preferably 64 GB or more',
  '1–2 TB NVMe SSD system & scratch drive',
  'Additional high-capacity examination storage',
  'Dedicated graphics capability where needed',
  'Windows 11 Pro or supported enterprise Windows edition',
];

export interface SoftwareToolSpec {
  name: string;
  purpose: string;
  division: string;
  licenseType: string;
  validationStatus: 'Validated Baseline' | 'Commercial License Review';
}

export const SOFTWARE_TOOLS: SoftwareToolSpec[] = [
  {
    name: 'Autopsy / The Sleuth Kit',
    purpose: 'Disk and file system examination, keyword indexing, and artifact recovery.',
    division: 'Computer Forensics',
    licenseType: 'Open Source (Apache / CPL)',
    validationStatus: 'Validated Baseline',
  },
  {
    name: 'FTK Imager',
    purpose: 'Forensic disk imaging, mount verification, and SHA-256 image sealing.',
    division: 'Acquisition & Evidence',
    licenseType: 'Freeware / Commercial Suite Option',
    validationStatus: 'Validated Baseline',
  },
  {
    name: 'Wireshark',
    purpose: 'Deep packet inspection and network traffic protocol reconstruction.',
    division: 'Network Forensics',
    licenseType: 'Open Source (GPLv2)',
    validationStatus: 'Validated Baseline',
  },
  {
    name: 'Volatility',
    purpose: 'Volatile RAM dump forensics, process tree analysis, and injected code triage.',
    division: 'Computer Forensics',
    licenseType: 'Open Source (VSL)',
    validationStatus: 'Validated Baseline',
  },
  {
    name: 'KAPE',
    purpose: 'Rapid forensic artifact triage and collection in authorized Windows environments.',
    division: 'Computer Forensics',
    licenseType: 'Commercial / Enterprise License',
    validationStatus: 'Commercial License Review',
  },
  {
    name: 'SQLite Browser',
    purpose: 'Structured inspection of browser histories, messaging DBs, and app stores.',
    division: 'Mobile & Computer',
    licenseType: 'Open Source (MPL/GPL)',
    validationStatus: 'Validated Baseline',
  },
  {
    name: 'Python',
    purpose: 'Forensic automation scripts, log parsing, and custom artifact decoders.',
    division: 'Cross-Division',
    licenseType: 'Open Source (PSF)',
    validationStatus: 'Validated Baseline',
  },
  {
    name: 'VeraCrypt / Enterprise Encryption',
    purpose: 'Protected encrypted containers for sensitive working images and client deliverables.',
    division: 'Evidence Management',
    licenseType: 'Open Source / Enterprise',
    validationStatus: 'Validated Baseline',
  },
];

export const EVIDENCE_HANDLING_STEPS: { step: number; title: string; detail: string }[] = [
  { step: 1, title: 'Case authorization & registration', detail: 'Verify written mandate and register case metadata prior to device receipt.' },
  { step: 2, title: 'Evidence intake & unique ID', detail: 'Assign immutable lab evidence serial code and seal in tamper-evident packaging.' },
  { step: 3, title: 'Condition photography & documentation', detail: 'Photograph physical state, serial labels, ports, and existing damage.' },
  { step: 4, title: 'Source & receiving officer log', detail: 'Record owner, source location, receiving custodian, date, and UTC/local timestamp.' },
  { step: 5, title: 'Validated acquisition', detail: 'Acquire image using hardware write-blockers and tested imaging tools.' },
  { step: 6, title: 'SHA-256 hash recording', detail: 'Compute and bind baseline SHA-256 cryptographic digest to the intake record.' },
  { step: 7, title: 'Original evidence preservation', detail: 'Return original media to locked, climate-monitored evidence vault.' },
  { step: 8, title: 'Examination on forensic copies', detail: 'Execute all analysis exclusively against verified working copies.' },
  { step: 9, title: 'Transfer & access logging', detail: 'Log every custody handoff, vault access, and hash re-verification event.' },
  { step: 10, title: 'Reporting & case closure', detail: 'Issue technical report, undergo QA review, and archive/return evidence.' },
];

export const HR_PLAN: { position: string; count: number; responsibilities: string }[] = [
  { position: 'Laboratory Director / Manager', count: 1, responsibilities: 'Governance, client engagement authorization, budget oversight, and strategic operations.' },
  { position: 'Senior Digital Forensic Examiner', count: 1, responsibilities: 'Complex examinations, technical peer review, methodology validation, and expert reporting.' },
  { position: 'Digital Forensic Examiners', count: 2, responsibilities: 'Computer, mobile, and network acquisition, artifact analysis, and examination notes.' },
  { position: 'Evidence Custodian', count: 1, responsibilities: 'Evidence intake, physical vault control, seal verification, and chain-of-custody logs.' },
  { position: 'IT / System Administrator', count: 1, responsibilities: 'Workstation hardening, NAS/storage maintenance, backups, and network segmentation.' },
  { position: 'Quality Assurance Officer', count: 1, responsibilities: 'ISO 17025/27001/27037 SOP compliance, tool validation audits, and report sign-off.' },
];

export interface BudgetLineItem {
  id: string;
  component: string;
  category: 'Hardware' | 'Facility & Security' | 'Software & Training' | 'Contingency';
  costPkr: number;
  notes: string;
}

export const BUDGET_ITEMS: BudgetLineItem[] = [
  { id: 'b1', component: 'Forensic workstations', category: 'Hardware', costPkr: 2000000, notes: '2 high-spec multi-core NVMe forensic analysis rigs' },
  { id: 'b2', component: 'General workstations', category: 'Hardware', costPkr: 700000, notes: '2 reporting & triage workstations' },
  { id: 'b3', component: 'Storage and backup infrastructure', category: 'Hardware', costPkr: 1200000, notes: 'Secure NAS + dedicated evidence storage server' },
  { id: 'b4', component: 'Forensic acquisition equipment', category: 'Hardware', costPkr: 900000, notes: 'Hardware write-blockers (2) & encrypted drives (4)' },
  { id: 'b5', component: 'Network equipment', category: 'Hardware', costPkr: 350000, notes: 'Segmented switches, TAP/SPAN capture gear' },
  { id: 'b6', component: 'UPS and electrical arrangements', category: 'Facility & Security', costPkr: 450000, notes: '3 UPS units + dedicated lab circuit conditioning' },
  { id: 'b7', component: 'Physical security and evidence storage', category: 'Facility & Security', costPkr: 650000, notes: 'Evidence cabinets (2), CCTV, access control, tamper seals' },
  { id: 'b8', component: 'Laboratory furniture and renovation', category: 'Facility & Security', costPkr: 800000, notes: 'ESD benches, partitions, fire suppression, ventilation' },
  { id: 'b9', component: 'Software licensing and support', category: 'Software & Training', costPkr: 1200000, notes: 'Commercial forensic tools & Windows enterprise licenses' },
  { id: 'b10', component: 'Training and certification', category: 'Software & Training', costPkr: 600000, notes: 'Examiner onboarding, tool proficiency & SOP drills' },
  { id: 'b11', component: 'Initial contingency', category: 'Contingency', costPkr: 885000, notes: '10% preliminary allowance for currency/spec variance' },
];

export interface TimelinePhase {
  phase: number;
  activity: string;
  durationWeeks: number;
  startWeek: number;
  endWeek: number;
  deliverable: string;
}

export const IMPLEMENTATION_TIMELINE: TimelinePhase[] = [
  { phase: 1, activity: 'Approval and requirements', durationWeeks: 2, startWeek: 1, endWeek: 2, deliverable: 'Signed charter & finalized hardware/software specifications' },
  { phase: 2, activity: 'Laboratory design and procurement', durationWeeks: 4, startWeek: 2, endWeek: 5, deliverable: 'Vendor purchase orders & floorplan security blueprint' },
  { phase: 3, activity: 'Physical infrastructure setup', durationWeeks: 3, startWeek: 5, endWeek: 7, deliverable: 'Access-controlled room, electrical/UPS, cabinets & CCTV' },
  { phase: 4, activity: 'Hardware and software installation', durationWeeks: 2, startWeek: 8, endWeek: 9, deliverable: 'Hardened Windows workstations, NAS & validated tools' },
  { phase: 5, activity: 'Application deployment', durationWeeks: 2, startWeek: 10, endWeek: 11, deliverable: 'LIMS portal live with role access & encrypted backups' },
  { phase: 6, activity: 'Staff training and SOP development', durationWeeks: 2, startWeek: 12, endWeek: 13, deliverable: 'Signed SOP binder & examiner qualification records' },
  { phase: 7, activity: 'Validation and pilot operation', durationWeeks: 2, startWeek: 14, endWeek: 15, deliverable: 'Mock case validation & SHA-256 audit verification' },
  { phase: 8, activity: 'Operational launch', durationWeeks: 1, startWeek: 16, endWeek: 18, deliverable: 'Formal laboratory commissioning (18-week horizon)' },
];

export const COMPLIANCE_STANDARDS: { code: string; title: string; scope: string }[] = [
  {
    code: 'ISO/IEC 17025',
    title: 'Testing & Calibration Laboratory Competence',
    scope: 'Guides impartiality, examiner competence, method validation, equipment calibration, and reproducible technical reporting.',
  },
  {
    code: 'ISO/IEC 27001',
    title: 'Information Security Management System',
    scope: 'Establishes access controls, cryptographic protection, audit logging, and confidentiality safeguards for sensitive client evidence.',
  },
  {
    code: 'ISO/IEC 27037',
    title: 'Digital Evidence Identification, Collection, Acquisition & Preservation',
    scope: 'Defines non-destructive acquisition, write-blocking controls, hash verification, and continuous chain-of-custody records.',
  },
  {
    code: 'Pakistani Legal & Regulatory Framework',
    title: 'Statutory & Contractual Obligations',
    scope: 'Aligns evidence admissibility, electronic documentation integrity, and client NDA requirements with applicable Pakistani law.',
  },
];

export const RISK_REGISTER: { risk: string; severity: 'High' | 'Medium'; impact: string; mitigation: string }[] = [
  {
    risk: 'Evidence contamination or alteration',
    severity: 'High',
    impact: 'Compromises forensic integrity and legal defensibility of findings.',
    mitigation: 'Mandatory hardware write-blockers, examination on verified copies only, and intake SHA-256 sealing.',
  },
  {
    risk: 'Unauthorized physical or logical access',
    severity: 'High',
    impact: 'Confidential data breach and broken chain of custody.',
    mitigation: 'Badge/PIN laboratory entry, CCTV monitoring, locked evidence cabinets, RBAC & encrypted volumes.',
  },
  {
    risk: 'Hardware or power failure during imaging',
    severity: 'Medium',
    impact: 'Corrupted forensic acquisitions or storage loss.',
    mitigation: '3 dedicated UPS units, redundant NAS storage, and scheduled encrypted backups.',
  },
  {
    risk: 'Incomplete chain-of-custody documentation',
    severity: 'High',
    impact: 'Gaps in provenance challenge evidentiary reliability.',
    mitigation: 'Centralized LIMS custody ledger requiring transfer seal IDs and dual-party sign-off.',
  },
  {
    risk: 'Examiner error or unvalidated tooling',
    severity: 'Medium',
    impact: 'Misinterpreted artifacts or inconsistent reports.',
    mitigation: 'Pre-operational tool validation, documented SOPs, examiner training, and independent QA peer review.',
  },
  {
    risk: 'Unauthorized data disclosure',
    severity: 'High',
    impact: 'Contractual breach and reputational liability.',
    mitigation: 'Air-gapped forensic network, VeraCrypt encrypted deliverables, and audit trail monitoring.',
  },
];
