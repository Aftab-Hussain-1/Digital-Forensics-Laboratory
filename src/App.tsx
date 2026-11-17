import {
  Activity,
  ArrowRightLeft,
  BookOpen,
  Calculator,
  Cpu,
  FileCheck,
  FolderKanban,
  HardDrive,
  LayoutDashboard,
  Menu,
  Server,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { CustodyView } from './components/CustodyView';
import { DashboardView, type ActiveTab } from './components/DashboardView';
import { EvidenceView } from './components/EvidenceView';
import { ExaminersNotesView } from './components/ExaminersNotesView';
import { ForensicAnalysisView } from './components/ForensicAnalysisView';
import { InvestigationWorkspaceView } from './components/InvestigationWorkspaceView';
import {
  ProposalBudgetView,
  ProposalInfraView,
  ProposalOverviewView,
} from './components/ProposalViews';
import { ReportsAuditView } from './components/ReportsAuditView';
import { Sha256VerifierView } from './components/Sha256VerifierView';
import type {
  CasePriority,
  CaseStatus,
  DivisionType,
  Investigator,
  LabStatePayload,
} from './types/forensics';

const LIMS_NAV: { id: ActiveTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Forensic Dashboard', icon: LayoutDashboard },
  { id: 'cases', label: 'Investigation Workspace', icon: FolderKanban },
  { id: 'evidence', label: 'Evidence Management', icon: HardDrive },
  { id: 'analysis', label: 'Forensic Analysis', icon: Cpu },
  { id: 'verify', label: 'SHA-256 Verification', icon: ShieldCheck },
  { id: 'custody', label: 'Chain of Custody', icon: ArrowRightLeft },
  { id: 'examiners', label: 'Examiners & Notes', icon: Users },
  { id: 'reports', label: 'Reports & Audit', icon: FileCheck },
];

const PROPOSAL_NAV: { id: ActiveTab; label: string; icon: typeof BookOpen }[] = [
  { id: 'proposal-overview', label: 'Proposal Overview', icon: BookOpen },
  { id: 'proposal-infra', label: 'Infrastructure & Tools', icon: Server },
  { id: 'proposal-budget', label: 'Budget & Timeline', icon: Calculator },
];

const BREADCRUMB_LABELS: Record<ActiveTab, string> = {
  dashboard: 'Forensics Platform / Dashboard',
  cases: 'Case Management / Investigation Workspace & Timeline',
  evidence: 'Evidence Management / Inventory & Inline Details',
  analysis: 'Forensic Analysis / Network, Memory & Disk Dashboard',
  verify: 'Integrity Assurance / SHA-256 File Verification',
  custody: 'Evidence Management / Chain of Custody',
  examiners: 'Lab Management / Examiners & Notes',
  reports: 'Compliance / Printable Reports & Audit Log',
  'proposal-overview': 'Project Proposal / Overview & Policy',
  'proposal-infra': 'Project Proposal / Infrastructure & Tools',
  'proposal-budget': 'Project Proposal / Budget, Timeline & Sign-Off',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [labState, setLabState] = useState<LabStatePayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [showCreateCaseModal, setShowCreateCaseModal] = useState<boolean>(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [preselectedVerifyEvidenceId, setPreselectedVerifyEvidenceId] = useState<string | undefined>(
    undefined
  );

  const loadLabState = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch('/api/lab');
      if (!res.ok) throw new Error(`Failed to load laboratory data (${res.status})`);
      const data = (await res.json()) as LabStatePayload;
      setLabState(data);
      setSelectedCaseId((prev) => prev || data.cases[0]?.id || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reach laboratory API.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLabState();
  }, [loadLabState]);

  const apiPost = async (url: string, body: unknown, method: 'POST' | 'PATCH' = 'POST') => {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.error || `Request failed (${res.status})`);
    }
    const nextState = (await res.json()) as LabStatePayload;
    setLabState(nextState);
  };

  const handleCreateCase = async (payload: {
    title: string;
    requestingParty: string;
    authorizationRef: string;
    division: DivisionType;
    priority: CasePriority;
    leadExaminerId: string;
    summary: string;
  }) => {
    await apiPost('/api/cases', payload);
  };

  const handleUpdateCase = async (
    id: string,
    patch: { status?: CaseStatus; completedPolicySteps?: number[] }
  ) => {
    await apiPost(`/api/cases/${id}`, patch, 'PATCH');
  };

  const handleCreateEvidence = async (payload: {
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
  }) => {
    await apiPost('/api/evidence', payload);
  };

  const handleLogVerification = async (payload: {
    evidenceId: string;
    fileName: string;
    fileSizeBytes: number;
    computedSha256: string;
    verifiedBy: string;
    notes: string;
  }) => {
    await apiPost('/api/verifications', payload);
  };

  const handleCreateTransfer = async (payload: {
    evidenceId: string;
    fromHolder: string;
    toHolder: string;
    purpose: string;
    sealNumber: string;
    authorizedBy: string;
    remarks: string;
  }) => {
    await apiPost('/api/custody', payload);
  };

  const handleAddNote = async (payload: {
    caseId: string;
    evidenceCode: string;
    examinerName: string;
    toolUsed: string;
    findingTitle: string;
    content: string;
  }) => {
    await apiPost('/api/notes', payload);
  };

  const handleAddInvestigator = async (payload: {
    fullName: string;
    roleTitle: string;
    division: Investigator['division'];
    certifications: string[];
    email: string;
    clearanceLevel: string;
  }) => {
    await apiPost('/api/investigators', payload);
  };

  const handleSaveApproval = async (payload: {
    status: 'Pending Review' | 'Approved' | 'Revisions Requested';
    reviewedBy: string;
    reviewerRole: string;
    comments: string;
    approvedBudgetPkr: number;
  }) => {
    await apiPost('/api/proposal/approval', payload);
  };

  const selectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex bg-[#0b0f17] text-slate-100">
      {/* Dark Enterprise Sidebar */}
      <aside className="no-print hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 bg-[#101622] border-r border-slate-800/90 sticky top-0 h-screen">
        <div className="px-5 py-4 border-b border-slate-800/90 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-sky-600/20 border border-sky-500/40 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-sky-400" aria-hidden="true" />
          </div>
          <span className="text-sm font-bold tracking-tight text-slate-100 whitespace-nowrap">
            Digital Forensics Lab
          </span>
        </div>

        <nav aria-label="Laboratory Navigation" className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div>
            <p className="px-3 mb-2 text-[11px] font-medium text-slate-500">Forensic Operations</p>
            <div className="space-y-0.5">
              {LIMS_NAV.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectTab(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                      active
                        ? 'bg-sky-600/15 text-sky-400 border border-sky-500/30'
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100 border border-transparent'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="px-3 mb-2 text-[11px] font-medium text-slate-500">Establishment Proposal</p>
            <div className="space-y-0.5">
              {PROPOSAL_NAV.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectTab(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                      active
                        ? 'bg-sky-600/15 text-sky-400 border border-sky-500/30'
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100 border border-transparent'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        <div className="px-5 py-3.5 border-t border-slate-800/90 text-[11px] text-slate-500">
          <p className="font-medium text-slate-300">ISO/IEC 17025 · 27001 · 27037</p>
          <p className="mt-0.5">Windows Forensics Prototype</p>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="no-print fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/70" onClick={() => setMobileMenuOpen(false)} />
          <aside className="relative z-10 w-72 bg-[#101622] h-full border-r border-slate-800 flex flex-col">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-100">Digital Forensics Lab</span>
              <button
                type="button"
                aria-label="Close navigation menu"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
              <div className="space-y-0.5">
                {LIMS_NAV.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => selectTab(item.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium rounded-lg ${
                        activeTab === item.id
                          ? 'bg-sky-600/20 text-sky-400'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
              <div className="space-y-0.5 pt-3 border-t border-slate-800">
                {PROPOSAL_NAV.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => selectTab(item.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium rounded-lg ${
                        activeTab === item.id
                          ? 'bg-sky-600/20 text-sky-400'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content Shell */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar Contract: Breadcrumb on left, 1 primary CTA on right */}
        <header className="no-print h-13 bg-[#101622] border-b border-slate-800/90 px-4 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              aria-label="Open navigation menu"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-md"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-xs font-medium text-slate-400 truncate">
              {BREADCRUMB_LABELS[activeTab]}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                setActiveTab('cases');
                setShowCreateCaseModal(true);
              }}
              className="px-3.5 py-1.5 text-xs font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-500 transition-colors whitespace-nowrap shrink-0"
            >
              Register Case
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-7 max-w-[1400px] w-full mx-auto">
          {loading ? (
            <div className="space-y-6">
              <div className="h-8 w-72 bg-slate-800 rounded animate-pulse" />
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-4 h-64 bg-[#131a26] border border-slate-800 rounded-lg animate-pulse" />
                <div className="lg:col-span-8 h-64 bg-[#131a26] border border-slate-800 rounded-lg animate-pulse" />
              </div>
            </div>
          ) : error || !labState ? (
            <div className="bg-[#131a26] border border-rose-800/60 rounded-lg p-6 max-w-lg">
              <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
                <Activity className="w-4 h-4" aria-hidden="true" />
                <span>Laboratory Data Unavailable</span>
              </div>
              <p className="mt-2 text-xs text-slate-400">{error || 'Unable to load laboratory records.'}</p>
              <button
                type="button"
                onClick={loadLabState}
                className="mt-4 px-4 py-2 text-xs font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-500"
              >
                Retry Connection
              </button>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  state={labState}
                  onNavigate={selectTab}
                  onOpenNewCase={() => {
                    setActiveTab('cases');
                    setShowCreateCaseModal(true);
                  }}
                  onSelectCaseInWorkspace={(caseId) => {
                    setSelectedCaseId(caseId);
                    setActiveTab('cases');
                  }}
                />
              )}
              {activeTab === 'cases' && (
                <InvestigationWorkspaceView
                  state={labState}
                  selectedCaseId={selectedCaseId}
                  onSelectCaseId={setSelectedCaseId}
                  onCreateCase={handleCreateCase}
                  onUpdateCase={handleUpdateCase}
                  showCreateModal={showCreateCaseModal}
                  setShowCreateModal={setShowCreateCaseModal}
                />
              )}
              {activeTab === 'evidence' && (
                <EvidenceView
                  state={labState}
                  onCreateEvidence={handleCreateEvidence}
                  onVerifyEvidence={(evId) => {
                    setPreselectedVerifyEvidenceId(evId);
                    setActiveTab('verify');
                  }}
                />
              )}
              {activeTab === 'analysis' && <ForensicAnalysisView />}
              {activeTab === 'verify' && (
                <Sha256VerifierView
                  state={labState}
                  preselectedEvidenceId={preselectedVerifyEvidenceId}
                  onLogVerification={handleLogVerification}
                />
              )}
              {activeTab === 'custody' && (
                <CustodyView state={labState} onCreateTransfer={handleCreateTransfer} />
              )}
              {activeTab === 'examiners' && (
                <ExaminersNotesView
                  state={labState}
                  onAddNote={handleAddNote}
                  onAddInvestigator={handleAddInvestigator}
                />
              )}
              {activeTab === 'reports' && <ReportsAuditView state={labState} />}
              {activeTab === 'proposal-overview' && <ProposalOverviewView />}
              {activeTab === 'proposal-infra' && <ProposalInfraView />}
              {activeTab === 'proposal-budget' && (
                <ProposalBudgetView state={labState} onSaveApproval={handleSaveApproval} />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
