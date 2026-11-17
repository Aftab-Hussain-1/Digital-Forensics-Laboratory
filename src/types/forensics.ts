export type DivisionType =
  | 'Computer Forensics'
  | 'Mobile Forensics'
  | 'Network Forensics'
  | 'Digital Evidence Management';

export type CaseStatus = 'Intake' | 'In Examination' | 'Peer Review' | 'Closed';

export type CasePriority = 'Standard' | 'High' | 'Urgent';

export type IntegrityStatus = 'Verified Match' | 'Pending Verification' | 'Hash Mismatch';

export interface ForensicCase {
  id: string;
  caseNumber: string;
  title: string;
  requestingParty: string;
  authorizationRef: string;
  division: DivisionType;
  priority: CasePriority;
  status: CaseStatus;
  leadExaminerId: string;
  leadExaminerName: string;
  openedAt: string;
  updatedAt: string;
  summary: string;
  completedPolicySteps: number[];
}

export interface EvidenceItem {
  id: string;
  evidenceCode: string;
  caseId: string;
  caseNumber: string;
  description: string;
  mediaType: string;
  serialNumber: string;
  receivedCondition: string;
  sourceOwner: string;
  receivingOfficer: string;
  receivedAt: string;
  acquisitionMethod: string;
  forensicCopyId: string;
  storageLocation: string;
  currentCustodian: string;
  baselineSha256: string;
  lastVerifiedSha256: string | null;
  lastVerifiedAt: string | null;
  integrityStatus: IntegrityStatus;
  verificationCount: number;
}

export interface HashVerificationRecord {
  id: string;
  evidenceId: string;
  evidenceCode: string;
  caseNumber: string;
  fileName: string;
  fileSizeBytes: number;
  computedSha256: string;
  expectedSha256: string;
  matched: boolean;
  verifiedBy: string;
  verifiedAt: string;
  notes: string;
}

export interface CustodyTransfer {
  id: string;
  evidenceId: string;
  evidenceCode: string;
  caseNumber: string;
  transferredAt: string;
  fromHolder: string;
  toHolder: string;
  purpose: string;
  sealNumber: string;
  authorizedBy: string;
  remarks: string;
}

export interface Investigator {
  id: string;
  employeeCode: string;
  fullName: string;
  roleTitle: string;
  division: DivisionType | 'Laboratory Leadership' | 'Quality & Administration';
  certifications: string[];
  email: string;
  status: 'Active' | 'On Assignment' | 'Review Duty';
  clearanceLevel: string;
}

export interface ExaminationNote {
  id: string;
  caseId: string;
  caseNumber: string;
  evidenceCode: string;
  examinerName: string;
  toolUsed: string;
  createdAt: string;
  findingTitle: string;
  content: string;
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  targetType: 'Case' | 'Evidence' | 'HashVerification' | 'Custody' | 'Note' | 'Investigator' | 'Proposal';
  targetId: string;
  details: string;
}

export interface ProposalApprovalState {
  status: 'Pending Review' | 'Approved' | 'Revisions Requested';
  reviewedBy: string;
  reviewerRole: string;
  reviewedAt: string | null;
  comments: string;
  approvedBudgetPkr: number;
}

export interface LabStatePayload {
  cases: ForensicCase[];
  evidence: EvidenceItem[];
  verifications: HashVerificationRecord[];
  custodyTransfers: CustodyTransfer[];
  investigators: Investigator[];
  notes: ExaminationNote[];
  auditLogs: AuditRecord[];
  proposalApproval: ProposalApprovalState;
}
