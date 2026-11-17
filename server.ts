import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { readLabState, writeLabState } from './server/store.ts';
import type {
  CasePriority,
  CaseStatus,
  CustodyTransfer,
  DivisionType,
  EvidenceItem,
  ExaminationNote,
  ForensicCase,
  HashVerificationRecord,
  Investigator,
} from './src/types/forensics.ts';

const PORT = 3000;

function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  // Get full laboratory state
  app.get('/api/lab', (_req, res) => {
    const state = readLabState();
    res.json(state);
  });

  // Register a new case
  app.post('/api/cases', (req, res) => {
    const {
      title,
      requestingParty,
      authorizationRef,
      division,
      priority,
      leadExaminerId,
      summary,
      actor,
    } = req.body as {
      title: string;
      requestingParty: string;
      authorizationRef: string;
      division: DivisionType;
      priority: CasePriority;
      leadExaminerId: string;
      summary: string;
      actor?: string;
    };

    if (!title?.trim() || !requestingParty?.trim() || !authorizationRef?.trim()) {
      res.status(400).json({ error: 'Title, requesting party, and authorization reference are required.' });
      return;
    }

    const state = readLabState();
    const examiner = state.investigators.find((i) => i.id === leadExaminerId) ?? state.investigators[1];
    const nextNum = state.cases.length + 1;
    const caseNumber = `DFL-2026-${String(nextNum).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const newCase: ForensicCase = {
      id: makeId('case'),
      caseNumber,
      title: title.trim(),
      requestingParty: requestingParty.trim(),
      authorizationRef: authorizationRef.trim(),
      division,
      priority: priority || 'Standard',
      status: 'Intake',
      leadExaminerId: examiner.id,
      leadExaminerName: examiner.fullName,
      openedAt: now,
      updatedAt: now,
      summary: summary?.trim() || 'Authorized forensic examination registered via LIMS intake.',
      completedPolicySteps: [1],
    };

    state.cases.unshift(newCase);
    state.auditLogs.unshift({
      id: makeId('aud'),
      timestamp: now,
      actor: actor || examiner.fullName,
      action: 'CASE_REGISTERED',
      targetType: 'Case',
      targetId: caseNumber,
      details: `Registered ${division} case "${newCase.title}" (${authorizationRef}).`,
    });

    writeLabState(state);
    res.status(201).json(state);
  });

  // Update case status or policy steps
  app.patch('/api/cases/:id', (req, res) => {
    const { id } = req.params;
    const { status, completedPolicySteps, actor } = req.body as {
      status?: CaseStatus;
      completedPolicySteps?: number[];
      actor?: string;
    };

    const state = readLabState();
    const target = state.cases.find((c) => c.id === id);
    if (!target) {
      res.status(404).json({ error: 'Case not found.' });
      return;
    }

    const now = new Date().toISOString();
    const prevStatus = target.status;

    if (status) {
      target.status = status;
    }
    if (Array.isArray(completedPolicySteps)) {
      target.completedPolicySteps = completedPolicySteps;
    }
    target.updatedAt = now;

    if (status && status !== prevStatus) {
      state.auditLogs.unshift({
        id: makeId('aud'),
        timestamp: now,
        actor: actor || target.leadExaminerName,
        action: 'CASE_STATUS_UPDATED',
        targetType: 'Case',
        targetId: target.caseNumber,
        details: `Case status changed from ${prevStatus} to ${status}.`,
      });
    }

    writeLabState(state);
    res.json(state);
  });

  // Register new evidence item
  app.post('/api/evidence', (req, res) => {
    const {
      caseId,
      description,
      mediaType,
      serialNumber,
      receivedCondition,
      sourceOwner,
      receivingOfficer,
      acquisitionMethod,
      forensicCopyId,
      storageLocation,
      baselineSha256,
      baselineMd5,
      sealNumber,
    } = req.body as Partial<EvidenceItem> & { sealNumber?: string };

    if (!caseId || !description?.trim() || !baselineSha256?.trim()) {
      res.status(400).json({ error: 'Case, description, and baseline SHA-256 digest are required.' });
      return;
    }

    const normalizedHash = baselineSha256.trim().toLowerCase();
    if (!/^[a-f0-9]{64}$/.test(normalizedHash)) {
      res.status(400).json({ error: 'Baseline SHA-256 must be a valid 64-character hexadecimal digest.' });
      return;
    }

    const state = readLabState();
    const parentCase = state.cases.find((c) => c.id === caseId);
    if (!parentCase) {
      res.status(404).json({ error: 'Linked case not found.' });
      return;
    }

    const now = new Date().toISOString();
    const nextNum = state.evidence.length + 1;
    const evidenceCode = `EVD-2026-${String(nextNum).padStart(3, '0')}`;
    const officer = receivingOfficer?.trim() || 'Hina Farooq';
    const seal = sealNumber?.trim() || `TE-${90100 + nextNum}`;

    const newItem: EvidenceItem = {
      id: makeId('evd'),
      evidenceCode,
      caseId: parentCase.id,
      caseNumber: parentCase.caseNumber,
      description: description.trim(),
      mediaType: mediaType?.trim() || 'Storage Media',
      serialNumber: serialNumber?.trim() || 'UNSPECIFIED-SN',
      receivedCondition: receivedCondition?.trim() || 'Intact, sealed upon receipt',
      sourceOwner: sourceOwner?.trim() || parentCase.requestingParty,
      receivingOfficer: officer,
      receivedAt: now,
      acquisitionMethod: acquisitionMethod?.trim() || 'Hardware Write-Blocker + FTK Imager',
      forensicCopyId: forensicCopyId?.trim() || `IMG-2026-${String(nextNum).padStart(3, '0')}`,
      storageLocation: storageLocation?.trim() || `Vault Cabinet A · Bag #${seal}`,
      currentCustodian: `${officer} (Intake)`,
      baselineSha256: normalizedHash,
      baselineMd5: baselineMd5?.trim().toLowerCase() || undefined,
      lastVerifiedSha256: null,
      lastVerifiedAt: null,
      integrityStatus: 'Pending Verification',
      verificationCount: 0,
    };

    state.evidence.unshift(newItem);
    state.custodyTransfers.unshift({
      id: makeId('coc'),
      evidenceId: newItem.id,
      evidenceCode,
      caseNumber: parentCase.caseNumber,
      transferredAt: now,
      fromHolder: newItem.sourceOwner,
      toHolder: officer,
      purpose: 'Initial Evidence Intake & Sealing',
      sealNumber: seal,
      authorizedBy: 'Tariq Mahmood',
      remarks: `Condition logged: ${newItem.receivedCondition}`,
    });

    state.auditLogs.unshift({
      id: makeId('aud'),
      timestamp: now,
      actor: officer,
      action: 'EVIDENCE_INTAKE',
      targetType: 'Evidence',
      targetId: evidenceCode,
      details: `Registered ${newItem.description} under ${parentCase.caseNumber} with SHA-256 ${normalizedHash.slice(0, 12)}...`,
    });

    writeLabState(state);
    res.status(201).json(state);
  });

  // Log a SHA-256 & MD5 verification result
  app.post('/api/verifications', (req, res) => {
    const { evidenceId, fileName, fileSizeBytes, computedSha256, computedMd5, verifiedBy, notes } = req.body as {
      evidenceId: string;
      fileName: string;
      fileSizeBytes: number;
      computedSha256: string;
      computedMd5?: string;
      verifiedBy: string;
      notes?: string;
    };

    const state = readLabState();
    const item = state.evidence.find((e) => e.id === evidenceId);
    if (!item) {
      res.status(404).json({ error: 'Evidence item not found.' });
      return;
    }

    const cleanComputed = computedSha256.trim().toLowerCase();
    if (!/^[a-f0-9]{64}$/.test(cleanComputed)) {
      res.status(400).json({ error: 'Computed SHA-256 must be a 64-character hex string.' });
      return;
    }

    const now = new Date().toISOString();
    const matched = cleanComputed === item.baselineSha256.toLowerCase();

    const record: HashVerificationRecord = {
      id: makeId('ver'),
      evidenceId: item.id,
      evidenceCode: item.evidenceCode,
      caseNumber: item.caseNumber,
      fileName: fileName || 'manual-digest-check',
      fileSizeBytes: Number(fileSizeBytes) || 0,
      computedSha256: cleanComputed,
      computedMd5: computedMd5?.trim().toLowerCase() || undefined,
      expectedSha256: item.baselineSha256,
      matched,
      verifiedBy: verifiedBy?.trim() || 'Ayesha Siddiqui',
      verifiedAt: now,
      notes: notes?.trim() || (matched ? 'Cryptographic SHA-256 digest matches baseline intake hash.' : 'ALERT: Computed digest differs from baseline intake hash.'),
    };

    item.lastVerifiedSha256 = cleanComputed;
    item.lastVerifiedAt = now;
    item.verificationCount += 1;
    item.integrityStatus = matched ? 'Verified Match' : 'Hash Mismatch';

    state.verifications.unshift(record);
    state.auditLogs.unshift({
      id: makeId('aud'),
      timestamp: now,
      actor: record.verifiedBy,
      action: matched ? 'SHA256_MATCH' : 'SHA256_MISMATCH_ALERT',
      targetType: 'HashVerification',
      targetId: item.evidenceCode,
      details: `${matched ? 'MATCH' : 'MISMATCH'} on "${record.fileName}" (${cleanComputed.slice(0, 12)}...).`,
    });

    writeLabState(state);
    res.status(201).json(state);
  });

  // Record a Chain-of-Custody transfer
  app.post('/api/custody', (req, res) => {
    const { evidenceId, fromHolder, toHolder, purpose, sealNumber, authorizedBy, remarks } = req.body as {
      evidenceId: string;
      fromHolder: string;
      toHolder: string;
      purpose: string;
      sealNumber: string;
      authorizedBy: string;
      remarks?: string;
    };

    const state = readLabState();
    const item = state.evidence.find((e) => e.id === evidenceId);
    if (!item) {
      res.status(404).json({ error: 'Evidence item not found.' });
      return;
    }

    if (!fromHolder?.trim() || !toHolder?.trim() || !purpose?.trim()) {
      res.status(400).json({ error: 'From holder, to holder, and transfer purpose are required.' });
      return;
    }

    const now = new Date().toISOString();
    const transfer: CustodyTransfer = {
      id: makeId('coc'),
      evidenceId: item.id,
      evidenceCode: item.evidenceCode,
      caseNumber: item.caseNumber,
      transferredAt: now,
      fromHolder: fromHolder.trim(),
      toHolder: toHolder.trim(),
      purpose: purpose.trim(),
      sealNumber: sealNumber?.trim() || 'SEAL-VERIFIED',
      authorizedBy: authorizedBy?.trim() || 'Tariq Mahmood',
      remarks: remarks?.trim() || 'Custody transfer verified and logged.',
    };

    item.currentCustodian = transfer.toHolder;
    state.custodyTransfers.unshift(transfer);
    state.auditLogs.unshift({
      id: makeId('aud'),
      timestamp: now,
      actor: transfer.authorizedBy,
      action: 'CUSTODY_TRANSFERRED',
      targetType: 'Custody',
      targetId: item.evidenceCode,
      details: `${item.evidenceCode} transferred from ${transfer.fromHolder} to ${transfer.toHolder} (${transfer.purpose}).`,
    });

    writeLabState(state);
    res.status(201).json(state);
  });

  // Add an examination note
  app.post('/api/notes', (req, res) => {
    const { caseId, evidenceCode, examinerName, toolUsed, findingTitle, content } = req.body as {
      caseId: string;
      evidenceCode: string;
      examinerName: string;
      toolUsed: string;
      findingTitle: string;
      content: string;
    };

    const state = readLabState();
    const parentCase = state.cases.find((c) => c.id === caseId);
    if (!parentCase) {
      res.status(404).json({ error: 'Case not found.' });
      return;
    }
    if (!findingTitle?.trim() || !content?.trim()) {
      res.status(400).json({ error: 'Finding title and examination note content are required.' });
      return;
    }

    const now = new Date().toISOString();
    const note: ExaminationNote = {
      id: makeId('note'),
      caseId: parentCase.id,
      caseNumber: parentCase.caseNumber,
      evidenceCode: evidenceCode?.trim() || 'Case-Wide',
      examinerName: examinerName?.trim() || parentCase.leadExaminerName,
      toolUsed: toolUsed?.trim() || 'Autopsy / Validated Utility',
      createdAt: now,
      findingTitle: findingTitle.trim(),
      content: content.trim(),
    };

    parentCase.updatedAt = now;
    state.notes.unshift(note);
    state.auditLogs.unshift({
      id: makeId('aud'),
      timestamp: now,
      actor: note.examinerName,
      action: 'EXAMINATION_NOTE_ADDED',
      targetType: 'Note',
      targetId: parentCase.caseNumber,
      details: `Added examination note "${note.findingTitle}" using ${note.toolUsed}.`,
    });

    writeLabState(state);
    res.status(201).json(state);
  });

  // Add investigator record
  app.post('/api/investigators', (req, res) => {
    const { fullName, roleTitle, division, certifications, email, clearanceLevel } = req.body as {
      fullName: string;
      roleTitle: string;
      division: Investigator['division'];
      certifications: string[];
      email: string;
      clearanceLevel: string;
    };

    if (!fullName?.trim() || !roleTitle?.trim()) {
      res.status(400).json({ error: 'Full name and role title are required.' });
      return;
    }

    const state = readLabState();
    const now = new Date().toISOString();
    const employeeCode = `DFL-EMP-${String(state.investigators.length + 1).padStart(2, '0')}`;

    const newInvestigator: Investigator = {
      id: makeId('inv'),
      employeeCode,
      fullName: fullName.trim(),
      roleTitle: roleTitle.trim(),
      division,
      certifications: Array.isArray(certifications) ? certifications : [],
      email: email?.trim() || `${fullName.toLowerCase().replace(/\s+/g, '.')}@dfl-lab.org`,
      status: 'Active',
      clearanceLevel: clearanceLevel?.trim() || 'Level 2 — Examiner',
    };

    state.investigators.push(newInvestigator);
    state.auditLogs.unshift({
      id: makeId('aud'),
      timestamp: now,
      actor: 'Tariq Mahmood',
      action: 'PERSONNEL_ADDED',
      targetType: 'Investigator',
      targetId: employeeCode,
      details: `Registered personnel ${newInvestigator.fullName} (${newInvestigator.roleTitle}).`,
    });

    writeLabState(state);
    res.status(201).json(state);
  });

  // Update proposal approval status
  app.post('/api/proposal/approval', (req, res) => {
    const { status, reviewedBy, reviewerRole, comments, approvedBudgetPkr } = req.body as {
      status: 'Pending Review' | 'Approved' | 'Revisions Requested';
      reviewedBy: string;
      reviewerRole: string;
      comments: string;
      approvedBudgetPkr?: number;
    };

    const state = readLabState();
    const now = new Date().toISOString();

    state.proposalApproval = {
      status,
      reviewedBy: reviewedBy?.trim() || 'Executive Management Committee',
      reviewerRole: reviewerRole?.trim() || 'Management Approver',
      reviewedAt: now,
      comments: comments?.trim() || 'Reviewed proposal documentation.',
      approvedBudgetPkr: Number(approvedBudgetPkr) || 9735000,
    };

    state.auditLogs.unshift({
      id: makeId('aud'),
      timestamp: now,
      actor: state.proposalApproval.reviewedBy,
      action: 'PROPOSAL_REVIEW_UPDATED',
      targetType: 'Proposal',
      targetId: 'DFL-PROPOSAL-2026',
      details: `Proposal status set to "${status}" (${state.proposalApproval.approvedBudgetPkr.toLocaleString()} PKR).`,
    });

    writeLabState(state);
    res.json(state);
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Digital Forensics Laboratory server listening on http://localhost:${PORT}`);
  });
}

startServer();
