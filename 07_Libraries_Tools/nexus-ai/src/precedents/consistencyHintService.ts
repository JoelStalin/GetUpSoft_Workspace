import { createHash } from "node:crypto";

export type ChangeIntent = {
  intent: string;
  stack: string;
  filesAffected: string[];
};

export type PrecedentRecord = ChangeIntent & {
  sourceProject: string;
};

export type PrecedentPacket = {
  fingerprint: string;
  precedent?: PrecedentRecord;
};

export class ConsistencyHintService {
  private readonly byFingerprint = new Map<string, PrecedentRecord>();

  register(record: PrecedentRecord): string {
    const fingerprint = this.fingerprint(record);
    this.byFingerprint.set(fingerprint, record);
    return fingerprint;
  }

  resolve(change: ChangeIntent): PrecedentPacket {
    const fingerprint = this.fingerprint(change);
    return {
      fingerprint,
      precedent: this.byFingerprint.get(fingerprint),
    };
  }

  fingerprint(change: ChangeIntent): string {
    const stableFiles = [...change.filesAffected].sort().join("|");
    const seed = `${change.intent}::${change.stack}::${stableFiles}`;
    return createHash("sha256").update(seed).digest("hex");
  }
}
