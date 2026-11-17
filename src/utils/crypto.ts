export async function computeSha256FromFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  return bufferToHex(hashBuffer);
}

export async function computeSha256FromText(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return bufferToHex(hashBuffer);
}

export async function computeDualHashesFromFile(
  file: File
): Promise<{ sha256: string; md5: string; buffer: ArrayBuffer }> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const sha256 = bufferToHex(hashBuffer);
  const md5 = computeMd5FromBytes(new Uint8Array(buffer));
  return { sha256, md5, buffer };
}

export async function computeDualHashesFromText(
  text: string
): Promise<{ sha256: string; md5: string }> {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
  const sha256 = bufferToHex(hashBuffer);
  const md5 = computeMd5FromBytes(bytes);
  return { sha256, md5 };
}

function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Pure RFC 1321 MD5 for local forensic verification (zero external dependencies)
export function computeMd5FromBytes(input: Uint8Array): string {
  const s = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
  ];
  const K = new Uint32Array(64);
  for (let i = 0; i < 64; i++) {
    K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000) >>> 0;
  }

  const origLen = input.length;
  const bitLen = BigInt(origLen) * 8n;
  const padLen = ((56 - ((origLen + 1) % 64)) + 64) % 64;
  const padded = new Uint8Array(origLen + 1 + padLen + 8);
  padded.set(input, 0);
  padded[origLen] = 0x80;

  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 8, Number(bitLen & 0xffffffffn), true);
  view.setUint32(padded.length - 4, Number((bitLen >> 32n) & 0xffffffffn), true);

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;

  for (let offset = 0; offset < padded.length; offset += 64) {
    const M = new Uint32Array(16);
    for (let j = 0; j < 16; j++) {
      M[j] = view.getUint32(offset + j * 4, true);
    }

    let A = a0;
    let B = b0;
    let C = c0;
    let D = d0;

    for (let i = 0; i < 64; i++) {
      let F = 0;
      let g = 0;
      if (i < 16) {
        F = (B & C) | (~B & D);
        g = i;
      } else if (i < 32) {
        F = (D & B) | (~D & C);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        F = B ^ C ^ D;
        g = (3 * i + 5) % 16;
      } else {
        F = C ^ (B | ~D);
        g = (7 * i) % 16;
      }
      F = (F + A + K[i] + M[g]) >>> 0;
      A = D;
      D = C;
      C = B;
      B = (B + ((F << s[i]) | (F >>> (32 - s[i])))) >>> 0;
    }

    a0 = (a0 + A) >>> 0;
    b0 = (b0 + B) >>> 0;
    c0 = (c0 + C) >>> 0;
    d0 = (d0 + D) >>> 0;
  }

  const out = new DataView(new ArrayBuffer(16));
  out.setUint32(0, a0, true);
  out.setUint32(4, b0, true);
  out.setUint32(8, c0, true);
  out.setUint32(12, d0, true);
  return bufferToHex(out.buffer);
}

export interface BinaryInspectionResult {
  fileName: string;
  sizeBytes: number;
  detectedSignature: string;
  entropy: number;
  mbrPartitions: {
    slot: number;
    bootable: boolean;
    typeHex: string;
    typeLabel: string;
    startLba: number;
    sectors: number;
  }[];
  hexDumpLines: { offset: string; hex: string; ascii: string }[];
  extractedStrings: string[];
}

const MBR_TYPE_MAP: Record<number, string> = {
  0x07: 'NTFS / exFAT',
  0x0b: 'FAT32 (CHS)',
  0x0c: 'FAT32 (LBA)',
  0x82: 'Linux Swap',
  0x83: 'Linux EXT2/3/4',
  0xee: 'GPT Protective MBR',
  0xef: 'EFI System Partition',
};

