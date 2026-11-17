# Digital Forensics Laboratory (DFIL) — LIMS & Disk Forensics Workbench

A dark-themed enterprise **Digital Forensics Laboratory Management System (LIMS)**, **Phase 2 Disk Forensics Engine (Autopsy / The Sleuth Kit)**, and **Executive Establishment Proposal Portal** built with React, TypeScript, Tailwind CSS, and an Express persistence backend.

---

## 1. Prerequisites (Windows 11 / macOS / Linux)

- **Node.js**: Version `20 LTS` or newer (includes `npm`)
- **Browser**: Modern Chromium, Edge, or Firefox (uses the native Web Crypto API for local SHA-256 hashing)

Verify Node.js and npm are installed in PowerShell / Terminal:

```powershell
node -v
npm -v
```

---

## 2. How to Install & Run Locally

### Step 1: Install dependencies

Open PowerShell (or VS Code integrated terminal) in the project root directory and run:

```powershell
npm install
```

### Step 2: Start the development server

```powershell
npm run dev
```

This starts the Express backend API and Vite frontend together on **port 3000**:

- **Application URL**: `http://localhost:3000`
- **Lab API Endpoint**: `http://localhost:3000/api/lab`

### Step 3: Build & run in production mode

```powershell
npm run build
```

On **Windows PowerShell**, start the production server with:

```powershell
$env:NODE_ENV="production"; npm start
```

On **macOS / Linux**, start the production server with:

```bash
NODE_ENV=production npm start
```

### Step 4: Type-check the codebase

```powershell
npm run lint
```

---

## 3. Implemented Modules

### Phase 1 — Core Laboratory Platform
- **Forensic Dashboard**: Case Load Assignments donut chart, 12-month Cases & Evidence activity trend chart, Active Case Queue, Pending Forensic Tasks, and Evidence Integrity Snapshot.
- **Investigation Workspace & Case Management**: Register cases, transition case stages (`Intake` → `In Examination` → `Peer Review` → `Closed`), track the 10-step Digital Evidence Handling Policy checklist, and inspect the 4-lane **Case Swimlane Timeline**.
- **Evidence Management**: Expandable high-density evidence inventory with inline acquisition details, vault locations, forensic copy IDs, and baseline SHA-256 + MD5 digests.
- **SHA-256 & MD5 Cryptographic Verifier**: Compute real SHA-256 (Web Crypto API) and MD5 (RFC 1321) digests locally in-browser for any uploaded file or text buffer, compare against stored evidence baselines, and log match/mismatch results.
- **Chain of Custody**: Log tamper-evident physical/logical custody transfers and automatically update the active custodian.
- **Examiners & Notes**: Manage the 7-role laboratory roster and record timestamped examination findings attributed to validated tools.
- **Reports & Audit Log**: Generate print/PDF-ready Case Examination & Chain-of-Custody reports, export Markdown dossiers, and download CSV audit logs.

### Phase 2 — Disk Forensics Engine (Autopsy & The Sleuth Kit)
- **File System & Deleted File Explorer (`fls` / `icat`)**: Browse NTFS `$MFT` records, deleted/unallocated files, MACB timestamps, dual SHA-256/MD5 hashes, and header hex previews.
- **Partition Layout Inspector (`mmls`)**: Interactive LBA sector map and partition table across EFI, MSR, NTFS, and Recovery volumes.
- **Live Binary & Disk Image Parser**: Inspect uploaded local `.img`/`.dd` files, registry hives (`regf`), EVTX logs (`ElfFile`), SQLite databases, or run the built-in **Test MBR Disk Sample** to parse `0x55AA` MBR partition tables, Shannon entropy, Sector 0 hex/ASCII dumps, and printable ASCII strings.
- **Direct Case Logging**: Save disk or binary findings directly to the active case's Examination Notes and Timeline.

### Project Proposal Portal
- **Proposal Overview**, **Infrastructure & Tools**, and **Budget & Timeline** (interactive PKR `9,735,000` budget modeler, 18-week Gantt schedule, ISO/IEC 17025 / 27001 / 27037 compliance framework, risk register, and persisted management approval sign-off).

---

## 4. Data Persistence & API Routes

All laboratory state is stored locally in `data/forensics_lab_state.json` (auto-created on first launch with realistic seed data).

| Method | Endpoint | Purpose |
| :--- | :--- | :--- |
| `GET` | `/api/lab` | Fetch full laboratory state (cases, evidence, hashes, custody, staff, notes, audit log) |
| `POST` | `/api/cases` | Register a new forensic investigation case |
| `PATCH` | `/api/cases/:id` | Update case status or 10-step policy checklist |
| `POST` | `/api/evidence` | Register a new evidence item with baseline SHA-256 / MD5 |
| `POST` | `/api/verifications` | Log a SHA-256 / MD5 file verification result |
| `POST` | `/api/custody` | Record a chain-of-custody transfer event |
| `POST` | `/api/notes` | Add an examination note or disk forensics finding |
| `POST` | `/api/investigators` | Add laboratory personnel |
| `POST` | `/api/proposal/approval` | Record management review decision for the proposal |

---

## 5. Security & Operational Notice

This local prototype is intended for **authorized test evidence and internal evaluation on localhost**. Do not expose the server directly to untrusted networks without adding authentication, TLS termination, and an isolated examination environment.
