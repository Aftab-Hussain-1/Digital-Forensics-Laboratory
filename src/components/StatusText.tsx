import { AlertTriangle, CheckCircle2, Clock, FileCheck2, ShieldAlert } from 'lucide-react';
import type { CasePriority, CaseStatus, IntegrityStatus } from '../types/forensics';

export function CaseStatusLabel({ status }: { status: CaseStatus }) {
  switch (status) {
    case 'Intake':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-400 whitespace-nowrap">
          <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Intake</span>
        </span>
      );
    case 'In Examination':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-400 whitespace-nowrap">
          <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>In Examination</span>
        </span>
      );
    case 'Peer Review':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-400 whitespace-nowrap">
          <FileCheck2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Peer Review</span>
        </span>
      );
    case 'Closed':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 whitespace-nowrap">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Closed</span>
        </span>
      );
  }
}

export function IntegrityStatusLabel({ status }: { status: IntegrityStatus }) {
  switch (status) {
    case 'Verified Match':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 whitespace-nowrap">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Verified Match</span>
        </span>
      );
    case 'Pending Verification':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-400 whitespace-nowrap">
          <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Pending Verification</span>
        </span>
      );
    case 'Hash Mismatch':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-400 whitespace-nowrap">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Hash Mismatch</span>
        </span>
      );
  }
}

export function PriorityLabel({ priority }: { priority: CasePriority }) {
  switch (priority) {
    case 'Urgent':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-400 whitespace-nowrap">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Urgent</span>
        </span>
      );
    case 'High':
      return <span className="text-xs font-medium text-amber-400 whitespace-nowrap">High</span>;
    case 'Standard':
      return <span className="text-xs font-normal text-slate-400 whitespace-nowrap">Standard</span>;
  }
}