export function inspectBinaryBuffer(buffer: ArrayBuffer, fileName: string): BinaryInspectionResult {
  const bytes = new Uint8Array(buffer);
  const sizeBytes = bytes.length;

  // Magic byte detection
  let detectedSignature = 'Raw Binary / Unstructured Stream';
  const startsWithAscii = (sig: string, at = 0) => {
    if (bytes.length < at + sig.length) return false;
    for (let i = 0; i < sig.length; i++) {
      if (bytes[at + i] !== sig.charCodeAt(i)) return false;
    }
    return true;
  };

  if (startsWithAscii('EVF\x09\x0d\x0a\xff\x00')) {
    detectedSignature = 'EnCase Forensic Disk Image (E01 / EWF)';
  } else if (startsWithAscii('NTFS    ', 3)) {
    detectedSignature = 'NTFS Volume Boot Record ($Boot)';
  } else if (startsWithAscii('EFI PART', 512)) {
    detectedSignature = 'GUID Partition Table (GPT Disk Image)';
  } else if (bytes.length >= 512 && bytes[510] === 0x55 && bytes[511] === 0xaa) {
    detectedSignature = 'x86 Master Boot Record (MBR 0x55AA)';
  } else if (startsWithAscii('SQLite format 3')) {
    detectedSignature = 'SQLite 3 Database File';
  } else if (startsWithAscii('regf')) {
    detectedSignature = 'Windows Registry Hive (regf)';
  } else if (startsWithAscii('ElfFile')) {
    detectedSignature = 'Windows XML Event Log (.evtx)';
  } else if (startsWithAscii('MZ')) {
    detectedSignature = 'Windows PE Executable / DLL (MZ)';
  } else if (startsWithAscii('%PDF')) {
    detectedSignature = 'PDF Document (%PDF)';
  } else if (startsWithAscii('PK\x03\x04')) {
    detectedSignature = 'ZIP / Office OpenXML Archive';
  }

  // MBR Partition Table parsing
  const mbrPartitions: BinaryInspectionResult['mbrPartitions'] = [];
  if (bytes.length >= 512 && bytes[510] === 0x55 && bytes[511] === 0xaa) {
    const view = new DataView(buffer);
    for (let i = 0; i < 4; i++) {
      const base = 446 + i * 16;
      const status = bytes[base];
      const partType = bytes[base + 4];
      const startLba = view.getUint32(base + 8, true);
      const sectors = view.getUint32(base + 12, true);
      if (partType !== 0 && sectors > 0) {
        mbrPartitions.push({
          slot: i + 1,
          bootable: status === 0x80,
          typeHex: `0x${partType.toString(16).padStart(2, '0').toUpperCase()}`,
          typeLabel: MBR_TYPE_MAP[partType] || 'Other Partition',
          startLba,
          sectors,
        });
      }
    }
  }

  // Shannon Entropy (bits per byte) on first 2MB sample
  const sampleLimit = Math.min(bytes.length, 2 * 1024 * 1024);
  const counts = new Uint32Array(256);
  for (let i = 0; i < sampleLimit; i++) {
    counts[bytes[i]]++;
  }
  let entropy = 0;
  if (sampleLimit > 0) {
    for (let i = 0; i < 256; i++) {
      if (counts[i] > 0) {
        const p = counts[i] / sampleLimit;
        entropy -= p * Math.log2(p);
      }
    }
  }

  // Hex + ASCII dump of first 512 bytes (Sector 0)
  const dumpLen = Math.min(bytes.length, 512);
  const hexDumpLines: BinaryInspectionResult['hexDumpLines'] = [];
  for (let row = 0; row < dumpLen; row += 16) {
    const slice = bytes.slice(row, Math.min(row + 16, dumpLen));
    const hex = Array.from(slice)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join(' ');
    const ascii = Array.from(slice)
      .map((b) => (b >= 32 && b <= 126 ? String.fromCharCode(b) : '.'))
      .join('');
    hexDumpLines.push({
      offset: `0x${row.toString(16).padStart(4, '0').toUpperCase()}`,
      hex,
      ascii,
    });
  }

  // Extract printable ASCII strings >= 5 chars (first 256KB)
  const stringLimit = Math.min(bytes.length, 256 * 1024);
  const extractedStrings: string[] = [];
  let current = '';
  for (let i = 0; i < stringLimit; i++) {
    const b = bytes[i];
    if (b >= 32 && b <= 126) {
      current += String.fromCharCode(b);
    } else {
      if (current.length >= 5) {
        extractedStrings.push(current);
        if (extractedStrings.length >= 36) break;
      }
      current = '';
    }
  }
  if (current.length >= 5 && extractedStrings.length < 36) {
    extractedStrings.push(current);
  }

  return {
    fileName,
    sizeBytes,
    detectedSignature,
    entropy: Number(entropy.toFixed(3)),
    mbrPartitions,
    hexDumpLines,
    extractedStrings,
  };
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const idx = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, idx);
  return `${value.toFixed(idx === 0 ? 0 : 2)} ${units[idx]}`;
}

export function formatPkr(amount: number): string {
  return `PKR ${amount.toLocaleString('en-US')}`;
}
